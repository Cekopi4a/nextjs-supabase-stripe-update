"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseClient } from "@/utils/supabase/client";
import { Apple, ArrowLeft, Save, AlertCircle } from "lucide-react";
import { notifyNutritionPlanCreated } from "@/utils/notifications/create-notification-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  full_name: string;
  email: string;
}

export default function CreateNutritionPlanPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [loading, setLoading] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    client_id: "",
    name: "",
    description: "",
    goal_type: "maintenance",
    target_calories: "",
    target_protein: "",
    target_carbs: "",
    target_fat: "",
    start_date: new Date().toISOString().split('T')[0],
    is_active: true
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setFetchingClients(true);
    setError(null);

    try {
      // Wait a bit for auth to initialize
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error("Auth error:", authError);
        setError("Грешка при проверка на потребителя. Моля, опреснете страницата.");
        return;
      }

      if (!user) {
        setError("Не сте влезли в системата.");
        return;
      }

      console.log("Fetching clients for trainer:", user.id);

      // Get trainer's active clients
      const { data: trainerClients, error: clientsError } = await supabase
        .from("trainer_clients")
        .select(`
          client:profiles!trainer_clients_client_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq("trainer_id", user.id)
        .eq("status", "active");

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        setError("Грешка при зареждане на клиенти.");
        return;
      }

      console.log("Trainer clients:", trainerClients);

      if (trainerClients) {
        const clientsList = trainerClients
          .map(tc => tc.client)
          .filter(Boolean) as Client[];
        setClients(clientsList);

        if (clientsList.length === 0) {
          setError("Нямате добавени активни клиенти. Първо добавете клиент.");
        }
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Грешка при зареждане на клиенти.");
    } finally {
      setFetchingClients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      console.log("Auth check:", { user: user?.id, authError });

      if (authError || !user) {
        console.error("Authentication error:", authError);
        throw new Error("Not authenticated");
      }

      console.log("Creating nutrition plan with data:", {
        trainer_id: user.id,
        client_id: formData.client_id,
        name: formData.name,
        goal_type: formData.goal_type,
      });

      // Step 1: Deactivate all existing active plans for this client
      const { error: deactivateError } = await supabase
        .from("nutrition_plans")
        .update({ is_active: false })
        .eq("client_id", formData.client_id)
        .eq("is_active", true);

      if (deactivateError) {
        console.error("Error deactivating old plans:", deactivateError);
        // Continue anyway - not critical
      } else {
        console.log("✅ Deactivated old plans for client");
      }

      // Step 2: Create new nutrition plan - use correct column names from DB
      const { data: plan, error: planError } = await supabase
        .from("nutrition_plans")
        .insert({
          trainer_id: user.id,
          client_id: formData.client_id,
          name: formData.name,
          description: formData.description || null,
          goal_type: formData.goal_type,
          daily_calories: formData.target_calories ? parseInt(formData.target_calories) : null,
          daily_protein_g: formData.target_protein ? parseInt(formData.target_protein) : null,
          daily_carbs_g: formData.target_carbs ? parseInt(formData.target_carbs) : null,
          daily_fat_g: formData.target_fat ? parseInt(formData.target_fat) : null,
          start_date: formData.start_date,
          is_active: true // Always create as active
        })
        .select()
        .single();

      if (planError) {
        console.error("Supabase error details:", {
          message: planError.message,
          details: planError.details,
          hint: planError.hint,
          code: planError.code
        });
        throw planError;
      }

      console.log("Plan created successfully:", plan);

      // Get trainer profile for notification
      const { data: trainerProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const trainerName = trainerProfile?.full_name || "Вашият треньор";

      // Send notification to client about new nutrition plan
      await notifyNutritionPlanCreated(
        formData.client_id,
        formData.name,
        plan.id,
        trainerName
      );

      router.push(`/protected/nutrition-plans/${plan.id}`);
    } catch (error: any) {
      console.error("Error creating nutrition plan:", {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint
      });
      alert(`Грешка при създаване на хранителен план: ${error?.message || 'Неизвестна грешка'}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingClients) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Зареждане на клиенти...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Apple className="h-8 w-8 mr-2 text-green-600" />
            Създай Хранителен План
          </h1>
          <p className="text-muted-foreground">
            Създайте персонализиран хранителен план за вашия клиент
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Грешка</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          {error.includes("клиенти") && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => router.push("/protected/clients")}
            >
              Добави клиент
            </Button>
          )}
        </Card>
      )}

      {/* Form */}
      {!error && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client_id">Клиент *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изберете клиент" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Име на план *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="напр. Месечен План за Отслабване"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание на хранителния план..."
              rows={3}
            />
          </div>

          {/* Goal Type */}
          <div className="space-y-2">
            <Label htmlFor="goal_type">Тип План *</Label>
            <Select
              value={formData.goal_type}
              onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Отслабване</SelectItem>
                <SelectItem value="weight_gain">Покачване</SelectItem>
                <SelectItem value="maintenance">Поддръжка</SelectItem>
                <SelectItem value="muscle_gain">Мускулна маса</SelectItem>
                <SelectItem value="cutting">Дефиниция</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Macros Target */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_calories">Целеви Калории</Label>
              <Input
                id="target_calories"
                type="number"
                value={formData.target_calories}
                onChange={(e) => setFormData({ ...formData, target_calories: e.target.value })}
                placeholder="2000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_protein">Целеви Протеини (г)</Label>
              <Input
                id="target_protein"
                type="number"
                value={formData.target_protein}
                onChange={(e) => setFormData({ ...formData, target_protein: e.target.value })}
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_carbs">Целеви Въглехидрати (г)</Label>
              <Input
                id="target_carbs"
                type="number"
                value={formData.target_carbs}
                onChange={(e) => setFormData({ ...formData, target_carbs: e.target.value })}
                placeholder="200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_fat">Целеви Мазнини (г)</Label>
              <Input
                id="target_fat"
                type="number"
                value={formData.target_fat}
                onChange={(e) => setFormData({ ...formData, target_fat: e.target.value })}
                placeholder="60"
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start_date">Начална дата</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Откажи
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.client_id || !formData.name}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Създаване..." : "Създай План"}
            </Button>
          </div>
          </form>
        </Card>
      )}
    </div>
  );
}