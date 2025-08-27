import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase/server';

// POST - Копиране на хранения от един ден в други дни
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Не сте оторизиран' }, { status: 401 });
    }

    const planId = params.id;
    const body = await request.json();
    const { source_day, target_days } = body;

    // Валидация
    if (source_day === undefined || !Array.isArray(target_days) || target_days.length === 0) {
      return NextResponse.json({ error: 'Невалидни данни за копиране' }, { status: 400 });
    }

    // Проверка за достъп до плана
    const { data: plan, error: planError } = await supabase
      .from('nutrition_plans')
      .select('id, trainer_id, client_id')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Планът не е намерен' }, { status: 404 });
    }

    if (plan.trainer_id !== user.id) {
      return NextResponse.json({ error: 'Нямате права да редактирате този план' }, { status: 403 });
    }

    // Извличане на храненията от източника ден
    const { data: sourceMeals, error: sourceMealsError } = await supabase
      .from('nutrition_plan_meals')
      .select(`
        id,
        meal_type,
        meal_order,
        nutrition_plan_meal_items(
          id,
          food_item_id,
          quantity,
          notes
        )
      `)
      .eq('nutrition_plan_id', planId)
      .eq('day_of_week', source_day);

    if (sourceMealsError) {
      console.error('Грешка при извличане на храненията от източника ден:', sourceMealsError);
      return NextResponse.json({ error: 'Грешка при извличане на данните' }, { status: 500 });
    }

    if (!sourceMeals || sourceMeals.length === 0) {
      return NextResponse.json({ error: 'Няма хранения за копиране в избрания ден' }, { status: 400 });
    }

    // За всеки целеви ден
    for (const targetDay of target_days) {
      // Първо изтриваме съществуващите хранения за този ден
      const { error: deleteError } = await supabase
        .from('nutrition_plan_meals')
        .delete()
        .eq('nutrition_plan_id', planId)
        .eq('day_of_week', targetDay);

      if (deleteError) {
        console.error(`Грешка при изтриване на стари хранения за ден ${targetDay}:`, deleteError);
        continue;
      }

      // Копираме храненията от източника ден
      const mealsToInsert = sourceMeals.map(meal => ({
        nutrition_plan_id: planId,
        day_of_week: targetDay,
        meal_type: meal.meal_type,
        meal_order: meal.meal_order
      }));

      const { data: newMeals, error: insertMealsError } = await supabase
        .from('nutrition_plan_meals')
        .insert(mealsToInsert)
        .select('id, meal_type, meal_order');

      if (insertMealsError) {
        console.error(`Грешка при вмъкване на нови хранения за ден ${targetDay}:`, insertMealsError);
        continue;
      }

      // Копираме храните в ястията
      if (newMeals) {
        const mealItems = [];
        
        for (let i = 0; i < sourceMeals.length; i++) {
          const sourceMeal = sourceMeals[i];
          const newMeal = newMeals[i];
          
          if (sourceMeal.nutrition_plan_meal_items && sourceMeal.nutrition_plan_meal_items.length > 0) {
            sourceMeal.nutrition_plan_meal_items.forEach((item: any) => {
              mealItems.push({
                meal_id: newMeal.id,
                food_item_id: item.food_item_id,
                quantity: item.quantity,
                notes: item.notes
              });
            });
          }
        }

        if (mealItems.length > 0) {
          const { error: insertItemsError } = await supabase
            .from('nutrition_plan_meal_items')
            .insert(mealItems);

          if (insertItemsError) {
            console.error(`Грешка при вмъкване на храни в ястията за ден ${targetDay}:`, insertItemsError);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Храненията са копирани успешно от ден ${source_day} в ${target_days.length} дни`,
      source_day,
      target_days,
      copied_meals_count: sourceMeals.length
    });

  } catch (error) {
    console.error('Неочаквана грешка при копиране:', error);
    return NextResponse.json({ error: 'Вътрешна грешка на сървъра' }, { status: 500 });
  }
}