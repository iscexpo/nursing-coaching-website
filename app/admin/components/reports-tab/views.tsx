'use client'

import dynamic from 'next/dynamic'
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { StatCard, ChartCard, DataTable } from './charts'

const BarChart = dynamic(() => import('./charts').then((m) => m.BarChart), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse rounded-2xl bg-secondary/50" />
  ),
})
const RevenueChart = dynamic(
  () => import('./charts').then((m) => m.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl bg-secondary/50" />
    ),
  },
)
const AttendanceChart = dynamic(
  () => import('./charts').then((m) => m.AttendanceChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 animate-pulse rounded-2xl bg-secondary/50" />
    ),
  },
)
const CourseAnalyticsChart = dynamic(
  () => import('./charts').then((m) => m.CourseAnalyticsChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl bg-secondary/50" />
    ),
  },
)
const PerformanceChart = dynamic(
  () => import('./charts').then((m) => m.PerformanceChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl bg-secondary/50" />
    ),
  },
)
import { useReportFormatters } from './format'
import type { ReportType } from './types'
import type {
  Enrollment,
  Payment,
  AttendanceRecord,
  EnrollmentTrend,
  RevenueReport,
  AttendanceStats,
  CourseAnalytics,
  FeeCollectionReport,
  StudentPerformance,
} from '../types'

