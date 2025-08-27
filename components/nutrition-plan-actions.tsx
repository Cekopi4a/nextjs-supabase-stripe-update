"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Copy, 
  Share, 
  Download, 
  Calendar,
  Check,
  X,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NutritionPlanActionsProps {
  planId: string;
  planName: string;
  onPlanCopied?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Неделя', short: 'Нед' },
  { value: 1, label: 'Понеделник', short: 'Пон' },
  { value: 2, label: 'Вторник', short: 'Вто' },
  { value: 3, label: 'Сряда', short: 'Сря' },
  { value: 4, label: 'Четвъртък', short: 'Чет' },
  { value: 5, label: 'Петък', short: 'Пет' },
  { value: 6, label: 'Събота', short: 'Съб' }
];

export default function NutritionPlanActions({ planId, planName, onPlanCopied }: NutritionPlanActionsProps) {
  const [copying, setCopying] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedSourceDay, setSelectedSourceDay] = useState<number>(1); // Понеделник по подразбиране
  const [selectedTargetDays, setSelectedTargetDays] = useState<number[]>([]);
  const [exporting, setExporting] = useState(false);

  const handleCopyDayMeals = async () => {
    if (selectedTargetDays.length === 0) {
      alert('Моля изберете поне един ден за копиране');
      return;
    }

    setCopying(true);
    try {
      const response = await fetch(`/api/nutrition-plans/${planId}/copy-day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_day: selectedSourceDay,
          target_days: selectedTargetDays
        })
      });

      if (!response.ok) {
        throw new Error('Грешка при копиране на храненията');
      }

      alert(`Храненията от ${DAYS_OF_WEEK[selectedSourceDay].label} са копирани успешно!`);
      setCopyDialogOpen(false);
      setSelectedTargetDays([]);
      onPlanCopied?.();
      
    } catch (error: any) {
      console.error('Грешка при копиране:', error);
      alert('Грешка: ' + error.message);
    } finally {
      setCopying(false);
    }
  };

  const handleExportPlan = async (format: 'pdf' | 'excel') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/nutrition-plans/${planId}/export?format=${format}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Грешка при експортиране');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${planName}_nutrition_plan.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error: any) {
      console.error('Грешка при експортиране:', error);
      alert('Грешка: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const toggleTargetDay = (day: number) => {
    if (day === selectedSourceDay) return; // Не може да копираме в същия ден
    
    if (selectedTargetDays.includes(day)) {
      setSelectedTargetDays(selectedTargetDays.filter(d => d !== day));
    } else {
      setSelectedTargetDays([...selectedTargetDays, day]);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Copy Day Meals Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Копирай ден
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Копиране на хранения за ден</DialogTitle>
            <DialogDescription>
              Изберете от кой ден да копирате храненията и в кои дни да ги поставите.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Source Day Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Копирай от:</label>
              <select
                value={selectedSourceDay}
                onChange={(e) => setSelectedSourceDay(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Days Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Копирай в:</label>
              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map(day => {
                  const isSource = day.value === selectedSourceDay;
                  const isSelected = selectedTargetDays.includes(day.value);
                  
                  return (
                    <button
                      key={day.value}
                      type="button"
                      disabled={isSource}
                      onClick={() => toggleTargetDay(day.value)}
                      className={`
                        p-2 text-xs rounded-md border transition-colors
                        ${isSource 
                          ? 'bg-orange-100 text-orange-600 border-orange-200 cursor-not-allowed' 
                          : isSelected 
                            ? 'bg-green-500 text-white border-green-500' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {isSelected && <Check className="h-3 w-3 mx-auto" />}
                      <div className="mt-1">{day.short}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Кликнете върху дните, в които искате да копирате храненията
              </p>
            </div>

            {selectedTargetDays.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Ще копирате от:</strong> {DAYS_OF_WEEK[selectedSourceDay].label}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Ще копирате в:</strong> {selectedTargetDays.map(day => DAYS_OF_WEEK[day].label).join(', ')}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    ⚠️ Съществуващите хранения в избраните дни ще бъдат заменени
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCopyDialogOpen(false)}
            >
              Отказ
            </Button>
            <Button 
              onClick={handleCopyDayMeals}
              disabled={copying || selectedTargetDays.length === 0}
            >
              {copying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Копиране...
                </>
              ) : (
                'Копирай'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Buttons */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleExportPlan('pdf')}
        disabled={exporting}
      >
        {exporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        PDF
      </Button>

      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleExportPlan('excel')}
        disabled={exporting}
      >
        {exporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Excel
      </Button>
    </div>
  );
}