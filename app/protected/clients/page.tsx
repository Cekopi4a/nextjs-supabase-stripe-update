// ============================================
// 1. КОРИГИРАНА ВЕРСИЯ НА app/protected/clients/page.tsx
// ============================================

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Calendar,
  User,
  Mail,
  Phone,
  Target,
  TrendingUp,
  Activity,
  Plus,
  Eye,
  Settings,
  BarChart3,
  MessageSquare,
  Dumbbell
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  trainer_clients?: {
    status: string;
    created_at: string;
  };
  // Stats from queries
  active_programs_count?: number;
  completed_workouts_count?: number;
  last_workout_date?: string;
  current_goals_count?: number;
}

interface ClientStats {
  total_clients: number;
  active_clients: number;
  new_this_month: number;
  avg_weekly_workouts: number;
}

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchClients();
    fetchStats();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, selectedStatus]);

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Fetching clients for trainer:', user.id);

      // КОРИГИРАНА ЗАЯВКА - правилно извличане на клиенти
      const { data: trainerClients, error } = await supabase
        .from("trainer_clients")
        .select(`
          client_id,
          status,
          created_at
        `)
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching trainer clients:', error);
        throw error;
      }

      console.log('Trainer clients found:', trainerClients);

      if (!trainerClients || trainerClients.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }

      // Извличаме профилите на клиентите
      const clientIds = trainerClients.map(tc => tc.client_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", clientIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Client profiles found:', profiles);

      // Съчетаваме данните
      const clientsWithStats = await Promise.all(
        trainerClients.map(async (tc) => {
          const profile = profiles?.find(p => p.id === tc.client_id);
          if (!profile) return null;

          // Get additional stats for each client
          const [
            { count: activePrograms },
            { count: completedWorkouts },
            { data: lastWorkout },
            { count: currentGoals }
          ] = await Promise.all([
            supabase
              .from("workout_programs")
              .select("*", { count: 'exact', head: true })
              .eq("client_id", profile.id)
              .eq("is_active", true),
            
            supabase
              .from("workout_logs")
              .select("*", { count: 'exact', head: true })
              .eq("client_id", profile.id)
              .eq("completed", true),
            
            supabase
              .from("workout_logs")
              .select("date")
              .eq("client_id", profile.id)
              .eq("completed", true)
              .order("date", { ascending: false })
              .limit(1),
            
            supabase
              .from("client_goals")
              .select("*", { count: 'exact', head: true })
              .eq("client_id", profile.id)
              .eq("is_achieved", false)
          ]);

          return {
            id: profile.id,
            full_name: profile.full_name || 'Без име',
            email: profile.email,
            phone: profile.phone,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
            trainer_clients: {
              status: tc.status,
              created_at: tc.created_at
            },
            active_programs_count: activePrograms || 0,
            completed_workouts_count: completedWorkouts || 0,
            last_workout_date: lastWorkout?.[0]?.date,
            current_goals_count: currentGoals || 0
          };
        })
      );

      const validClients = clientsWithStats.filter(c => c !== null) as Client[];
      console.log('Final clients data:', validClients);
      setClients(validClients);

    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      // Get stats
      const { count: totalClients } = await supabase
        .from("trainer_clients")
        .select("*", { count: 'exact', head: true })
        .eq("trainer_id", user.id);

      const { count: activeClients } = await supabase
        .from("trainer_clients")
        .select("*", { count: 'exact', head: true })
        .eq("trainer_id", user.id)
        .eq("status", "active");

      const { count: newThisMonth } = await supabase
        .from("trainer_clients")
        .select("*", { count: 'exact', head: true })
        .eq("trainer_id", user.id)
        .gte("created_at", monthAgo.toISOString());

      setStats({
        total_clients: totalClients || 0,
        active_clients: activeClients || 0,
        new_this_month: newThisMonth || 0,
        avg_weekly_workouts: 0 // Can be calculated if needed
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(client =>
        selectedStatus === 'active' 
          ? client.trainer_clients?.status === 'active'
          : client.trainer_clients?.status !== 'active'
      );
    }

    setFilteredClients(filtered);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Клиенти</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление на клиенти</h1>
          <p className="text-muted-foreground">
            Управлявайте програмите и прогреса на вашите клиенти
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/protected/clients/programs/create">
              <Dumbbell className="h-4 w-4 mr-2" />
              Нова програма
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/protected/clients/invite">
              <Plus className="h-4 w-4 mr-2" />
              Покани клиент
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Общо клиенти</p>
                <p className="text-2xl font-bold">{stats.total_clients}</p>
              </div>
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Активни</p>
                <p className="text-2xl font-bold">{stats.active_clients}</p>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Нови този месец</p>
                <p className="text-2xl font-bold">{stats.new_this_month}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Средно тренировки</p>
                <p className="text-2xl font-bold">{stats.avg_weekly_workouts}/седм.</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Търси клиент..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            Всички
          </Button>
          <Button
            variant={selectedStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('active')}
          >
            Активни
          </Button>
          <Button
            variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('inactive')}
          >
            Неактивни
          </Button>
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Няма намерени клиенти' : 'Нямате клиенти'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Опитайте с друго търсене' 
                : 'Започнете като поканите вашия първи клиент'}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/protected/clients/invite">
                  <Plus className="h-4 w-4 mr-2" />
                  Покани клиент
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map(client => (
            <Card key={client.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{client.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>
                <Badge variant={client.trainer_clients?.status === 'active' ? 'default' : 'secondary'}>
                  {client.trainer_clients?.status === 'active' ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Активни програми</span>
                  <span className="font-medium">{client.active_programs_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Завършени тренировки</span>
                  <span className="font-medium">{client.completed_workouts_count || 0}</span>
                </div>
                {client.last_workout_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Последна тренировка</span>
                    <span className="font-medium">
                      {new Date(client.last_workout_date).toLocaleDateString('bg-BG')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/protected/clients/${client.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Преглед
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/protected/clients/${client.id}/calendar`}>
                    <Calendar className="h-4 w-4 mr-1" />
                    Календар
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
