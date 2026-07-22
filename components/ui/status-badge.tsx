'use client'

import { Check, Clock, X, AlertCircle, Eye } from 'lucide-react'

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
