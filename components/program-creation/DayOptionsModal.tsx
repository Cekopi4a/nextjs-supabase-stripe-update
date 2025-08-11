"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Moon, Calendar, X } from "lucide-react";

export type DayType = 'workout' | 'rest' | 'free';

interface DayOptionsModalProps {
  date: Date;
  currentType?: DayType;
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: DayType) => void;
}

export function DayOptionsModal({ 
  date, 
  currentType, 
  isOpen, 
  onClose, 
  onSelectType 
}: DayOptionsModalProps) {
  if (!isOpen) return null;

  const dateStr = date.toLocaleDateString('bg-BG', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  const options = [
    {
      type: 'workout' as DayType,
      label: 'Добави тренировка',
      description: 'Планирай упражнения за този ден',
      icon: Dumbbell,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700'
    },
    {
      type: 'rest' as DayType,
      label: 'Почивен ден',
      description: 'Маркирай като ден за възстановяване',
      icon: Moon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700'
    },
    {
      type: 'free' as DayType,
      label: 'Свободен ден',
      description: 'Без планирани дейности',
      icon: Calendar,
      color: 'bg-gray-400',
      bgColor: 'bg-gray-50 border-gray-200',
      textColor: 'text-gray-700'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Планиране за {dateStr}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = currentType === option.type;
              
              return (
                <button
                  key={option.type}
                  onClick={() => {
                    onSelectType(option.type);
                    onClose();
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isSelected 
                      ? `${option.bgColor} border-current ring-2 ring-blue-500 ring-opacity-20` 
                      : `${option.bgColor} hover:shadow-md hover:scale-[1.02]`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${option.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${option.textColor} mb-1`}>
                        {option.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Отказ
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}