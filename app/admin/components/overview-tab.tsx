'use client'

import { useTranslations } from 'next-intl'
import {
  Users,
  BookOpen,
  GraduationCap,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import type { Enrollment, Payment, Course } from './types'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
}) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand/10 text-brand',
    green: 'bg-green/10 text-green',
    gold: 'bg-gold/15 text-gold',
    red: 'bg-destructive/10 text-destructive',
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={`flex size-11 items-center justify-center rounded-xl ${colorMap[color]}`}
        >
          <Icon className="size-5" />
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
  const pendingEnrollments = enrollments.filter(
    (e) => e.status === 'pending',
  ).length
  const pendingPayments = payments.filter((p) => p.status === 'pending').length
  const totalRevenue = payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('activeStudents')}
          value={totalStudents}
          sub={t('enrolled')}
          icon={Users}
          color="brand"
        />
        <StatCard
          label={t('activeCourses')}
          value={activeCourses}
          sub={`${t('totalCoursesCount')} ${courses.length}টি`}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          label={t('pendingEnrollments')}
          value={pendingEnrollments}
          sub={t('enrollmentLabel')}
          icon={Clock}
          color="gold"
        />
        <StatCard
          label={t('pendingPayments')}
          value={pendingPayments}
          sub={t('paymentLabel')}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Revenue summary */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-green/10">
            <TrendingUp className="size-5 text-green" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              ৳{totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('totalRevenueLabel')} ({t('verifiedPayments')})
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Enrollments */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            {t('recentEnrollments')}
          </h3>
          <div className="mt-4 space-y-3">
            {enrollments.slice(0, 5).map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-xl bg-secondary/30 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {e.userName || t('student')}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.courseTitle}
                  </p>
                </div>
                <span
                  className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    e.status === 'active'
                      ? 'bg-green/10 text-green'
                      : e.status === 'pending'
                        ? 'bg-gold/15 text-gold'
                        : e.status === 'approved'
                          ? 'bg-brand/10 text-brand'
                          : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {e.status === 'active'
                    ? tc('active')
                    : e.status === 'pending'
                      ? tc('pending')
                      : e.status === 'approved'
                        ? tc('approved')
                        : e.status}
                </span>
              </div>
            ))}
            {enrollments.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t('noEnrollments')}
              </p>
            )}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            {t('recentPayments')}
          </h3>
          <div className="mt-4 space-y-3">
            {payments
              .filter((p) => p.status === 'pending')
              .slice(0, 5)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/30 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      ৳{p.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.method === 'bkash'
                        ? 'bKash'
                        : p.method === 'nagad'
                          ? 'Nagad'
                          : p.method}
                      {p.transactionId && ` — ${p.transactionId}`}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                    {tc('pending')}
                  </span>
                </div>
              ))}
            {payments.filter((p) => p.status === 'pending').length === 0 && (
              <div className="flex flex-col items-center py-6">
                <CheckCircle2 className="size-8 text-green/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('noPendingPayments')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
