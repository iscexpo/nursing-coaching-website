'use client'

import { CardSkeleton } from './skeleton'
import { EmptyState } from './empty-state'
import { BarChart3 } from 'lucide-react'

interface ChartCardProps {
  title?: string
  description?: string
  isLoading?: boolean
  isEmpty?: boolean
  error?: Error | null
  children: React.ReactNode
  className?: string
}

export function ChartCard({
  title,
  description,
  isLoading,
  isEmpty,
  error,
  children,
  className = '',
}: ChartCardProps) {
  if (isLoading) {
    return <CardSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-red-500 font-medium">Error loading chart</p>
        <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <EmptyState
          icon={BarChart3}
          title="No data available"
          description="No data to display at this time"
        />
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}>
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="w-full overflow-x-auto">{children}</div>
    </div>
  )
}
