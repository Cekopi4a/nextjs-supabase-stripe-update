"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

interface EditProgramFormProps {
  program: any;
}

export function EditProgramForm({ program }: EditProgramFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: program.name || "",
    description: program.description || "",
    difficulty_level: program.difficulty_level || "",
    estimated_duration_weeks: program.estimated_duration_weeks || 8,
    workouts_per_week: program.workouts_per_week || 3,
    program_type: program.program_type || "workout_only",
    is_active: program.is_active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Името на програмата е задължително";
    }

    if (!formData.difficulty_level) {
      newErrors.difficulty_level = "Моля изберете ниво на трудност";
    }

    if (formData.estimated_duration_weeks < 1 || formData.estimated_duration_weeks > 52) {
      newErrors.estimated_duration_weeks = "Продължителността трябва да е между 1 и 52 седмици";
    }

    if (formData.workouts_per_week < 1 || formData.workouts_per_week > 7) {
      newErrors.workouts_per_week = "Тренировките седмично трябва да са между 1 и 7";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const client = await createSupabaseClient();

      const { error } = await client
        .from("workout_programs")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          difficulty_level: formData.difficulty_level,
          estimated_duration_weeks: formData.estimated_duration_weeks,
          workouts_per_week: formData.workouts_per_week,
          program_type: formData.program_type,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", program.id);

      if (error) {
        throw error;
      }

      toast.success("Програмата е обновена успешно");
      router.push(`/protected/programs/${program.id}`);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating program:", error);
      toast.error("Грешка при обновяване на програмата: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/protected/programs/${program.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Program
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Program Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Име на програмата *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Въведете име на програмата"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Опишете целите и съдържанието на програмата"
              rows={3}
            />
          </div>

          {/* Program Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Difficulty Level */}
            <div className="space-y-2">
              <Label>Ниво на трудност *</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, difficulty_level: value }))
                }
              >
                <SelectTrigger className={errors.difficulty_level ? "border-destructive" : ""}>
                  <SelectValue placeholder="Изберете ниво" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Начинаещ</SelectItem>
                  <SelectItem value="intermediate">Средно ниво</SelectItem>
                  <SelectItem value="advanced">Напреднал</SelectItem>
                </SelectContent>
              </Select>
              {errors.difficulty_level && (
                <p className="text-sm text-destructive">{errors.difficulty_level}</p>
              )}
            </div>

            {/* Program Type */}
            <div className="space-y-2">
              <Label>Тип програма</Label>
              <Select
                value={formData.program_type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, program_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workout_only">Само тренировки</SelectItem>
                  <SelectItem value="nutrition_only">Само хранене</SelectItem>
                  <SelectItem value="combined">Комбинирана</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Продължителност (седмици) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="52"
                value={formData.estimated_duration_weeks}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimated_duration_weeks: parseInt(e.target.value) || 1,
                  }))
                }
                className={errors.estimated_duration_weeks ? "border-destructive" : ""}
              />
              {errors.estimated_duration_weeks && (
                <p className="text-sm text-destructive">{errors.estimated_duration_weeks}</p>
              )}
            </div>

            {/* Workouts per week */}
            <div className="space-y-2">
              <Label htmlFor="workouts">Тренировки седмично *</Label>
              <Input
                id="workouts"
                type="number"
                min="1"
                max="7"
                value={formData.workouts_per_week}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    workouts_per_week: parseInt(e.target.value) || 1,
                  }))
                }
                className={errors.workouts_per_week ? "border-destructive" : ""}
              />
              {errors.workouts_per_week && (
                <p className="text-sm text-destructive">{errors.workouts_per_week}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Статус на програмата</Label>
            <Select
              value={formData.is_active ? "active" : "inactive"}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, is_active: value === "active" }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активна</SelectItem>
                <SelectItem value="inactive">Неактивна</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Запазване...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Запази промените
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/protected/programs/${program.id}`)}
              disabled={isLoading}
            >
              Отказ
            </Button>
          </div>

          {/* Edit Calendar Link */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Искаш да редактираш упражненията и календара?
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/protected/programs/${program.id}/edit-calendar`)}
              disabled={isLoading}
              className="w-full"
            >
              Редактирай календара и упражненията
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}