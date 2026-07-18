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
  const colorMap: Record<
    string,
    { bg: string; icon: string; gradient: string }
  > = {
    brand: {
      bg: 'bg-brand/10',
      icon: 'text-brand',
      gradient: 'from-brand/5 to-transparent',
    },
    green: {
      bg: 'bg-green/10',
      icon: 'text-green',
      gradient: 'from-green/5 to-transparent',
    },
    gold: {
      bg: 'bg-gold/10',
      icon: 'text-gold',
      gradient: 'from-gold/5 to-transparent',
    },
    destructive: {
      bg: 'bg-destructive/10',
      icon: 'text-destructive',
      gradient: 'from-destructive/5 to-transparent',
    },
  }
  const colors = colorMap[color] || colorMap.brand
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
      />
      <div className="relative flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${colors.bg}`}
        >
          <Icon className={`size-5 ${colors.icon}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">
            {sub ? `${label} · ${sub}` : label}
          </p>
        </div>
      </div>
    </div>
  )
}
