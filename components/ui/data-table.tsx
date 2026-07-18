'use client'

export function DataTable({
  header,
  children,
}: {
  header?: React.ReactNode
  children: React.ReactNode
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
    </div>
  )
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border bg-secondary/30">{children}</tr>
    </thead>
  )
}

export function DataTableTh({
  children,
  align = 'left',
}: {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
}) {
  const alignClass =
    align === 'center'
      ? 'text-center'
      : align === 'right'
        ? 'text-right'
        : 'text-left'
  return (
    <th className={`px-4 py-3 ${alignClass} font-semibold text-foreground`}>
      {children}
    </th>
  )
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function DataTableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-border last:border-0">{children}</tr>
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
