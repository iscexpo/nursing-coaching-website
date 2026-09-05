'use client'

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
}) {
  const colorMap: Record<string, { bg: string; icon: string }> = {
    brand: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
    },
    green: {
      bg: 'bg-emerald-500/10',
      icon: 'text-emerald-500',
    },
    gold: {
      bg: 'bg-amber-500/10',
      icon: 'text-amber-500',
    },
    destructive: {
      bg: 'bg-destructive/10',
      icon: 'text-destructive',
    },
  }
  const colors = colorMap[color] || colorMap.brand
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors duration-200 hover:border-neutral-300 dark:hover:border-neutral-700">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-9 items-center justify-center rounded-md ${colors.bg}`}
        >
          <Icon className={`size-4 ${colors.icon}`} />
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">
            {sub ? `${label} · ${sub}` : label}
          </p>
        </div>
      </div>
    </div>
  )
}
