"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarViewToggle } from "@/components/program-creation/CalendarViewToggle";
import { ChevronLeft, ChevronRight, Dumbbell, Moon, Calendar as CalendarIcon, Plus } from "lucide-react";
import { DayType } from "@/components/program-creation/DayOptionsModal";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInProgramDuration: boolean;
  dayType?: DayType;
  workoutCount: number;
}

interface EnhancedCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  programStartDate: Date;
  programDurationWeeks: number;
  dayTypes: Record<string, DayType>;
  workoutsByDate: Record<string, unknown[]>;
}

const BULGARIAN_MONTHS = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"
];

const BULGARIAN_DAYS = ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"];
const BULGARIAN_DAYS_FULL = ["Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"];

function CalendarDayCell({ 
  day, 
  onSelect 
}: { 
  day: CalendarDay; 
  onSelect: () => void;
}) {

  const getDayIcon = () => {
    if (day.dayType === 'workout') return <Dumbbell className="h-3 w-3" />;
    if (day.dayType === 'rest') return <Moon className="h-3 w-3" />;
    return null;
  };

  const getDayStyles = () => {
    let baseStyles = "h-20 md:h-24 p-2 rounded-lg cursor-pointer transition-all duration-200 border-2 ";
    
    // Base background
    if (!day.isCurrentMonth) {
      baseStyles += "opacity-40 bg-gray-50 ";
    } else {
      baseStyles += "bg-white hover:bg-gray-50 ";
    }
    
    // Program duration highlighting
    if (day.isInProgramDuration && day.isCurrentMonth) {
      baseStyles += "bg-blue-50 border-blue-200 ";
    } else {
      baseStyles += "border-gray-200 ";
    }
    
    // Day type styling
    if (day.dayType === 'workout') {
      baseStyles += "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 ";
    } else if (day.dayType === 'rest') {
      baseStyles += "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:from-purple-100 hover:to-violet-100 ";
    }
    
    // Selection and today highlighting
    if (day.isToday) {
      baseStyles += "ring-2 ring-blue-500 ";
    }
    
    if (day.isSelected) {
      baseStyles += "ring-2 ring-purple-500 border-purple-200 ";
    }
    
    baseStyles += "hover:shadow-md hover:scale-[1.02] ";
    
    return baseStyles;
  };

  return (
    <div
      className={getDayStyles()}
      onClick={onSelect}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-gray-900">
            {day.date.getDate()}
          </span>
          {getDayIcon()}
        </div>
        
        {day.workoutCount > 0 && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded text-center">
              {day.workoutCount} упр.
            </div>
          </div>
        )}
        
        {day.workoutCount === 0 && day.dayType !== 'rest' && day.isCurrentMonth && (
          <div className="flex-1 flex items-center justify-center opacity-30">
            <Plus className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}

function WeekView({ 
  days, 
  onDateSelect 
}: { 
  days: CalendarDay[];
  onDateSelect: (date: Date) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-4">
      {BULGARIAN_DAYS_FULL.map((dayName, index) => (
        <div key={dayName} className="text-center">
          <div className="text-sm font-semibold text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
            {dayName}
          </div>
          {days[index] && (
            <div className="h-32">
              <CalendarDayCell
                day={{ ...days[index], isCurrentMonth: true }}
                onSelect={() => onDateSelect(days[index].date)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MonthView({ 
  days, 
  onDateSelect 
}: { 
  days: CalendarDay[];
  onDateSelect: (date: Date) => void;
}) {
  return (
    <div>
      {/* Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {BULGARIAN_DAYS.map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <CalendarDayCell
            key={index}
            day={day}
            onSelect={() => onDateSelect(day.date)}
          />
        ))}
      </div>
    </div>
  );
}

export function EnhancedCalendar({
  currentDate,
  onDateChange,
  view,
  onViewChange,
  selectedDate,
  onDateSelect,
  programStartDate,
  programDurationWeeks,
  dayTypes,
  workoutsByDate
}: EnhancedCalendarProps) {
  const generateCalendarDays = (): CalendarDay[] => {
    if (view === 'week') {
      // Generate week view (7 days starting from Monday)
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = (currentDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
      
      const days: CalendarDay[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        days.push(createCalendarDay(date));
      }
      
      return days;
    } else {
      // Generate month view
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const firstDayOfMonth = new Date(year, month, 1);
      const firstDayOfCalendar = new Date(firstDayOfMonth);
      
      // Start from Monday
      const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
      firstDayOfCalendar.setDate(firstDayOfMonth.getDate() - dayOfWeek);
      
      const days: CalendarDay[] = [];
      const dateLoop = new Date(firstDayOfCalendar);
      
      while (days.length < 42) { // 6 weeks × 7 days
        days.push(createCalendarDay(new Date(dateLoop)));
        dateLoop.setDate(dateLoop.getDate() + 1);
      }
      
      return days;
    }
  };

  const createCalendarDay = (date: Date): CalendarDay => {
    const dateKey = date.toISOString().split('T')[0];
    const isCurrentMonth = view === 'week' || date.getMonth() === currentDate.getMonth();
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    
    // Check if date is within program duration
    const programEndDate = new Date(programStartDate);
    programEndDate.setDate(programStartDate.getDate() + (programDurationWeeks * 7));
    const isInProgramDuration = date >= programStartDate && date <= programEndDate;
    
    return {
      date,
      isCurrentMonth,
      isToday,
      isSelected,
      isInProgramDuration,
      dayType: dayTypes[dateKey],
      workoutCount: workoutsByDate[dateKey]?.length || 0
    };
  };

  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    }
    onDateChange(newDate);
  };

  const getTimeLabel = () => {
    if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = (currentDate.getDay() + 6) % 7;
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${BULGARIAN_MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
      return `${BULGARIAN_MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const days = generateCalendarDays();

  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-semibold flex items-center">
          <CalendarIcon className="h-6 w-6 mr-3 text-purple-600" />
          Календарен план
        </h2>
        
        <CalendarViewToggle view={view} onViewChange={onViewChange} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" onClick={() => navigateTime('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold min-w-[250px] text-center">
          {getTimeLabel()}
        </span>
        <Button variant="outline" size="sm" onClick={() => navigateTime('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      {view === 'week' ? (
        <WeekView days={days} onDateSelect={onDateSelect} />
      ) : (
        <MonthView days={days} onDateSelect={onDateSelect} />
      )}

      {/* Legend */}
      <div className="mt-6 space-y-2">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-gray-600">В рамките на програмата</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center">
              <Dumbbell className="h-2 w-2 text-green-600" />
            </div>
            <span className="text-gray-600">Тренировъчен ден</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded flex items-center justify-center">
              <Moon className="h-2 w-2 text-purple-600" />
            </div>
            <span className="text-gray-600">Почивен ден</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 italic">
          💡 Кликнете върху ден за да го изберете и редактирате в секцията отдолу
        </div>
      </div>
    </Card>
  );
}