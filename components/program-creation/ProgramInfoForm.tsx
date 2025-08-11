"use client";

import { useState } from "react";
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
import { ProgramData } from "@/app/protected/programs/create/step1/page";

interface ProgramInfoFormProps {
  initialData: ProgramData;
  onSubmit: (data: ProgramData) => void;
  onCancel: () => void;
}

export function ProgramInfoForm({ initialData, onSubmit, onCancel }: ProgramInfoFormProps) {
  const [formData, setFormData] = useState<ProgramData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Името на програмата е задължително";
    }

    if (!formData.difficulty) {
      newErrors.difficulty = "Моля изберете ниво на трудност";
    }

    if (formData.durationWeeks < 1 || formData.durationWeeks > 52) {
      newErrors.durationWeeks = "Продължителността трябва да е между 1 и 52 седмици";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateFormData = (field: keyof ProgramData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Име на програмата *</Label>
          <Input
            id="name"
            placeholder="например: Начинаещо силово тренировка"
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            placeholder="Опишете целите и подхода на програмата..."
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Ниво на трудност *</Label>
            <Select 
              value={formData.difficulty} 
              onValueChange={(value) => updateFormData("difficulty", value)}
            >
              <SelectTrigger className={errors.difficulty ? "border-red-500" : ""}>
                <SelectValue placeholder="Изберете ниво" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Начинаещ</SelectItem>
                <SelectItem value="intermediate">Средно ниво</SelectItem>
                <SelectItem value="advanced">Напреднал</SelectItem>
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <p className="text-sm text-red-500 mt-1">{errors.difficulty}</p>
            )}
          </div>

          <div>
            <Label htmlFor="durationWeeks">Продължителност (седмици) *</Label>
            <Input
              id="durationWeeks"
              type="number"
              min="1"
              max="52"
              value={formData.durationWeeks}
              onChange={(e) => updateFormData("durationWeeks", Number(e.target.value))}
              className={errors.durationWeeks ? "border-red-500" : ""}
            />
            {errors.durationWeeks && (
              <p className="text-sm text-red-500 mt-1">{errors.durationWeeks}</p>
            )}
          </div>
        </div>


        <div className="flex gap-4 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Отказ
          </Button>
          <Button 
            type="submit"
            className="flex-1"
          >
            Продължи към стъпка 2
          </Button>
        </div>
      </form>
    </Card>
  );
}