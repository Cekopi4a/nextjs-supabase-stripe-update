"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteNutritionPlanButtonProps {
  planId: string;
  planName: string;
}

export function DeleteNutritionPlanButton({
  planId,
  planName,
}: DeleteNutritionPlanButtonProps) {
  const router = useRouter();
  const supabase = createSupabaseClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("nutrition_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;

      router.push("/protected/nutrition-plans");
      router.refresh();
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Грешка при изтриване на плана");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Изтриване на хранителен план</AlertDialogTitle>
          <AlertDialogDescription>
            Сигурни ли сте, че искате да изтриете плана "<strong>{planName}</strong>"?
            <br />
            <br />
            <span className="text-destructive font-medium">
              ⚠️ Това действие е необратимо. Всички дневни ястия свързани с този план също ще бъдат изтрити.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Откажи</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Изтриване..." : "Изтрий"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}