"use client"

import * as React from "react"
import { format } from "date-fns"
import { bg } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface BirthDatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  className?: string
}

export function BirthDatePicker({
  date,
  onDateChange,
  className,
}: BirthDatePickerProps) {
  const currentYear = new Date().getFullYear()
  const [day, setDay] = React.useState<string>(date ? date.getDate().toString() : "")
  const [month, setMonth] = React.useState<string>(date ? (date.getMonth() + 1).toString() : "")
  const [year, setYear] = React.useState<string>(date ? date.getFullYear().toString() : "")

  const months = [
    { value: "1", label: "Януари" },
    { value: "2", label: "Февруари" },
    { value: "3", label: "Март" },
    { value: "4", label: "Април" },
    { value: "5", label: "Май" },
    { value: "6", label: "Юни" },
    { value: "7", label: "Юли" },
    { value: "8", label: "Август" },
    { value: "9", label: "Септември" },
    { value: "10", label: "Октомври" },
    { value: "11", label: "Ноември" },
    { value: "12", label: "Декември" },
  ]

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString())
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => (currentYear - 16 - i).toString())

  React.useEffect(() => {
    if (day && month && year) {
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      if (onDateChange && !isNaN(selectedDate.getTime())) {
        onDateChange(selectedDate)
      }
    } else {
      if (onDateChange) {
        onDateChange(undefined)
      }
    }
  }, [day, month, year, onDateChange])

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {/* Day */}
      <div className="relative">
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
        >
          <option value="">Ден</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
      </div>

      {/* Month */}
      <div className="relative">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
        >
          <option value="">Месец</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
      </div>

      {/* Year */}
      <div className="relative">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
        >
          <option value="">Година</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    </div>
  )
}
