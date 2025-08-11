"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProgramInfoForm } from "@/components/program-creation/ProgramInfoForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User } from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";

export interface ProgramData {
  name: string;
  difficulty: string;
  durationWeeks: number;
  description: string;
}

interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export default function CreateClientProgramStep1() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;
  const supabase = createSupabaseClient();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ProgramData>({
    name: "",
    difficulty: "",
    durationWeeks: 8,
    description: ""
  });

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      
      setClient(data);
      setFormData(prev => ({
        ...prev,
        name: `Програма за ${data.full_name}`
      }));
    } catch (error) {
      console.error('Error fetching client:', error);
      router.push('/protected/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (data: ProgramData) => {
    const queryParams = new URLSearchParams({
      name: data.name,
      difficulty: data.difficulty,
      durationWeeks: data.durationWeeks.toString(),
      description: data.description
    });

    router.push(`/protected/clients/${clientId}/programs/create/step2?${queryParams.toString()}`);
  };

  const handleCancel = () => {
    router.push(`/protected/clients/${clientId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Зарежда...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Клиентът не е намерен</p>
          <Button onClick={() => router.push('/protected/clients')}>
            Назад към клиентите
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Client Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/protected/clients')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Клиенти
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
            {client.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Програма за {client.full_name}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <User className="h-4 w-4" />
              {client.email}
            </p>
          </div>
        </div>
      </Card>

      {/* Progress and Form */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Създай Тренировъчна Програма</h2>
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
        onCancel={handleCancel}
      />
    </div>
  );
}