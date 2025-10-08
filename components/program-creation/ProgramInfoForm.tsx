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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { ProgramData } from "@/app/protected/programs/create/step1/page";

interface ProgramInfoFormProps {
  initialData: ProgramData;
  onSubmit: (data: ProgramData) => void;
  onCancel: () => void;
}

const BULGARIAN_MONTHS = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

const BULGARIAN_DAYS_SHORT = ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"];

interface CalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
}

function DatePickerCalendar({ selected, onSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selected));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get first day of calendar (Monday of first week)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - firstDayOfWeek);

    const days: Date[] = [];
    const currentDate = new Date(calendarStart);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selected.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="p-4 w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold text-sm">
          {BULGARIAN_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {BULGARIAN_DAYS_SHORT.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isTodayDate = isToday(day);
          const isSelectedDate = isSelected(day);
          const isInCurrentMonth = isCurrentMonth(day);

          return (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelect(day)}
              className={`
                h-9 w-9 p-0 font-normal text-sm rounded-lg
                ${!isInCurrentMonth ? 'text-muted-foreground opacity-40' : ''}
                ${isTodayDate ? 'border-2 border-primary' : ''}
                ${isSelectedDate
                  ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
                }
              `}
            >
              {day.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export function ProgramInfoForm({ initialData, onSubmit, onCancel }: ProgramInfoFormProps) {
  const [formData, setFormData] = useState<ProgramData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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

    if (!formData.startDate) {
      newErrors.startDate = "Началната дата е задължителна";
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

        <div>
          <Label>Начална дата *</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  errors.startDate ? "border-red-500" : ""
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? (
                  <span>
                    {new Date(formData.startDate + 'T00:00:00').toLocaleDateString('bg-BG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Изберете дата</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DatePickerCalendar
                selected={formData.startDate ? new Date(formData.startDate + 'T00:00:00') : new Date()}
                onSelect={(date) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  updateFormData("startDate", `${year}-${month}-${day}`);
                  setIsCalendarOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && (
            <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
          )}
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