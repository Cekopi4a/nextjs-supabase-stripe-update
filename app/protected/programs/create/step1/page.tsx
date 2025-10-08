"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgramInfoForm } from "@/components/program-creation/ProgramInfoForm";

export interface ProgramData {
  name: string;
  difficulty: string;
  durationWeeks: number;
  description: string;
  startDate: string;
}

export default function CreateProgramStep1() {
  const router = useRouter();
  const [formData] = useState<ProgramData>({
    name: "",
    difficulty: "",
    durationWeeks: 8,
    description: "",
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (data: ProgramData) => {
    const queryParams = new URLSearchParams({
      name: data.name,
      difficulty: data.difficulty,
      durationWeeks: data.durationWeeks.toString(),
      description: data.description,
      startDate: data.startDate
    });

    router.push(`/protected/programs/create/step2?${queryParams.toString()}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Създай Тренировъчна Програма</h1>
        <p className="text-muted-foreground mb-6">Стъпка 1 от 2: Основна информация</p>
        
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              1
            </div>
            <div className="w-16 h-1 bg-muted"></div>
            <div className="flex items-center justify-center w-8 h-8 bg-muted text-muted-foreground rounded-full text-sm font-medium">
              2
            </div>
          </div>
        </div>
      </div>

      <ProgramInfoForm
        initialData={formData}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/protected/programs")}
      />
    </div>
  );
}