import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase/server';

// GET - Получаване на макроси за конкретен ден от хранителния режим
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Не сте оторизиран' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dayOfWeek = searchParams.get('day_of_week');

    // Проверка за достъп до плана
    const { data: plan, error: planError } = await supabase
      .from('nutrition_plans')
      .select('id, trainer_id, client_id')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Планът не е намерен' }, { status: 404 });
    }

    if (plan.trainer_id !== user.id && plan.client_id !== user.id) {
      return NextResponse.json({ error: 'Нямате достъп до този план' }, { status: 403 });
    }

    if (dayOfWeek !== null) {
      // Получаване на макроси за конкретен ден
      const { data, error } = await supabase
        .rpc('get_daily_macros', {
          plan_id: planId,
          day_of_week_param: parseInt(dayOfWeek)
        });

      if (error) {
        console.error('Грешка при извличане на дневни макроси:', error);
        return NextResponse.json({ error: 'Грешка при изчисляване на макросите' }, { status: 500 });
      }

      return NextResponse.json({ 
        day_of_week: parseInt(dayOfWeek),
        macros: data?.[0] || {
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          total_fiber: 0
        }
      });
    } else {
      // Получаване на макроси за цялата седмица (0-6 дни)
      const weeklyMacros = [];
      
      for (let day = 0; day <= 6; day++) {
        const { data, error } = await supabase
          .rpc('get_daily_macros', {
            plan_id: planId,
            day_of_week_param: day
          });

        if (error) {
          console.error(`Грешка при извличане на макроси за ден ${day}:`, error);
          weeklyMacros.push({
            day_of_week: day,
            macros: {
              total_calories: 0,
              total_protein: 0,
              total_carbs: 0,
              total_fat: 0,
              total_fiber: 0
            }
          });
        } else {
          weeklyMacros.push({
            day_of_week: day,
            macros: data?.[0] || {
              total_calories: 0,
              total_protein: 0,
              total_carbs: 0,
              total_fat: 0,
              total_fiber: 0
            }
          });
        }
      }

      // Изчисляване на средни стойности
      const averageMacros = {
        avg_calories: weeklyMacros.reduce((sum, day) => sum + parseFloat(day.macros.total_calories || '0'), 0) / 7,
        avg_protein: weeklyMacros.reduce((sum, day) => sum + parseFloat(day.macros.total_protein || '0'), 0) / 7,
        avg_carbs: weeklyMacros.reduce((sum, day) => sum + parseFloat(day.macros.total_carbs || '0'), 0) / 7,
        avg_fat: weeklyMacros.reduce((sum, day) => sum + parseFloat(day.macros.total_fat || '0'), 0) / 7,
        avg_fiber: weeklyMacros.reduce((sum, day) => sum + parseFloat(day.macros.total_fiber || '0'), 0) / 7
      };

      return NextResponse.json({ 
        weekly_macros: weeklyMacros,
        average_macros: averageMacros
      });
    }

  } catch (error) {
    console.error('Неочаквана грешка:', error);
    return NextResponse.json({ error: 'Вътрешна грешка на сървъра' }, { status: 500 });
  }
}