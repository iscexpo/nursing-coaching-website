'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface CalendarViewProps {
  attendanceData?: Record<string, 'present' | 'absent' | 'late'>
  onDateClick?: (date: string) => void
  onMonthChange?: (month: number, year: number) => void
  isLoading?: boolean
  className?: string
}

export function CalendarView({
  attendanceData = {},
  onDateClick,
  onMonthChange,
  isLoading = false,
  className = '',
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1)
    setCurrentDate(newDate)
    onMonthChange?.(newDate.getMonth(), newDate.getFullYear())
  }

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1)
    setCurrentDate(newDate)
    onMonthChange?.(newDate.getMonth(), newDate.getFullYear())
  }

  const getStatusColor = (date: string) => {
    const status = attendanceData[date]
    switch (status) {
      case 'present':
        return 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100'
      case 'absent':
        return 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100'
      case 'late':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
      default:
        return 'hover:bg-secondary'
    }
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const calendarDays = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {months[month]} {year}
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrevMonth}
            disabled={isLoading}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNextMonth}
            disabled={isLoading}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day, index) => (
          <div key={index}>
            {day ? (
              <button
                onClick={() => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  onDateClick?.(dateStr)
                }}
                disabled={isLoading}
                className={`w-full aspect-square rounded-lg border border-border text-sm font-medium transition-colors ${getStatusColor(
                  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                )}`}
              >
                {day}
              </button>
            ) : (
              <div className="w-full aspect-square" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700" />
          <span className="text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700" />
          <span className="text-muted-foreground">Late</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700" />
          <span className="text-muted-foreground">Absent</span>
        </div>
      </div>
    </div>
  )
}
