'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from './button'

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onStartDateChange?: (date: string) => void
  onEndDateChange?: (date: string) => void
  onApply?: (startDate: string, endDate: string) => void
  showPresets?: boolean
  className?: string
}

const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

export function DateRangePicker({
  startDate = '',
  endDate = '',
  onStartDateChange,
  onEndDateChange,
  onApply,
  showPresets = true,
  className = '',
}: DateRangePickerProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate)
  const [localEndDate, setLocalEndDate] = useState(endDate)

  const handlePreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    setLocalStartDate(startStr)
    setLocalEndDate(endStr)

    onStartDateChange?.(startStr)
    onEndDateChange?.(endStr)
    onApply?.(startStr, endStr)
  }

  const handleApply = () => {
    onApply?.(localStartDate, localEndDate)
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border border-border bg-card p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Date Range</span>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="date"
            value={localStartDate}
            onChange={(e) => {
              setLocalStartDate(e.target.value)
              onStartDateChange?.(e.target.value)
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="Start date"
          />
        </div>
        <div className="flex-1">
          <input
            type="date"
            value={localEndDate}
            onChange={(e) => {
              setLocalEndDate(e.target.value)
              onEndDateChange?.(e.target.value)
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="End date"
          />
        </div>
      </div>

      {showPresets && (
        <div className="flex gap-2 pt-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.days}
              size="sm"
              variant="outline"
              onClick={() => handlePreset(preset.days)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}

      {onApply && (
        <Button size="sm" onClick={handleApply} className="mt-2 w-full">
          Apply
        </Button>
      )}
    </div>
  )
}
