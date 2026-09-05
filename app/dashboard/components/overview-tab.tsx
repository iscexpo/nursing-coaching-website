'use client'

import { useTranslations } from 'next-intl'
import { BarChart3, Receipt, GraduationCap, CalendarCheck } from 'lucide-react'
import {
  AttendanceStatusBadge,
  EnrollmentStatusBadge,
} from '@/components/ui/status-badge'
import { StatCard } from '@/components/ui/stat-card'
import type {
  Enrollment,
  ExamSubmission,
  AttendanceRecord,
  LifecycleEvent,
} from './types'

export function OverviewTab({
  examSubmissions,
  attendance,
  enrollments,
  lifecycleEvents,
  totalDue,
  totalPaid,
}: {
  examSubmissions: ExamSubmission[]
  attendance: AttendanceRecord[]
  enrollments: Enrollment[]
  lifecycleEvents: LifecycleEvent[]
  totalDue: number
  totalPaid: number
}) {
  const t = useTranslations('dashboard.overview')
  const avgScore =
    examSubmissions.length > 0
      ? Math.round(
          examSubmissions.reduce(
            (s, r) => s + (r.total > 0 ? (r.score / r.total) * 100 : 0),
            0,
          ) / examSubmissions.length,
        )
      : 0
  const activeEnrollments = enrollments.filter(
    (e) => e.status === 'active' || e.status === 'approved',
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('activeCourses')}
          value={`${activeEnrollments.length}${t('courseCount')}`}
          icon={GraduationCap}
          color="brand"
        />
        <StatCard
          label={t('averageScore')}
          value={`${avgScore}%`}
          icon={BarChart3}
          color="green"
        />
        <StatCard
          label={t('totalPayment')}
          value={`৳${totalPaid.toLocaleString()}`}
          icon={Receipt}
          color="green"
        />
        <StatCard
          label={t('lifecycleEvents')}
          value={`${lifecycleEvents.length}`}
          icon={CalendarCheck}
          color="gold"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            {t('recentResults')}
          </h3>
          <div className="mt-3 space-y-2">
            {examSubmissions.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">
                  {r.examTitle || t('examFallback')}
                </span>
                <span className="font-semibold text-brand">
                  {r.score}/{r.total}
                </span>
              </div>
            ))}
            {examSubmissions.length === 0 && (
              <p className="text-xs text-muted-foreground">{t('noResults')}</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            {t('recentAttendance')}
          </h3>
          <div className="mt-3 space-y-2">
            {attendance
              .slice(-5)
              .reverse()
              .map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">
                    {new Date(a.date).toLocaleDateString('bn-BD')}
                  </span>
                  <AttendanceStatusBadge status={a.status} />
                </div>
              ))}
            {attendance.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {t('noAttendance')}
              </p>
            )}
          </div>
        </div>
      </div>
      {enrollments.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            {t('myEnrollments')}
          </h3>
          <div className="mt-3 space-y-3">
            {enrollments.slice(0, 3).map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {e.courseTitle || t('courseFallback')}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    ({e.courseDuration || ''})
                  </span>
                </div>
                <EnrollmentStatusBadge status={e.status} />
              </div>
            ))}
          </div>
        </div>
      )}
      {lifecycleEvents.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">
            {t('studentLifecycle')}
          </h3>
          <div className="mt-3 space-y-3">
            {lifecycleEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1 rounded-lg border border-border bg-muted p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">
                    {event.eventType
                      .replace('enrollment.', '')
                      .replaceAll('.', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {event.enrollmentId
                    ? `এনরোলমেন্ট: ${event.enrollmentId.slice(0, 8)}`
                    : t('noEnrollmentId')}
                </p>
                {event.details &&
                  typeof event.details === 'object' &&
                  Object.keys(event.details).length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {Object.entries(event.details).map(([key, val]) => (
                        <span
                          key={key}
                          className="inline-flex rounded bg-muted-foreground/10 px-1.5 py-0.5"
                        >
                          {key}: {String(val)}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
