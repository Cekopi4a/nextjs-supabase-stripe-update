"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Target,
  User,
  Clock,
  Settings,
  Apple,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  Coffee,
  UtensilsCrossed,
  Sunset,
  MessageSquare,
  StickyNote,
  Save,
  Plus,
  Pencil,
  Trash2,
  X
} from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { formatScheduledDate, getTodayDateString } from "@/utils/date-utils";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}


interface WorkoutSession {
  id: string;
  name: string;
  scheduled_date: string;
  status: 'planned' | 'completed' | 'skipped';
}

interface MealPlan {
  id: string;
  meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  meal_name: string;
  scheduled_date: string;
  calories?: number;
  protein?: number;
  status: 'planned' | 'completed' | 'skipped';
}

interface ClientNote {
  id: string;
  trainer_id: string;
  client_id: string;
  title: string | null;
  note: string;
  created_at: string;
  updated_at: string;
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutSession | null>(null);
  const [todayMeals, setTodayMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
  const [editingNote, setEditingNote] = useState<ClientNote | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  const supabase = createSupabaseClient();

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  useEffect(() => {
    if (client) {
      loadRecentSessions();
      loadTodayData();
      loadClientNotes();
    }
  }, [client]);

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

  const loadTodayData = async () => {
    try {
      const today = getTodayDateString();
      // Load today's workout
      const { data: workoutData, error: workoutError } = await supabase
        .from("workout_sessions")
        .select("id, name, scheduled_date, status")
        .eq("client_id", clientId)
        .eq("scheduled_date", today)
        .single();

      if (workoutError && workoutError.code !== 'PGRST116') {
        console.error("Error loading workout:", workoutError);
      }

      if (workoutData) {
        setTodayWorkout(workoutData);
      }

      // Load today's meals
      const { data: mealsData, error: mealsError } = await supabase
        .from("daily_meals")
        .select("id, meal_type, meal_name, scheduled_date, calories, protein, status")
        .eq("client_id", clientId)
        .eq("scheduled_date", today)
        .order("meal_type");

      if (mealsError) {
        console.error("Error loading meals:", mealsError);
      }

      if (mealsData && mealsData.length > 0) {
        setTodayMeals(mealsData);
      }
    } catch (error) {
      console.error("Error loading today's data:", error);
    }
  };

  const loadClientNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("client_notes")
        .select("*")
        .eq("trainer_id", user.id)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading notes:", error);
        return;
      }

