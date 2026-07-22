'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { Button } from './button'

export function DataTable({
  header,
  children,
  sticky = true,
  onExport,
}: {
  header?: React.ReactNode
  children: React.ReactNode
  sticky?: boolean
  onExport?: () => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {header && (
        <div className="border-b border-border bg-secondary/30 px-5 py-3">
          {header}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
      {onExport && (
        <div className="border-t border-border bg-secondary/20 px-5 py-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={onExport} className="gap-2">
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      )}
    </div>
  )
}

export function DataTableHead({ 
  children,
  sticky = true 
}: { 
  children: React.ReactNode
  sticky?: boolean
}) {
  return (
    <thead className={sticky ? 'sticky top-0 z-10' : ''}>
      <tr className="border-b border-border bg-secondary/30">{children}</tr>
    </thead>
  )
}

export function DataTableTh({
  children,
  align = 'left',
  sortable = false,
  onSort,
  sortDirection,
}: {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  onSort?: () => void
  sortDirection?: 'asc' | 'desc' | null
}) {
  const alignClass =
    align === 'center'
      ? 'text-center'
      : align === 'right'
        ? 'text-right'
        : 'text-left'
  
  return (
    <th 
      className={`px-4 py-3 ${alignClass} font-semibold text-foreground ${
        sortable ? 'cursor-pointer hover:bg-secondary/50 transition-colors' : ''
      }`}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && sortDirection && (
          <span className="text-xs">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  )
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function DataTableRow({ 
  children,
  selected = false,
  onSelect,
}: { 
  children: React.ReactNode
  selected?: boolean
  onSelect?: (selected: boolean) => void
}) {
  return (
    <tr 
      className={`border-b border-border last:border-0 ${selected ? 'bg-secondary/50' : 'hover:bg-secondary/20'}`}
      onClick={() => onSelect?.(!selected)}
    >
      {children}
    </tr>
  )
}

export function DataTableCheckbox({
  checked = false,
  indeterminate = false,
  onChange,
}: {
  checked?: boolean
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
}) {
  return (
    <td className="px-4 py-3 w-12">
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el && indeterminate) {
            el.indeterminate = true
          }
        }}
        onChange={(e) => onChange?.(e.target.checked)}
        className="cursor-pointer w-4 h-4 rounded border border-border"
      />
    </td>
  )
}

export function DataTableTd({
  children,
  align = 'left',
  className = '',
}: {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}) {
  const alignClass =
    align === 'center'
      ? 'text-center'
      : align === 'right'
        ? 'text-right'
        : 'text-left'
  return <td className={`px-4 py-3 ${alignClass} ${className}`}>{children}</td>
}

interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-border bg-secondary/20">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Show:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span className="text-sm text-muted-foreground">of {totalItems} items</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
