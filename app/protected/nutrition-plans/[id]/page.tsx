import { createSupabaseClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Apple, Calendar, Target, User, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NutritionPlanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await createSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  // Get user profile
  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>Profile not found</div>;
  }

  // Get nutrition plan with related data
  const { data: plan, error } = await client
    .from("nutrition_plans")
    .select(`
      *,
      client:profiles!nutrition_plans_client_id_fkey(id, full_name, email),
      trainer:profiles!nutrition_plans_trainer_id_fkey(id, full_name, email)
    `)
    .eq("id", params.id)
    .single();

  if (error || !plan) {
    notFound();
  }

  // Check permissions
  const isTrainer = profile.role === "trainer" && plan.trainer_id === user.id;
  const isClient = profile.role === "client" && plan.client_id === user.id;

  if (!isTrainer && !isClient) {
    return <div>Нямате достъп до този план</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/protected/nutrition-plans">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center">
            <Apple className="h-8 w-8 mr-2 text-green-600" />
            {plan.name}
          </h1>
          <p className="text-muted-foreground">{plan.description}</p>
        </div>
        {isTrainer && (
          <Button asChild>
            <Link href={`/protected/nutrition-plans/${plan.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Редактирай
            </Link>
          </Button>
        )}
      </div>

      {/* Status Badge */}
      <div>
        <Badge
          className={
            plan.is_active
              ? "bg-green-100 text-green-800"
              : "bg-muted text-muted-foreground"
          }
        >
          {plan.is_active ? "Активен" : "Неактивен"}
        </Badge>
        <Badge className="ml-2 bg-blue-100 text-blue-800">
          {getPlanTypeLabel(plan.goal_type)}
        </Badge>
      </div>

      {/* Main Info Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Client/Trainer Info */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            {isTrainer ? "Клиент" : "Треньор"}
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Име:</span>
              <p className="font-medium">
                {isTrainer ? plan.client.full_name : plan.trainer.full_name}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email:</span>
              <p className="text-sm">
                {isTrainer ? plan.client.email : plan.trainer.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Dates */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Период
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Начало:</span>
              <p className="font-medium">
                {new Date(plan.start_date).toLocaleDateString("bg-BG")}
              </p>
            </div>
            {plan.end_date && (
              <div>
                <span className="text-sm text-muted-foreground">Край:</span>
                <p className="font-medium">
                  {new Date(plan.end_date).toLocaleDateString("bg-BG")}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Macros Targets */}
      {(plan.daily_calories || plan.daily_protein_g || plan.daily_carbs_g || plan.daily_fat_g) && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Целеви Макроси
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {plan.daily_calories && (
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {plan.daily_calories}
                </div>
                <div className="text-sm text-muted-foreground">Калории</div>
              </div>
            )}
            {plan.daily_protein_g && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {plan.daily_protein_g}г
                </div>
                <div className="text-sm text-muted-foreground">Протеини</div>
              </div>
            )}
            {plan.daily_carbs_g && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {plan.daily_carbs_g}г
                </div>
                <div className="text-sm text-muted-foreground">Въглехидрати</div>
              </div>
            )}
            {plan.daily_fat_g && (
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {plan.daily_fat_g}г
                </div>
                <div className="text-sm text-muted-foreground">Мазнини</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Weekly Meal Schedule - Coming Soon */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Седмичен хранителен режим</h3>
        <div className="text-center py-12 text-muted-foreground">
          <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Функционалността за седмични ястия е в процес на разработка</p>
          {isTrainer && (
            <Button className="mt-4" variant="outline" disabled>
              Добави седмични ястия
            </Button>
          )}
        </div>
      </Card>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-center pt-4 border-t">
        Създаден на {new Date(plan.created_at).toLocaleDateString("bg-BG")} •
        Последна промяна {new Date(plan.updated_at).toLocaleDateString("bg-BG")}
      </div>
    </div>
  );
}

function getPlanTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    weight_loss: "Отслабване",
    weight_gain: "Покачване",
    maintenance: "Поддръжка",
    muscle_gain: "Мускулна маса",
    cutting: "Дефиниция",
  };
  return labels[type] || type;
}