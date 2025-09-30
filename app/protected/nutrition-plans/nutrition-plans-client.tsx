"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Calendar, Target, Apple, History } from "lucide-react";
import Link from "next/link";
import { DeleteNutritionPlanButton } from "@/components/delete-nutrition-plan-button";

interface NutritionPlan {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  goal_type?: string;
  daily_calories?: number;
  daily_protein_g?: number;
  start_date?: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface NutritionPlansClientProps {
  activePlans: NutritionPlan[];
  inactivePlans: NutritionPlan[];
  userRole: string;
}

export function NutritionPlansClient({
  activePlans,
  inactivePlans,
  userRole,
}: NutritionPlansClientProps) {
  const [showHistory, setShowHistory] = useState(false);

  const plansToShow = showHistory ? [...activePlans, ...inactivePlans] : activePlans;
  const hasHistory = inactivePlans.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Apple className="h-6 w-6 mr-2 text-green-600" />
            {userRole === "trainer" ? "Хранителни Планове" : "Моите Хранителни Планове"}
          </h1>
          <p className="text-muted-foreground">
            {userRole === "trainer"
              ? "Управление на хранителни планове за вашите клиенти"
              : "Вижте и следвайте вашите хранителни планове"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {userRole === "trainer" && hasHistory && (
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-2" />
              {showHistory ? "Скрий история" : "Покажи история"}
            </Button>
          )}
          {userRole === "trainer" && (
            <Button asChild>
              <Link href="/protected/nutrition-plans/create">
                <Plus className="h-4 w-4 mr-2" />
                Създай План
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Info Badge */}
      {userRole === "trainer" && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>💡 Важно:</strong> Всеки клиент може да има само 1 активен план.
            Когато създадете нов план, старите автоматично стават неактивни.
          </p>
        </Card>
      )}

      {/* History Info */}
      {showHistory && hasHistory && (
        <div className="text-sm text-muted-foreground">
          Показва се: {activePlans.length} активни + {inactivePlans.length} неактивни планове
        </div>
      )}

      {/* Plans Grid */}
      {plansToShow.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 text-muted-foreground">
              <Apple className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {userRole === "trainer"
                ? "Все още няма създадени планове"
                : "Все още няма зададени планове"
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {userRole === "trainer"
                ? "Създайте вашия първи хранителен план за вашите клиенти."
                : "Вашият треньор скоро ще ви създаде хранителен план."
              }
            </p>
            {userRole === "trainer" && (
              <Button asChild>
                <Link href="/protected/nutrition-plans/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Създай Първи План
                </Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plansToShow.map((plan) => (
            <NutritionPlanCard
              key={plan.id}
              plan={plan}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NutritionPlanCard({ plan, userRole }: { plan: NutritionPlan; userRole: string }) {
  const relatedUser = plan.profiles;

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow ${!plan.is_active ? 'opacity-60' : ''}`}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              plan.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}>
              {plan.is_active ? "Активен" : "Неактивен"}
            </span>
          </div>

          {plan.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {plan.description}
            </p>
          )}
        </div>

        {/* Stats - Nutrition Targets */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {plan.daily_calories && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span>{plan.daily_calories} cal</span>
            </div>
          )}
          {plan.daily_protein_g && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span>{plan.daily_protein_g}g protein</span>
            </div>
          )}
        </div>

        {/* Related User Info */}
        {relatedUser && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {userRole === "trainer" ? "Клиент: " : "Треньор: "}
              {relatedUser.full_name}
            </span>
          </div>
        )}

        {/* Goal Type */}
        <div className="flex gap-2">
          {plan.goal_type && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded">
              {getPlanTypeLabel(plan.goal_type)}
            </span>
          )}
          {plan.start_date && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(plan.start_date).toLocaleDateString('bg-BG')}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
          >
            <Link href={`/protected/nutrition-plans/${plan.id}`}>
              Детайли
            </Link>
          </Button>

          {userRole === "trainer" && (
            <>
              {plan.is_active && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/protected/nutrition-plans/${plan.id}/edit`}>
                    Редактирай
                  </Link>
                </Button>
              )}
              <DeleteNutritionPlanButton planId={plan.id} planName={plan.name} />
            </>
          )}

          {userRole === "client" && plan.is_active && (
            <Button
              size="sm"
              className="flex-1"
              asChild
            >
              <Link href={`/protected/nutrition?plan=${plan.id}`}>
                Виж План
              </Link>
            </Button>
          )}
        </div>

        {/* Created Date */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Създаден {new Date(plan.created_at).toLocaleDateString('bg-BG')}
        </div>
      </div>
    </Card>
  );
}

function getPlanTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    weight_loss: 'Отслабване',
    weight_gain: 'Покачване',
    maintenance: 'Поддръжка',
    muscle_gain: 'Мускулна маса',
    cutting: 'Дефиниция'
  };
  return labels[type] || type;
}