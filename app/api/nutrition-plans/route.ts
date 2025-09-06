import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase/server';

interface MealItem {
  food_item_id: string;
  quantity: number;
  notes?: string;
}

interface Meal {
  day_of_week: number;
  meal_type: string;
  meal_order?: number;
  items?: MealItem[];
}

// GET - Получаване на всички хранителни режими за треньора
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Не сте оторизиран' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    // Използваме новия изглед за по-богата информация
    let query = supabase
      .from('nutrition_plans')
      .select(`
        *,
        client:profiles!nutrition_plans_client_id_fkey(id, full_name, email),
        nutrition_plan_meals(
          id,
          day_of_week,
          meal_type,
          meal_order,
          nutrition_plan_meal_items(
            id,
            quantity,
            notes,
            food_item:food_items(
              id, name, calories_per_100g, protein_per_100g, 
              carbs_per_100g, fat_per_100g, fiber_per_100g, category
            )
          )
        )
      `)
      .eq('trainer_id', user.id)
      .order('created_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Грешка при извличане на хранителни режими:', error);
      return NextResponse.json({ error: 'Грешка при извличане на данните' }, { status: 500 });
    }

    return NextResponse.json({ plans: data || [] });
  } catch (error) {
    console.error('Неочаквана грешка:', error);
    return NextResponse.json({ error: 'Вътрешна грешка на сървъра' }, { status: 500 });
  }
}

// POST - Създаване на нов хранителен режим
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Не сте оторизиран' }, { status: 401 });
    }

    const body = await request.json();
    const {
      client_id,
      name,
      description,
      target_calories,
      target_protein,
      target_carbs,
      target_fat,
      plan_type,
      start_date,
      end_date,
      meals = []
    } = body;

    // Валидация
    if (!client_id || !name) {
      return NextResponse.json({ error: 'Клиент и име са задължителни' }, { status: 400 });
    }

    // Проверка дали клиентът принадлежи на треньора
    const { data: clientRelation } = await supabase
      .from('trainer_clients')
      .select('id')
      .eq('trainer_id', user.id)
      .eq('client_id', client_id)
      .eq('status', 'active')
      .single();

    if (!clientRelation) {
      return NextResponse.json({ error: 'Нямате достъп до този клиент' }, { status: 403 });
    }

    // Създаване на хранителен режим
    const { data: newPlan, error: planError } = await supabase
      .from('nutrition_plans')
      .insert([{
        client_id,
        trainer_id: user.id,
        name,
        description,
        target_calories: target_calories || null,
        target_protein: target_protein || null,
        target_carbs: target_carbs || null,
        target_fat: target_fat || null,
        plan_type: plan_type || 'weight_loss',
        start_date,
        end_date,
        is_active: true
      }])
      .select()
      .single();

    if (planError) {
      console.error('Грешка при създаване на хранителен режим:', planError);
      return NextResponse.json({ error: 'Грешка при създаване на режима' }, { status: 500 });
    }

    // Добавяне на ястията, ако има такива
    if (meals.length > 0) {
      const mealsToInsert = meals.map((meal: Meal) => ({
        nutrition_plan_id: newPlan.id,
        day_of_week: meal.day_of_week,
        meal_type: meal.meal_type,
        meal_order: meal.meal_order || 1
      }));

      const { data: insertedMeals, error: mealsError } = await supabase
        .from('nutrition_plan_meals')
        .insert(mealsToInsert)
        .select();

      if (mealsError) {
        console.error('Грешка при добавяне на ястия:', mealsError);
      }

      // Добавяне на храните в ястията
      if (insertedMeals) {
        const mealItems = [];
        for (let i = 0; i < meals.length; i++) {
          const meal = meals[i];
          const insertedMeal = insertedMeals[i];
          
          if (meal.items && meal.items.length > 0) {
            meal.items.forEach((item: MealItem) => {
              mealItems.push({
                meal_id: insertedMeal.id,
                food_item_id: item.food_item_id,
                quantity: item.quantity,
                notes: item.notes
              });
            });
          }
        }

        if (mealItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('nutrition_plan_meal_items')
            .insert(mealItems);

          if (itemsError) {
            console.error('Грешка при добавяне на храни в ястията:', itemsError);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      plan: newPlan,
      message: 'Хранителният режим е създаден успешно' 
    });

  } catch (error) {
    console.error('Неочаквана грешка:', error);
    return NextResponse.json({ error: 'Вътрешна грешка на сървъра' }, { status: 500 });
  }
}