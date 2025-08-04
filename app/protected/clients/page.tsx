// app/protected/clients/page.tsx
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

      // Get trainer's clients with their stats
      const { data: trainerClients, error } = await supabase
        .from("trainer_clients")
        .select(`
          client_id,
          status,
          created_at,
          profiles!trainer_clients_client_id_fkey(
            id,
            full_name,
            email,
            phone,
            avatar_url,
            created_at
          )
        `)
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get additional stats for each client
      const clientsWithStats = await Promise.all(
        (trainerClients || []).map(async (tc) => {
          const client = tc.profiles?.[0];
          if (!client) return null;

          // Get client stats
          const [
            { count: activePrograms },
            { count: completedWorkouts },
            { data: lastWorkout },
            { count: currentGoals }
          ] = await Promise.all([
            supabase
              .from("workout_programs")
              .select("*", { count: 'exact', head: true })
              .eq("client_id", client.id)
              .eq("is_active", true),
            
            supabase
              .from("workout_logs")
              .select("*", { count: 'exact', head: true })
              .eq("client_id", client.id)
              .eq("completed", true),
            
            supabase
              .from("workout_logs")
              .select("date")
              .eq("client_id", client.id)
              .eq("completed", true)
              .order("date", { ascending: false })
              .limit(1),
            
            supabase
              .from("client_goals")
              .select("*", { count: 'exact', head: true })
              .eq("client_id", client.id)
              .eq("is_achieved", false)
          ]);

          return {
            id: client.id,
            full_name: client.full_name,
            email: client.email,
            phone: client.phone,
            avatar_url: client.avatar_url,
            created_at: client.created_at,
            trainer_clients: {
              status: tc.status,
              created_at: tc.created_at
            },
            active_programs_count: activePrograms || 0,
            completed_workouts_count: completedWorkouts || 0,
            last_workout_date: lastWorkout?.[0]?.date,
            current_goals_count: currentGoals || 0
          } as Client;
        })
      );

      setClients(clientsWithStats.filter((client): client is Client => client !== null));
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { count: totalClients },
        { count: activeClients },
        { count: newThisMonth }
      ] = await Promise.all([
        supabase
          .from("trainer_clients")
          .select("*", { count: 'exact', head: true })
          .eq("trainer_id", user.id),
        
        supabase
          .from("trainer_clients")
          .select("*", { count: 'exact', head: true })
          .eq("trainer_id", user.id)
          .eq("status", "active"),
        
        supabase
          .from("trainer_clients")
          .select("*", { count: 'exact', head: true })
          .eq("trainer_id", user.id)
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      setStats({
        total_clients: totalClients || 0,
        active_clients: activeClients || 0,
        new_this_month: newThisMonth || 0,
        avg_weekly_workouts: 0 // TODO: Calculate from workout logs
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    // Filter by search term
    if (searchTerm.trim()) {
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
                <p className="text-2xl font-bold text-green-600">{stats.active_clients}</p>
              </div>
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Нови този месец</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new_this_month}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ср. тренировки</p>
                <p className="text-2xl font-bold">{stats.avg_weekly_workouts}</p>
                <p className="text-xs text-muted-foreground">на седмица</p>
              </div>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Търси клиенти..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
              >
                {status === 'all' ? 'Всички' : status === 'active' ? 'Активни' : 'Неактивни'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Няма намерени клиенти' : 'Няма клиенти все още'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Опитайте с различен търсещ термин' 
                : 'Покането на първия си клиент, за да започнете'
              }
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/protected/clients/invite">
                  <Plus className="h-4 w-4 mr-2" />
                  Покани първия клиент
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClientCard({ client }: { client: Client }) {
  const isActive = client.trainer_clients?.status === 'active';
  const joinedDate = new Date(client.trainer_clients?.created_at || client.created_at);
  const lastWorkoutDate = client.last_workout_date ? new Date(client.last_workout_date) : null;
  const daysSinceLastWorkout = lastWorkoutDate 
    ? Math.floor((Date.now() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {client.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold">{client.full_name}</h3>
            <p className="text-sm text-muted-foreground">{client.email}</p>
          </div>
        </div>
        
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "Активен" : "Неактивен"}
        </Badge>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-2 bg-blue-50 rounded">
          <p className="text-lg font-bold text-blue-600">{client.active_programs_count}</p>
          <p className="text-xs text-muted-foreground">Програми</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <p className="text-lg font-bold text-green-600">{client.completed_workouts_count}</p>
          <p className="text-xs text-muted-foreground">Тренировки</p>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded">
          <p className="text-lg font-bold text-purple-600">{client.current_goals_count}</p>
          <p className="text-xs text-muted-foreground">Цели</p>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded">
          <p className="text-lg font-bold text-orange-600">
            {daysSinceLastWorkout !== null ? daysSinceLastWorkout : '-'}
          </p>
          <p className="text-xs text-muted-foreground">Дни без</p>
        </div>
      </div>

      {/* Last Activity */}
      <div className="text-sm text-muted-foreground mb-4">
        <p>Член от: {joinedDate.toLocaleDateString('bg-BG')}</p>
        {lastWorkoutDate && (
          <p>Последна тренировка: {lastWorkoutDate.toLocaleDateString('bg-BG')}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/protected/clients/${client.id}/calendar`}>
            <Calendar className="h-4 w-4 mr-1" />
            Календар
          </Link>
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <Link href={`/protected/clients/${client.id}/progress`}>
            <BarChart3 className="h-4 w-4 mr-1" />
            Прогрес
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/protected/clients/${client.id}/programs`}>
            <Dumbbell className="h-4 w-4 mr-1" />
            Програми
          </Link>
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <Link href={`/protected/clients/${client.id}/profile`}>
            <Settings className="h-4 w-4 mr-1" />
            Профил
          </Link>
        </Button>
      </div>
    </Card>
  );
}