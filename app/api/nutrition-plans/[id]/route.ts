import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase/server';

// GET - Получаване на конкретен хранителен режим
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Не сте оторизиран' }, { status: 401 });
    }

    const { data, error } = await supabase
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
            food_item:food_items(*)
          )
        )
      `)
      .eq('id', params.id)
      .eq('trainer_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Хранителният режим не е намерен' }, { status: 404 });
      }
      console.error('Грешка при извличане на хранителен режим:', error);
      return NextResponse.json({ error: 'Грешка при извличане на данните' }, { status: 500 });
    }

    return NextResponse.json({ plan: data });
  } catch (error) {
    console.error('Неочаквана грешка:', error);
    return NextResponse.json({ error: 'Вътрешна грешка на сървъра' }, { status: 500 });
  }
}

// PUT - Обновяване на хранителен режим
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Не сте оторизиран' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      target_calories,
      target_protein,
      target_carbs,
      target_fat,
      plan_type,
      start_date,
      end_date,
      is_active
    } = body;

    // Валидация
    if (!name) {
      return NextResponse.json({ error: 'Името е задължително' }, { status: 400 });
    }

    // Обновяване на основните данни за режима
    const { data, error } = await supabase
      .from('nutrition_plans')
      .update({
        name,
        description,
        target_calories: target_calories || null,
        target_protein: target_protein || null,
        target_carbs: target_carbs || null,
        target_fat: target_fat || null,
        plan_type: plan_type || 'weight_loss',
        start_date,
        end_date,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('trainer_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Хранителният режим не е намерен' }, { status: 404 });
      }
      console.error('Грешка при обновяване на хранителен режим:', error);
      return NextResponse.json({ error: 'Грешка при обновяване' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      plan: data,
      message: 'Хранителният режим е обновен успешно' 
    });

  } catch (error) {
    console.error('Неочаквана грешка:', error);
    return NextResponse.json({ error: 'Вътрешна грешка на сървъра' }, { status: 500 });
  }
}

// DELETE - Изтриване на хранителен режим
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Не сте оторизиран' }, { status: 401 });
    }

    const { error } = await supabase
      .from('nutrition_plans')
      .delete()
      .eq('id', params.id)
      .eq('trainer_id', user.id);

    if (error) {
      console.error('Грешка при изтриване на хранителен режим:', error);
      return NextResponse.json({ error: 'Грешка при изтриване' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Хранителният режим е изтрит успешно' 
    });

  } catch (error) {
    console.error('Неочаквана грешка:', error);
    return NextResponse.json({ error: 'Вътрешна грешка на сървъра' }, { status: 500 });
  }
}