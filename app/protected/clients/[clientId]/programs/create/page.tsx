"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
export default function CreateClientProgramPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;

  useEffect(() => {
    router.replace(`/protected/clients/${clientId}/programs/create/step1`);
  }, [router, clientId]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Пренасочване към новия интерфейс...</p>
      </div>
    </div>
  );
}