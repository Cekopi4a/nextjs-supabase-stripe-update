"use client";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays } from "lucide-react";

interface CalendarViewToggleProps {
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
}

export function CalendarViewToggle({ view, onViewChange }: CalendarViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      <Button
        variant={view === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('week')}
        className="h-8 px-3"
      >
        <CalendarDays className="h-4 w-4 mr-1" />
        Седмичен изглед
      </Button>
      <Button
        variant={view === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('month')}
        className="h-8 px-3"
      >
        <Calendar className="h-4 w-4 mr-1" />
        Месечен изглед
      </Button>
    </div>
  );
}