      setClientNotes(data || []);
    } catch (error) {
      console.error("Error loading client notes:", error);
    }
  };

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteText("");
    setShowNoteForm(true);
  };

  const handleEditNote = (note: ClientNote) => {
    setEditingNote(note);
    setNoteTitle(note.title || "");
    setNoteText(note.note);
    setShowNoteForm(true);
  };

  const handleCancelNote = () => {
    setShowNoteForm(false);
    setEditingNote(null);
    setNoteTitle("");
    setNoteText("");
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) {
      toast.error("Моля, въведете текст за бележката");
      return;
    }

    try {
      setNoteSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingNote) {
        // Update existing note
        const { error } = await supabase
          .from("client_notes")
          .update({
            title: noteTitle.trim() || null,
            note: noteText.trim()
          })
          .eq("id", editingNote.id);

        if (error) throw error;
        toast.success("Бележката е обновена успешно");
      } else {
        // Create new note
        const { error } = await supabase
          .from("client_notes")
          .insert({
            trainer_id: user.id,
            client_id: clientId,
            title: noteTitle.trim() || null,
            note: noteText.trim()
          });

        if (error) throw error;
        toast.success("Бележката е добавена успешно");
      }

      await loadClientNotes();
      handleCancelNote();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Грешка при запазване на бележката");
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази бележка?")) return;

    try {
      const { error } = await supabase
        .from("client_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      toast.success("Бележката е изтрита успешно");
      await loadClientNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Грешка при изтриване на бележката");
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
          <Avatar
            src={client.avatar_url}
            alt={client.full_name}
            size="xl"
            fallback={
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center">
                <span className="text-white text-xl font-semibold">
                  {client.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            }
          />
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
          <div className="shrink-0 flex gap-2">
            {/* Chat button */}
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
              disabled={creatingChat}
              onClick={async () => {
                try {
                  setCreatingChat(true);
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) return;

                  // Create or get conversation
                  const response = await fetch('/api/chat/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client_id: clientId })
                  });

                  if (response.ok) {
                    router.push('/protected/chat');
                  } else {
                    alert('Грешка при отваряне на чата');
                  }
                } catch (e) {
                  console.error(e);
                  alert('Грешка при отваряне на чата');
                } finally {
                  setCreatingChat(false);
                }
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {creatingChat ? 'Отваряне...' : 'Съобщение'}
            </Button>

            {/* Delete button */}
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:text-red-800 hover:bg-red-50"
              disabled={deleting}
              onClick={async () => {
                if (!confirm('Сигурни ли сте, че искате да премахнете този клиент?')) return;
                try {
                  setDeleting(true);
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) return;
                  const { error } = await supabase
                    .from('trainer_clients')
                    .delete()
                    .eq('trainer_id', user.id)
                    .eq('client_id', clientId);
                  if (error) {
                    console.error('Грешка при премахване на клиента:', error);
                    alert('Грешка при премахване на клиента');
                    setDeleting(false);
                    return;
                  }
                  router.push('/protected/clients');
                } catch (e) {
                  console.error(e);
                  alert('Грешка при премахване на клиента');
                } finally {
                  setDeleting(false);
                }
              }}
            >
              Премахни клиента
            </Button>
          </div>
        </div>
      </Card>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Workout */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-blue-600" />
              Днешна тренировка
            </h2>
            <Link href={`/protected/clients/${clientId}/calendar`}>
              <Button size="sm" variant="outline">
                Календар
              </Button>
            </Link>
          </div>
          
          {todayWorkout ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">{todayWorkout.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatScheduledDate(todayWorkout.scheduled_date)}
                  </p>
                </div>
                {getStatusBadge(todayWorkout.status)}
              </div>
              
              {todayWorkout.status === 'planned' && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Предстои тренировка</span>
                </div>
              )}
              
              {todayWorkout.status === 'completed' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Тренировката е завършена</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-foreground mb-2">Няма планирана тренировка</h3>
              <p className="text-gray-500">За днес няма запланирана тренировка</p>
            </div>
          )}
        </Card>
        
        {/* Today's Meals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Apple className="h-5 w-5 text-green-600" />
              Днешно хранене
            </h2>
            <Link href={`/protected/clients/${clientId}/nutrition`}>
              <Button size="sm" variant="outline">
                Планове
              </Button>
            </Link>
          </div>
          
          {todayMeals.length > 0 ? (
            <div className="space-y-4">
              {/* Meal summary */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-green-50 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0)}
                  </div>
                  <div className="text-xs text-green-700">Калории</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {todayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0)}г
                  </div>
                  <div className="text-xs text-blue-700">Протеин</div>
                </div>
              </div>
              
              {/* Meals list */}
              <div className="space-y-2">
                {todayMeals.slice(0, 3).map((meal) => {
                  const getMealIcon = (type: string) => {
                    switch (type) {
                      case 'breakfast': return Coffee;
                      case 'lunch': return UtensilsCrossed;
                      case 'dinner': return Sunset;
                      default: return Apple;
                    }
                  };
                  
                  const MealIcon = getMealIcon(meal.meal_type);
                  
                  return (
                    <div key={meal.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        <MealIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{meal.meal_name}</span>
                      </div>
                      {meal.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
                
                {todayMeals.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    и още {todayMeals.length - 3} храни...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Apple className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-foreground mb-2">Няма планирано хранене</h3>
              <p className="text-gray-500">За днес няма хранителен план</p>
            </div>
          )}
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/protected/clients/${clientId}/calendar`}>
          <Button className="w-full h-20 flex flex-col items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Тренировки
          </Button>
        </Link>
        <Link href={`/protected/clients/${clientId}/nutrition`}>
          <Button className="w-full h-20 flex flex-col items-center gap-2" variant="outline">
            <Apple className="h-6 w-6" />
            Хранене
          </Button>
        </Link>
        <Button className="w-full h-20 flex flex-col items-center gap-2" variant="outline">
          <Settings className="h-6 w-6" />
          Настройки
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
                          {formatScheduledDate(session.scheduled_date)}
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

        {/* Client Notes */}
        <div className="lg:col-span-1">
          <Card className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-yellow-600" />
                Бележки
              </h2>
              {!showNoteForm && (
                <Button size="sm" onClick={handleAddNote}>
                  <Plus className="h-4 w-4 mr-1" />
                  Добави
                </Button>
              )}
            </div>

            {showNoteForm ? (
              <div className="space-y-3">
                <Input
                  placeholder="Заглавие (по избор)"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Текст на бележката..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveNote}
                    disabled={noteSaving}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {noteSaving ? 'Запазване...' : editingNote ? 'Обнови' : 'Запази'}
                  </Button>
                  <Button
                    onClick={handleCancelNote}
                    variant="outline"
                    disabled={noteSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {clientNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <StickyNote className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Няма бележки</h3>
                    <p className="text-gray-500">Добавете бележки за клиента</p>
                  </div>
                ) : (
                  clientNotes.map((note) => (
                    <Card key={note.id} className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="space-y-2">
                        {note.title && (
                          <h4 className="font-semibold text-sm">{note.title}</h4>
                        )}
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {note.note}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString('bg-BG', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditNote(note)}
                              className="h-7 w-7 p-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteNote(note.id)}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}