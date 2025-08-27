import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase/server';

// GET - Получаване на всички храни
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Не сте оторизиран' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase
      .from('food_items')
      .select('*')
      .order('name', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Грешка при извличане на храни:', error);
      return NextResponse.json({ error: 'Грешка при извличане на данните' }, { status: 500 });
    }

    return NextResponse.json({ foods: data || [] });
  } catch (error) {
    console.error('Неочаквана грешка:', error);
    return NextResponse.json({ error: 'Вътрешна грешка на сървъра' }, { status: 500 });
  }
}

// POST - Създаване на нова храна
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Не сте оторизиран' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      calories_per_100g,
      protein_per_100g,
      carbs_per_100g,
      fat_per_100g,
      fiber_per_100g,
      category
    } = body;

    // Валидация
    if (!name || !calories_per_100g) {
      return NextResponse.json({ error: 'Име и калории са задължителни' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('food_items')
      .insert([{
        name,
        calories_per_100g,
        protein_per_100g: protein_per_100g || 0,
        carbs_per_100g: carbs_per_100g || 0,
        fat_per_100g: fat_per_100g || 0,
        fiber_per_100g: fiber_per_100g || 0,
        category: category || 'other'
      }])
      .select()
      .single();

    if (error) {
      console.error('Грешка при създаване на храна:', error);
      return NextResponse.json({ error: 'Грешка при създаване на храната' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      food: data,
      message: 'Храната е добавена успешно' 
    });

  } catch (error) {
    console.error('Неочаквана грешка:', error);
    return NextResponse.json({ error: 'Вътрешна грешка на сървъра' }, { status: 500 });
  }
}