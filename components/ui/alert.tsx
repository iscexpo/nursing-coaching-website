'use client'

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { useState } from 'react'

type AlertVariant = 'error' | 'warning' | 'success' | 'info'

interface AlertProps {
  title?: string
  message: string
  variant?: AlertVariant
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const variantConfig: Record<
  AlertVariant,
  {
    icon: React.ElementType
    bgColor: string
    textColor: string
    borderColor: string
  }
> = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-900 dark:text-red-100',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    textColor: 'text-amber-900 dark:text-amber-100',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-900 dark:text-green-100',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-900 dark:text-blue-100',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
}

export function Alert({
  title,
  message,
  variant = 'info',
  dismissible = true,
  onDismiss,
  className = '',
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  const config = variantConfig[variant]
  const Icon = config.icon as React.ElementType

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div
      className={`flex gap-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor} p-4 ${className}`}
    >
      <div className="flex-shrink-0">
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        <p className={title ? 'mt-1 text-sm' : 'text-sm'}>{message}</p>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
