import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase/server';

// GET - Получаване на всички клиенти на треньора
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Не сте оторизиран' }, { status: 401 });
    }

    // Извличане на клиентите на треньора
    const { data: trainerClients, error: trainerClientsError } = await supabase
      .from('trainer_clients')
      .select('client_id, status')
      .eq('trainer_id', user.id)
      .eq('status', 'active');

    if (trainerClientsError) {
      console.error('Грешка при извличане на връзките с клиентите:', trainerClientsError);
      return NextResponse.json({ error: 'Грешка при извличане на данните' }, { status: 500 });
    }

    if (!trainerClients || trainerClients.length === 0) {
      return NextResponse.json({ clients: [] });
    }

    const clientIds = trainerClients.map(tc => tc.client_id);

    // Извличане на профилите на клиентите
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, phone, created_at')
      .in('id', clientIds)
      .order('full_name', { ascending: true });

    if (profilesError) {
      console.error('Грешка при извличане на профилите на клиентите:', profilesError);
      return NextResponse.json({ error: 'Грешка при извличане на данните' }, { status: 500 });
    }

    return NextResponse.json({ clients: profiles || [] });
  } catch (error) {
    console.error('Неочаквана грешка:', error);
    return NextResponse.json({ error: 'Вътрешна грешка на сървъра' }, { status: 500 });
  }
}