export function ReportContent({
  activeReport,
  filteredEnrollments,
  filteredPayments,
  filteredAttendance,
  enrollmentTrends,
  revenueReport,
  attendanceStats,
  courseAnalytics,
  feeCollectionReport,
  studentPerformance,
}: {
  activeReport: ReportType
  filteredEnrollments: Enrollment[]
  filteredPayments: Payment[]
  filteredAttendance: AttendanceRecord[]
  enrollmentTrends: EnrollmentTrend[]
  revenueReport: RevenueReport[]
  attendanceStats: AttendanceStats[]
  courseAnalytics: CourseAnalytics[]
  feeCollectionReport: FeeCollectionReport[]
  studentPerformance: StudentPerformance[]
}) {
  const { t, formatMonth, formatCurrency } = useReportFormatters()

  switch (activeReport) {
    case 'enrollment-trends':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t('stats.totalEnrollments')}
              value={filteredEnrollments.length}
              icon={Users}
              color="brand"
            />
            <StatCard
              label={t('stats.thisMonth')}
              value={
                filteredEnrollments.filter(
                  (e) =>
                    new Date(e.enrolledAt).getMonth() === new Date().getMonth(),
                ).length
              }
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              label={t('stats.pending')}
              value={
                filteredEnrollments.filter((e) => e.status === 'pending').length
              }
              icon={Calendar}
              color="gold"
            />
          </div>
          <ChartCard title={t('charts.monthlyEnrollmentTrend')}>
            <BarChart data={enrollmentTrends} xKey="period" yKey="count" />
          </ChartCard>
          <DataTable
            headers={[
              t('dataTableHeaders.month'),
              t('dataTableHeaders.enrollmentCount'),
            ]}
            rows={enrollmentTrends.map((en) => [
              en.period,
              en.count.toString(),
            ])}
          />
        </div>
      )

    case 'revenue':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t('stats.totalRevenue')}
              value={formatCurrency(
                revenueReport.reduce((s, r) => s + r.verified, 0),
              )}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              label={t('stats.pending')}
              value={formatCurrency(
                revenueReport.reduce((s, r) => s + r.pending, 0),
              )}
              icon={Clock}
              color="gold"
            />
            <StatCard
              label={t('stats.totalPayments')}
              value={filteredPayments.length}
              icon={FileText}
              color="brand"
            />
          </div>
          <ChartCard title={t('charts.monthlyRevenue')}>
            <RevenueChart data={revenueReport} />
          </ChartCard>
          <DataTable
            headers={[
              t('dataTableHeaders.month'),
              t('dataTableHeaders.verified'),
              t('dataTableHeaders.pending'),
              t('dataTableHeaders.total'),
            ]}
            rows={revenueReport.map((r) => [
              r.period,
              formatCurrency(r.verified),
              formatCurrency(r.pending),
              formatCurrency(r.total),
            ])}
          />
        </div>
      )

    case 'attendance':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t('stats.averageAttendance')}
              value={
                attendanceStats.length > 0
                  ? `${Math.round(
                      attendanceStats.reduce((s, a) => s + a.percentage, 0) /
                        attendanceStats.length,
                    )}%`
                  : '0%'
              }
              icon={Calendar}
              color="green"
            />
            <StatCard
              label={t('stats.totalRecords')}
              value={filteredAttendance.length}
              icon={FileText}
              color="brand"
            />
            <StatCard
              label={t('stats.studentCount')}
              value={attendanceStats.length}
              icon={Users}
              color="blue"
            />
          </div>
          <ChartCard title={t('charts.attendanceOverview')}>
            <AttendanceChart data={attendanceStats} />
          </ChartCard>
          <DataTable
            headers={[
              t('dataTableHeaders.student'),
              t('dataTableHeaders.present'),
              t('dataTableHeaders.late'),
              t('dataTableHeaders.absent'),
              t('dataTableHeaders.total'),
              t('dataTableHeaders.percentage'),
            ]}
            rows={attendanceStats.map((s) => [
              s.studentName,
              s.present.toString(),
              s.late.toString(),
              s.absent.toString(),
              s.total.toString(),
              `${s.percentage}%`,
            ])}
          />
        </div>
      )

    case 'course-analytics':
      return (
        <div className="space-y-4">
          <ChartCard title={t('charts.courseAnalytics')}>
            <CourseAnalyticsChart data={courseAnalytics} />
          </ChartCard>
          <DataTable
            headers={[
              t('dataTableHeaders.course'),
              t('dataTableHeaders.total'),
              t('dataTableHeaders.active'),
              t('dataTableHeaders.completed'),
              t('dataTableHeaders.revenue'),
              t('dataTableHeaders.averageAttendance'),
            ]}
            rows={courseAnalytics.map((c) => [
              c.courseTitle,
              c.totalEnrollments.toString(),
              c.activeStudents.toString(),
              c.completedStudents.toString(),
              formatCurrency(c.totalRevenue),
              `${c.averageAttendance}%`,
            ])}
          />
        </div>
      )

    case 'fee-collection':
      const totalDue = feeCollectionReport.reduce((s, f) => s + f.dueAmount, 0)
      const totalCollected = feeCollectionReport.reduce(
        (s, f) => s + f.paidAmount,
        0,
      )
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t('stats.totalDue')}
              value={formatCurrency(totalDue)}
              icon={DollarSign}
              color="red"
            />
            <StatCard
              label={t('stats.totalCollected')}
              value={formatCurrency(totalCollected)}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              label={t('stats.fullyPaid')}
              value={
                feeCollectionReport.filter((f) => f.status === 'paid').length
              }
              icon={CheckCircle}
              color="blue"
            />
          </div>
          <DataTable
            headers={[
              t('dataTableHeaders.student'),
              t('dataTableHeaders.phone'),
              t('dataTableHeaders.course'),
              t('dataTableHeaders.totalFee'),
              t('dataTableHeaders.payment'),
              t('dataTableHeaders.due'),
              t('dataTableHeaders.status'),
              t('dataTableHeaders.lastPayment'),
            ]}
            rows={feeCollectionReport.map((f) => [
              f.studentName,
              f.studentPhone,
              f.courseTitle,
              formatCurrency(f.totalFee),
              formatCurrency(f.paidAmount),
              formatCurrency(f.dueAmount),
              f.status === 'paid'
                ? t('feeStatus.paid')
                : f.status === 'partial'
                  ? t('feeStatus.partial')
                  : t('feeStatus.unpaid'),
              f.lastPaymentDate ? formatMonth(f.lastPaymentDate) : '—',
            ])}
          />
        </div>
      )

    case 'student-performance':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t('stats.totalStudents')}
              value={studentPerformance.length}
              icon={Users}
              color="brand"
            />
            <StatCard
              label={t('stats.averageScore')}
              value={
                studentPerformance.length > 0
                  ? `${Math.round(
                      studentPerformance.reduce(
                        (s, p) => s + p.averageScore,
                        0,
                      ) / studentPerformance.length,
                    )}%`
                  : '0%'
              }
              icon={BarChart3}
              color="green"
            />
            <StatCard
              label={t('stats.examsTaken')}
              value={studentPerformance.reduce(
                (s, p) => s + p.examsAttempted,
                0,
              )}
              icon={FileText}
              color="blue"
            />
          </div>
          <ChartCard title={t('charts.studentPerformance')}>
            <PerformanceChart data={studentPerformance} />
          </ChartCard>
          <DataTable
            headers={[
              t('dataTableHeaders.student'),
              t('dataTableHeaders.examsTaken'),
              t('dataTableHeaders.averageScore'),
              t('dataTableHeaders.highest'),
              t('dataTableHeaders.lowest'),
            ]}
            rows={studentPerformance.map((s) => [
              s.studentName,
              s.examsAttempted.toString(),
              `${s.averageScore}%`,
              `${s.highestScore}%`,
              `${s.lowestScore}%`,
            ])}
          />
        </div>
      )
  }
}
