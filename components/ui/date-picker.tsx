"use client"

import * as React from "react"
import { format } from "date-fns"
import { bg } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  fromYear?: number
  toYear?: number
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Изберете дата",
  className,
  fromYear = 1950,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [month, setMonth] = React.useState<Date>(date || new Date())

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate)
    if (onDateChange) {
      onDateChange(newDate)
    }
  }

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth)
  }

  const years = Array.from(
    { length: toYear - fromYear + 1 },
    (_, i) => fromYear + i
  ).reverse()

  const months = [
    "Януари",
    "Февруари",
    "Март",
    "Април",
    "Май",
    "Юни",
    "Юли",
    "Август",
    "Септември",
    "Октомври",
    "Ноември",
    "Декември",
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-11",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "dd MMMM yyyy", { locale: bg })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex gap-2">
            <Select
              value={month.getMonth().toString()}
              onValueChange={(value) => {
                const newDate = new Date(month)
                newDate.setMonth(parseInt(value))
                handleMonthChange(newDate)
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthName, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={month.getFullYear().toString()}
              onValueChange={(value) => {
                const newDate = new Date(month)
                newDate.setFullYear(parseInt(value))
                handleMonthChange(newDate)
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          month={month}
          onMonthChange={handleMonthChange}
          initialFocus
          locale={bg}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
        />
      </PopoverContent>
    </Popover>
  )
}
