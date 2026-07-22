'use client'

import { Check, CheckCircle2, Clock, X, XCircle, AlertCircle, Eye } from 'lucide-react'

type StatusType =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'completed'
  | 'failed'
  | 'warning'
  | 'draft'
  | 'published'

const statusConfig: Record<
  StatusType,
  {
    bgColor: string
    textColor: string
    icon?: React.ElementType | null
    label?: string
  }
> = {
  pending: {
    bgColor: 'bg-amber-100 dark:bg-amber-900',
    textColor: 'text-amber-900 dark:text-amber-100',
    icon: Clock as React.ElementType,
    label: 'Pending',
  },
  approved: {
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-900 dark:text-green-100',
    icon: Check as React.ElementType,
    label: 'Approved',
  },
  rejected: {
    bgColor: 'bg-red-100 dark:bg-red-900',
    textColor: 'text-red-900 dark:text-red-100',
    icon: X as React.ElementType,
    label: 'Rejected',
  },
  active: {
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-900 dark:text-green-100',
    icon: Check as React.ElementType,
    label: 'Active',
  },
  inactive: {
    bgColor: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-900 dark:text-gray-100',
    icon: X as React.ElementType,
    label: 'Inactive',
  },
  completed: {
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    textColor: 'text-blue-900 dark:text-blue-100',
    icon: Check as React.ElementType,
    label: 'Completed',
  },
  failed: {
    bgColor: 'bg-red-100 dark:bg-red-900',
    textColor: 'text-red-900 dark:text-red-100',
    icon: X as React.ElementType,
    label: 'Failed',
  },
  warning: {
    bgColor: 'bg-amber-100 dark:bg-amber-900',
    textColor: 'text-amber-900 dark:text-amber-100',
    icon: AlertCircle as React.ElementType,
    label: 'Warning',
  },
  draft: {
    bgColor: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-900 dark:text-gray-100',
    icon: Eye as React.ElementType,
    label: 'Draft',
  },
  published: {
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-900 dark:text-green-100',
    icon: Check as React.ElementType,
    label: 'Published',
  },
}

interface StatusBadgeProps {
  status: StatusType | string
  customLabel?: string
  showIcon?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({
  status,
  customLabel,
  showIcon = true,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status as StatusType]

  if (!config) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${className}`}>
        {customLabel || status}
      </span>
  )
}

  const Icon = (config.icon || null) as React.ElementType | null
  const label = customLabel || config.label || status

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClass} font-semibold ${config.bgColor} ${config.textColor} ${className}`}
    >
      {showIcon && Icon && <Icon className="size-3.5" />}
      {label}
    </span>
  )
}

/**
 * Attendance status badge with icon
 */
export function AttendanceStatusBadge({
  status,
}: {
  status: 'present' | 'absent' | 'late'
}) {
  const map = {
    present: {
      label: 'উপস্থিত',
      icon: CheckCircle2,
      cls: 'bg-green/10 text-green',
    },
    absent: {
      label: 'অনুপস্থিত',
      icon: XCircle,
      cls: 'bg-destructive/10 text-destructive',
    },
    late: { label: 'বিলম্বিত', icon: AlertCircle, cls: 'bg-gold/10 text-gold' },
  }
  const s = map[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      <s.icon className="size-3" />
      {s.label}
    </span>
  )
}

/**
 * Get badge for enrollment status
 */
export function EnrollmentStatusBadge({
  status,
  ...props
}: StatusBadgeProps & { status: string }) {
  const statusMap: Record<string, StatusType> = {
    'pending': 'pending',
    'approved': 'approved',
    'rejected': 'rejected',
    'active': 'active',
    'completed': 'completed',
    'expired': 'warning',
    'suspended': 'failed',
  }

  return <StatusBadge status={statusMap[status] || 'pending'} {...props} />
}

/**
 * Get badge for payment status
 */
export function PaymentStatusBadge({
  status,
  ...props
}: StatusBadgeProps & { status: string }) {
  const statusMap: Record<string, StatusType> = {
    'pending': 'pending',
    'verified': 'approved',
    'rejected': 'rejected',
    'completed': 'completed',
    'failed': 'failed',
  }

  return <StatusBadge status={statusMap[status] || 'pending'} {...props} />
}

/**
 * Get badge for exam status
 */
export function ExamStatusBadge({
  status,
  ...props
}: StatusBadgeProps & { status: string }) {
  const statusMap: Record<string, StatusType> = {
    'draft': 'draft',
    'active': 'active',
    'completed': 'completed',
    'published': 'published',
  }

  return <StatusBadge status={statusMap[status] || 'draft'} {...props} />
}

/**
 * Payment method badge (bKash, Nagad, Cash, Bank)
 */
export function MethodBadge({ method }: { method: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    bkash: { label: 'bKash', cls: 'bg-[#E2136E]/10 text-[#E2136E]' },
    nagad: { label: 'Nagad', cls: 'bg-[#F6921E]/10 text-[#F6921E]' },
    cash: { label: 'নগদ', cls: 'bg-green/10 text-green' },
    bank: { label: 'ব্যাংক', cls: 'bg-brand/10 text-brand' },
  }
  const s = map[method] || {
    label: method,
    cls: 'bg-secondary text-muted-foreground',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  )
}

/**
 * Invoice status badge
 */
export function InvoiceStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: 'পরিশোধিত', cls: 'bg-green/10 text-green' },
    partial: { label: 'আংশিক', cls: 'bg-gold/10 text-gold' },
    unpaid: { label: 'অপরিশোধিত', cls: 'bg-destructive/10 text-destructive' },
    overdue: { label: 'বিলম্বিত', cls: 'bg-destructive/10 text-destructive' },
  }
  const s = map[status] || {
    label: status,
    cls: 'bg-secondary text-muted-foreground',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  )
}
