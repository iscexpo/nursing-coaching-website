'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Users,
  BookOpen,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  CreditCard,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { Enrollment, Payment, Course } from './types'

function SaasStat({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  trend,
}: {
  label: string
  value: string | number
  hint?: string
  icon: React.ElementType
  tone: 'brand' | 'green' | 'gold' | 'destructive'
  trend?: { value: string; up: boolean }
}) {
  const tones: Record<string, { bg: string; fg: string; border: string }> = {
    brand: { bg: 'bg-brand/10', fg: 'text-brand', border: 'border-brand/20' },
    green: { bg: 'bg-green/10', fg: 'text-green', border: 'border-green/20' },
    gold: { bg: 'bg-gold/10', fg: 'text-gold', border: 'border-gold/20' },
    destructive: { bg: 'bg-destructive/10', fg: 'text-destructive', border: 'border-destructive/20' },
  }
  const c = tones[tone]
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-muted-foreground/20">
      <div className="absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-muted/30 blur-2xl group-hover:bg-muted/50" />
      <div className="flex items-start justify-between">
        <div className={`flex size-9 items-center justify-center rounded-lg border ${c.bg} ${c.fg} ${c.border}`}>
          <Icon className="size-4" />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trend.up ? 'bg-green/10 text-green' : 'bg-destructive/10 text-destructive'}`}
          >
            {trend.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="text-sm font-medium text-foreground/80">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}

function MiniTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

export function OverviewPanel({
  courses,
  enrollments,
  payments,
}: {
  courses: Course[]
  enrollments: Enrollment[]
  payments: Payment[]
}) {
  const t = useTranslations('admin.overview')
  const tc = useTranslations('common')

  const activeCourses = courses.filter((c) => c.isActive).length
  const totalStudents = enrollments.filter((e) => e.status === 'active').length
  const pendingEnrollments = enrollments.filter((e) => e.status === 'pending').length
  const pendingPayments = payments.filter((p) => p.status === 'pending').length
  const totalRevenue = payments.filter((p) => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0)
  const verifiedCount = payments.filter((p) => p.status === 'verified').length
  const thisMonthEnrollments = useMemo(() => {
    const now = new Date()
    const m = now.getMonth()
    const y = now.getFullYear()
    return enrollments.filter((e) => {
      const d = new Date(e.enrolledAt)
      return d.getMonth() === m && d.getFullYear() === y
    }).length
  }, [enrollments])

  const revenueSeries = useMemo(() => {
    const map: Record<string, number> = {}
    const months: string[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const k = d.toLocaleDateString('en-US', { month: 'short' })
      months.push(k)
      map[k] = 0
    }
    payments
      .filter((p) => p.status === 'verified')
      .forEach((p) => {
        const d = new Date(p.paidAt)
        const k = d.toLocaleDateString('en-US', { month: 'short' })
        if (k in map) map[k] += p.amount
      })
    return months.map((m) => ({ month: m, revenue: map[m] }))
  }, [payments])

  const enrollmentSeries = useMemo(() => {
    const map: Record<string, number> = {}
    const months: string[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const k = d.toLocaleDateString('en-US', { month: 'short' })
      months.push(k)
      map[k] = 0
    }
    enrollments.forEach((e) => {
      const d = new Date(e.enrolledAt)
      const k = d.toLocaleDateString('en-US', { month: 'short' })
      if (k in map) map[k] += 1
    })
    return months.map((m) => ({ month: m, count: map[m] }))
  }, [enrollments])

  const completionRate = useMemo(() => {
    if (enrollments.length === 0) return 0
    const done = enrollments.filter((e) => e.status === 'completed').length
    return Math.round((done / enrollments.length) * 100)
  }, [enrollments])

  return (
    <div className="space-y-6">
      {/* SaaS header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
            <Sparkles className="size-5 text-brand" />
            {t('title') ?? 'Dashboard'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('subtitle') ?? 'Monitor enrollments, revenue and operations — live SaaS overview.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green/20 bg-green/10 px-2.5 py-1 font-medium text-green">
            <span className="size-2 animate-pulse rounded-full bg-green" />
            Live
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
            <Activity className="size-3" />
            {completionRate}% completion
          </span>
        </div>
      </div>

      {/* KPI grid SaaS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SaasStat
          label={t('activeStudents')}
          value={totalStudents}
          hint={`${enrollments.length} total · ${thisMonthEnrollments} this month`}
          icon={Users}
          tone="brand"
          trend={{ value: `${thisMonthEnrollments} new`, up: true }}
        />
        <SaasStat
          label={t('activeCourses')}
          value={activeCourses}
          hint={`${t('totalCoursesCount')} ${courses.length} · ${courses.filter((c) => !c.isActive).length} inactive`}
          icon={BookOpen}
          tone="green"
        />
        <SaasStat
          label={t('pendingEnrollments')}
          value={pendingEnrollments}
          hint={t('enrollmentLabel')}
          icon={Clock}
          tone="gold"
          trend={pendingEnrollments ? { value: 'needs review', up: false } : undefined}
        />
        <SaasStat
          label={t('pendingPayments')}
          value={pendingPayments}
          hint={t('paymentLabel')}
          icon={AlertTriangle}
          tone="destructive"
          trend={pendingPayments ? { value: `${pendingPayments} pending`, up: false } : undefined}
        />
      </div>

      {/* Revenue + enrollment charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Wallet className="size-4 text-green" />
                {t('totalRevenueLabel')} — ৳{totalRevenue.toLocaleString()}
              </h3>
              <p className="text-xs text-muted-foreground">
                {verifiedCount} {t('verifiedPayments')} · 6-month trend
              </p>
            </div>
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              <TrendingUp className="mr-1 inline size-3" />
              Verified only
            </span>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={MiniTooltip as never} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--green)" strokeWidth={2} fill="url(#rev)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <GraduationCap className="size-4 text-brand" />
              Enrollments
            </h3>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                <Tooltip content={MiniTooltip as never} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />
                <Bar dataKey="count" name="Enrollments" radius={[6, 6, 0, 0]} fill="var(--brand)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-semibold text-foreground">{completionRate}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-brand transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>

      {/* SaaS split */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-semibold text-foreground">{t('recentEnrollments')}</h3>
            <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand">{enrollments.length} total</span>
          </div>
          <div className="divide-y divide-border/60">
            {enrollments.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                  {(e.userName || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{e.userName || t('student')}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.courseTitle} · ৳{(e.totalFee ?? 0).toLocaleString()}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                    e.status === 'active'
                      ? 'border-green/20 bg-green/10 text-green'
                      : e.status === 'pending'
                        ? 'border-gold/20 bg-gold/10 text-gold'
                        : e.status === 'approved'
                          ? 'border-brand/20 bg-brand/10 text-brand'
                          : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {e.status === 'active' ? (
                    <CheckCircle2 className="size-3" />
                  ) : e.status === 'pending' ? (
                    <Clock className="size-3" />
                  ) : null}
                  {e.status === 'active' ? tc('active') : e.status === 'pending' ? tc('pending') : e.status === 'approved' ? tc('approved') : e.status}
                </span>
              </div>
            ))}
            {enrollments.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t('noEnrollments')}</p>}
          </div>
          {enrollments.length > 5 && (
            <div className="border-t border-border p-3">
              <button className="flex w-full items-center justify-center gap-1 rounded-lg bg-muted py-2 text-sm font-medium text-foreground hover:bg-muted/80">
                View all enrollments <ArrowUpRight className="size-4" />
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <CreditCard className="size-4" />
              {t('recentPayments')}
            </h3>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${pendingPayments ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-green/10 text-green border border-green/20'}`}>
              {pendingPayments ? `${pendingPayments} pending` : 'All clear'}
            </span>
          </div>
          <div className="divide-y divide-border/60">
            {payments
              .filter((p) => p.status === 'pending')
              .slice(0, 5)
              .map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <Wallet className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">৳{p.amount.toLocaleString()}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.method === 'bkash' ? 'bKash' : p.method === 'nagad' ? 'Nagad' : p.method}
                      {p.transactionId && ` · ${p.transactionId}`}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-gold/20 bg-gold/10 px-2 py-1 text-xs font-semibold text-gold">
                    {tc('pending')}
                  </span>
                </div>
              ))}
            {payments.filter((p) => p.status === 'pending').length === 0 && (
              <div className="flex flex-col items-center py-8">
                <div className="flex size-10 items-center justify-center rounded-full bg-green/10">
                  <CheckCircle2 className="size-6 text-green" />
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{t('noPendingPayments')}</p>
                <p className="text-xs text-muted-foreground">All payments verified</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions SaaS */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card px-3 py-3">
            <p className="text-sm font-medium text-foreground">Verify pending payments</p>
            <p className="text-xs text-muted-foreground">{pendingPayments} awaiting review</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-3">
            <p className="text-sm font-medium text-foreground">Review enrollments</p>
            <p className="text-xs text-muted-foreground">{pendingEnrollments} new requests</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-3">
            <p className="text-sm font-medium text-foreground">Active courses</p>
            <p className="text-xs text-muted-foreground">{activeCourses} running</p>
          </div>
        </div>
      </div>
    </div>
  )
}
