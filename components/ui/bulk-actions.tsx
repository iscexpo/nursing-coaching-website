'use client'

import { Button } from './button'
import { Trash2, Download, CheckCircle, XCircle } from 'lucide-react'

export interface BulkAction {
  id: string
  label: string
  icon?: React.ElementType | null
  variant?: 'default' | 'destructive'
  onClick: (selectedIds: string[]) => void | Promise<void>
}

interface BulkActionsProps {
  selectedCount: number
  selectedIds: string[]
  totalCount: number
  actions: BulkAction[]
  onSelectAll?: (selected: boolean) => void
  onClearSelection?: () => void
  isLoading?: boolean
}

const DEFAULT_ACTIONS: Record<string, BulkAction> = {
  delete: {
    id: 'delete',
    label: 'Delete Selected',
    icon: Trash2 as React.ElementType,
    variant: 'destructive',
    onClick: () => {},
  },
  approve: {
    id: 'approve',
    label: 'Approve Selected',
    icon: CheckCircle as React.ElementType,
    onClick: () => {},
  },
  reject: {
    id: 'reject',
    label: 'Reject Selected',
    icon: XCircle as React.ElementType,
    onClick: () => {},
  },
  export: {
    id: 'export',
    label: 'Export Selected',
    icon: Download as React.ElementType,
    onClick: () => {},
  },
}

export function BulkActions({
  selectedCount,
  selectedIds,
  totalCount,
  actions,
  onSelectAll,
  onClearSelection,
  isLoading = false,
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  const isAllSelected = selectedCount === totalCount && totalCount > 0

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-blue-50 dark:bg-blue-950 p-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        {totalCount > selectedCount && onSelectAll && (
          <button
            onClick={() => onSelectAll(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Select all {totalCount} items
          </button>
        )}
        {isAllSelected && onClearSelection && (
          <button
            onClick={onClearSelection}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions.map((action) => {
          const Icon = (action.icon || null) as React.ElementType | null
          return (
            <Button
              key={action.id}
              size="sm"
              variant={action.variant || 'default'}
              onClick={() => action.onClick(selectedIds)}
              disabled={isLoading}
              className={Icon ? 'gap-2' : ''}
            >
              {Icon && <Icon className="size-4" />}
              {action.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Get default bulk action by ID
 */
export function getDefaultBulkAction(id: string): BulkAction | undefined {
  return DEFAULT_ACTIONS[id]
}
