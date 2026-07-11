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
  const colorMap: Record<string, string> = {
    brand: 'bg-brand/10 text-brand',
    green: 'bg-green/10 text-green',
    gold: 'bg-gold/10 text-gold',
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-xl ${colorMap[color]}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{sub ? `${label} · ${sub}` : label}</p>
        </div>
      </div>
    </div>
  )
}
