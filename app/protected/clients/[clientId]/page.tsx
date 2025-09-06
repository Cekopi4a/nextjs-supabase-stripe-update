"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronLeft, 
  Calendar as CalendarIcon,
  Target,
  TrendingUp,
  Dumbbell,
  Plus,
  User,
  CheckCircle2,
  Clock,
  Settings
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}

interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
  difficulty_level: string;
  estimated_duration_weeks: number;
  is_active: boolean;
  created_at: string;
}

interface WorkoutSession {
  id: string;
  name: string;
  scheduled_date: string;
  status: 'planned' | 'completed' | 'skipped';
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = params.clientId as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeProgram, setActiveProgram] = useState<WorkoutProgram | null>(null);
  
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Check if we just created a program
    if (searchParams.get('program_created') === 'true') {
      setShowSuccess(true);
      // Remove the query parameter from URL
      router.replace(`/protected/clients/${clientId}`);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
    
    loadClientData();
    loadPrograms();
    loadRecentSessions();
  }, [clientId, searchParams]);

  const loadClientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verify trainer has access to this client
      const { data: relationship } = await supabase
        .from("trainer_clients")
        .select("*")
        .eq("trainer_id", user.id)
        .eq("client_id", clientId)
        .single();

      if (!relationship) {
        router.push("/protected/clients");
        return;
      }

      // Get client data
      const { data: clientData, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, created_at")
        .eq("id", clientId)
        .single();

      if (error) throw error;
      setClient(clientData);
    } catch (error) {
      console.error("Error fetching client:", error);
      router.push("/protected/clients");
    }
  };

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("workout_programs")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const programs = data || [];
      setPrograms(programs);
      
      // Find the active program (only one should be active)
      const active = programs.find(p => p.is_active);
      setActiveProgram(active || null);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const loadRecentSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .select("id, name, scheduled_date, status")
        .eq("client_id", clientId)
        .order("scheduled_date", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentSessions(data || []);
    } catch (error) {
      console.error("Error fetching recent sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-800">Планирана</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Завършена</Badge>;
      case 'skipped':
        return <Badge className="bg-muted text-muted-foreground">Прескочена</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-100 text-green-800">Начинаещ</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-100 text-yellow-800">Средно ниво</Badge>;
      case 'advanced':
        return <Badge className="bg-red-100 text-red-800">Напреднал</Badge>;
      default:
        return <Badge>{difficulty}</Badge>;
    }
  };

  const deleteProgram = async (programId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази програма?\n\nТова ще изтрие всички планирани тренировки.")) {
      return;
    }

    try {
      // Delete all workout sessions for this program
      await supabase
        .from("workout_sessions")
        .delete()
        .eq("program_id", programId);

      // Delete the program
      const { error } = await supabase
        .from("workout_programs")
        .delete()
        .eq("id", programId);

      if (error) throw error;

      // Reload programs
      await loadPrograms();
      
      alert("Програмата е изтрита успешно!");
    } catch (error) {
      console.error("Error deleting program:", error);
      alert("Грешка при изтриване на програмата");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p>Клиентът не е намерен</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="font-medium text-green-800">Програмата е създадена успешно!</h3>
            <p className="text-green-700 text-sm">Новата тренировъчна програма е запазена и готова за използване.</p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/protected/clients')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Всички клиенти
        </Button>
      </div>

      {/* Client Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-semibold">
              {client.full_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {client.full_name}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <User className="h-4 w-4" />
              {client.email}
            </p>
            {client.created_at && (
              <p className="text-sm text-gray-500 mt-1">
                Клиент от {new Date(client.created_at).toLocaleDateString('bg-BG')}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href={`/protected/clients/${clientId}/calendar`}>
          <Button className="w-full h-20 flex flex-col items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Календар
          </Button>
        </Link>
        {!activeProgram ? (
          <Link href={`/protected/clients/${clientId}/programs/create`}>
            <Button className="w-full h-20 flex flex-col items-center gap-2" variant="outline">
              <Plus className="h-6 w-6" />
              Създай програма
            </Button>
          </Link>
        ) : (
          <Button 
            className="w-full h-20 flex flex-col items-center gap-2" 
            variant="destructive"
            onClick={() => deleteProgram(activeProgram.id)}
          >
            <Plus className="h-6 w-6" />
            Изтрий програма
          </Button>
        )}
        <Button className="w-full h-20 flex flex-col items-center gap-2" variant="outline">
          <Target className="h-6 w-6" />
          Прогрес
        </Button>
        <Button className="w-full h-20 flex flex-col items-center gap-2" variant="outline">
          <Settings className="h-6 w-6" />
          Настройки
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Програми
            </h2>
            {!activeProgram && (
              <Link href={`/protected/clients/${clientId}/programs/create`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Създай
                </Button>
              </Link>
            )}
          </div>
          
          {!activeProgram ? (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-foreground mb-2">Няма активна програма</h3>
              <p className="text-gray-500 mb-4">Създайте тренировъчна програма за този клиент</p>
              <Link href={`/protected/clients/${clientId}/programs/create`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Създай програма
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Card key={activeProgram.id} className="p-4 border-green-200 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{activeProgram.name}</h3>
                  <div className="flex items-center gap-2">
                    {getDifficultyBadge(activeProgram.difficulty_level)}
                    <Badge className="bg-green-100 text-green-800">Активна програма</Badge>
                  </div>
                </div>
                {activeProgram.description && (
                  <p className="text-sm text-gray-600 mb-2">{activeProgram.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{activeProgram.estimated_duration_weeks} седмици</span>
                  <span>Създадена {new Date(activeProgram.created_at).toLocaleDateString('bg-BG')}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/protected/clients/${clientId}/calendar`}>
                    <Button size="sm" variant="outline">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Виж в календара
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => deleteProgram(activeProgram.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Изтрий
                  </Button>
                </div>
              </Card>
              
              {/* Show inactive programs if any */}
              {programs.filter(p => !p.is_active).length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Предишни програми</h4>
                  <div className="space-y-2">
                    {programs.filter(p => !p.is_active).map((program) => (
                      <Card key={program.id} className="p-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">{program.name}</h4>
                          <Badge className="bg-muted text-muted-foreground">Неактивна</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Recent Sessions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Последни тренировки
            </h2>
            <Link href={`/protected/clients/${clientId}/calendar`}>
              <Button size="sm" variant="outline">
                Виж всички
              </Button>
            </Link>
          </div>
          
          {recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-foreground mb-2">Няма тренировки</h3>
              <p className="text-gray-500">Планираните тренировки ще се появят тук</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Card key={session.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{session.name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(session.scheduled_date).toLocaleDateString('bg-BG')}
                      </p>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}