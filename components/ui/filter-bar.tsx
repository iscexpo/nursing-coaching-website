'use client'

import { Search, X } from 'lucide-react'
import { Button } from './button'

interface FilterOption {
  value: string
  label: string
}

interface FilterBarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: Array<{
    name: string
    label: string
    type: 'select' | 'text' | 'date'
    options?: FilterOption[]
    value?: string
    onChange?: (value: string) => void
  }>
  onClearFilters?: () => void
  className?: string
}

export function FilterBar({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filters = [],
  onClearFilters,
  className = '',
}: FilterBarProps) {
  const hasActiveFilters = searchValue || filters.some((f) => f.value)

  return (
    <div
      className={`space-y-3 rounded-lg border border-border bg-card p-4 ${className}`}
    >
      {/* Search bar */}
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      )}

      {/* Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <div key={filter.name}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={filter.value || ''}
                  onChange={(e) => filter.onChange?.(e.target.value)}
                  className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
                >
                  <option value="">All</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'date' ? (
                <input
                  type="date"
                  value={filter.value || ''}
                  onChange={(e) => filter.onChange?.(e.target.value)}
                  className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
                />
              ) : (
                <input
                  type="text"
                  value={filter.value || ''}
                  onChange={(e) => filter.onChange?.(e.target.value)}
                  className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Clear button */}
      {hasActiveFilters && onClearFilters && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearFilters}
            className="gap-1 text-xs"
          >
            <X className="size-3" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
