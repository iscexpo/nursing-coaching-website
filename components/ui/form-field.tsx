'use client'

interface FormFieldProps {
  label?: string
  error?: string
  helpText?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  error,
  helpText,
  required,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="flex-1">{children}</div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  )
}
