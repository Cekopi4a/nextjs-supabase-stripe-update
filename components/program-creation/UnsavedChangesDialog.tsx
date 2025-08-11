"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Save, X } from "lucide-react";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({
  isOpen,
  onSave,
  onDiscard,
  onCancel
}: UnsavedChangesDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Незапазени промени
            </h2>
          </div>

          <p className="text-gray-600 mb-6">
            Имате незапазени промени в програмата. Искате ли да ги запазите преди да продължите?
          </p>

          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Отказ
            </Button>
            <Button
              onClick={onDiscard}
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              Не запазвай
            </Button>
            <Button
              onClick={onSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Запази
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}