'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Download, Loader2, BarChart3, Users, DollarSign, Calendar, TrendingUp, FileText } from 'lucide-react'
import type {
  Enrollment,
  Payment,
  Course,
  Student,
  AttendanceRecord,
  ExamSubmission,
  Exam,
  EnrollmentTrend,
  RevenueReport,
  AttendanceStats,
  CourseAnalytics,
  FeeCollectionReport,
  StudentPerformance,
} from '../types'
import { ReportContent } from './views'
import { useReportFormatters } from './format'
import type { ReportType } from './types'

export function ReportsPanel({
  enrollments,
  payments,
  courses,
  students,
  attendance,
  examSubmissions,
  exams,
}: {
  enrollments: Enrollment[]
  payments: Payment[]
  courses: Course[]
  students: Student[]
  attendance: AttendanceRecord[]
  examSubmissions: ExamSubmission[]
  exams: Exam[]
}) {
  const t = useTranslations('admin.reports')
  const { formatMonth, calculatePercentage } = useReportFormatters()

  const REPORT_TYPES = [
    {
      id: 'enrollment-trends' as const,
      label: t('types.enrollmentTrends'),
      icon: Users,
    },
    { id: 'revenue' as const, label: t('types.revenue'), icon: DollarSign },
    { id: 'attendance' as const, label: t('types.attendance'), icon: Calendar },
    {
      id: 'course-analytics' as const,
      label: t('types.courseAnalytics'),
      icon: BarChart3,
    },
    {
      id: 'fee-collection' as const,
      label: t('types.feeCollection'),
      icon: FileText,
    },
    {
      id: 'student-performance' as const,
      label: t('types.studentPerformance'),
      icon: TrendingUp,
    },
  ]

  const [activeReport, setActiveReport] =
    useState<ReportType>('enrollment-trends')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [exporting, setExporting] = useState(false)

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      if (dateRange.start && new Date(e.enrolledAt) < new Date(dateRange.start))
        return false
      if (dateRange.end && new Date(e.enrolledAt) > new Date(dateRange.end))
        return false
      return true
    })
  }, [enrollments, dateRange])

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (dateRange.start && new Date(p.paidAt) < new Date(dateRange.start))
        return false
      if (dateRange.end && new Date(p.paidAt) > new Date(dateRange.end))
        return false
      return true
    })
  }, [payments, dateRange])

  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      if (dateRange.start && new Date(a.date) < new Date(dateRange.start))
        return false
      if (dateRange.end && new Date(a.date) > new Date(dateRange.end))
        return false
      return true
    })
  }, [attendance, dateRange])

  const enrollmentTrends: EnrollmentTrend[] = useMemo(() => {
    const monthly: Record<string, number> = {}
    filteredEnrollments.forEach((e) => {
      const month = formatMonth(e.enrolledAt)
      monthly[month] = (monthly[month] || 0) + 1
    })
    return Object.entries(monthly)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([period, count]) => ({ period, count }))
  }, [filteredEnrollments, formatMonth])

  const revenueReport: RevenueReport[] = useMemo(() => {
    const monthly: Record<string, { verified: number; pending: number }> = {}
    filteredPayments.forEach((p) => {
      const month = formatMonth(p.paidAt)
      if (!monthly[month]) monthly[month] = { verified: 0, pending: 0 }
      if (p.status === 'verified') monthly[month].verified += p.amount
      else monthly[month].pending += p.amount
    })
    return Object.entries(monthly)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([period, data]) => ({
        period,
        verified: data.verified,
        pending: data.pending,
        total: data.verified + data.pending,
      }))
  }, [filteredPayments, formatMonth])

  const attendanceStats: AttendanceStats[] = useMemo(() => {
    const studentMap: Record<string, AttendanceStats> = {}
    const activeStudents = students.filter((s) => s.role === 'student')

    activeStudents.forEach((s) => {
      studentMap[s.id] = {
        studentId: s.id,
        studentName: s.name,
        present: 0,
        late: 0,
        absent: 0,
        total: 0,
        percentage: 0,
      }
    })

    filteredAttendance.forEach((a) => {
      if (studentMap[a.userId]) {
        studentMap[a.userId][a.status]++
        studentMap[a.userId].total++
      }
    })

    Object.values(studentMap).forEach((stat) => {
      stat.percentage = calculatePercentage(stat.present + stat.late, stat.total)
    })

    return Object.values(studentMap).filter((s) => s.total > 0)
  }, [students, filteredAttendance, calculatePercentage])

  const courseAnalytics: CourseAnalytics[] = useMemo(() => {
    return courses.map((course) => {
      const courseEnrollments = enrollments.filter(
        (e) => e.courseId === course.id,
      )
      const activeEnrollments = courseEnrollments.filter(
        (e) => e.status === 'active' || e.status === 'approved',
      )
      const completedEnrollments = courseEnrollments.filter(
        (e) => e.status === 'completed',
      )

      const coursePayments = payments.filter((p) =>
        courseEnrollments.some((e) => e.id === p.enrollmentId),
      )
      const totalRevenue = coursePayments
        .filter((p) => p.status === 'verified')
        .reduce((sum, p) => sum + p.amount, 0)

      const courseAttendance = attendance.filter((a) =>
        activeEnrollments.some((e) => e.userId === a.userId),
      )
      const totalAttendance = courseAttendance.length
      const presentAttendance = courseAttendance.filter(
        (a) => a.status === 'present' || a.status === 'late',
      ).length
      const averageAttendance =
        totalAttendance > 0
          ? calculatePercentage(presentAttendance, totalAttendance)
          : 0

      return {
        courseId: course.id,
        courseTitle: course.title,
        totalEnrollments: courseEnrollments.length,
        activeStudents: activeEnrollments.length,
        completedStudents: completedEnrollments.length,
        totalRevenue,
        averageAttendance,
      }
    })
  }, [courses, enrollments, payments, attendance, calculatePercentage])

  const feeCollectionReport: FeeCollectionReport[] = useMemo(() => {
    return enrollments
      .filter(
        (e) =>
          e.status === 'active' ||
          e.status === 'approved' ||
          e.status === 'pending',
      )
      .map((e) => {
        const enrollmentPayments = payments.filter(
          (p) => p.enrollmentId === e.id && p.status === 'verified',
        )
        const paidAmount = enrollmentPayments.reduce((sum, p) => sum + p.amount, 0)
        const lastPayment = enrollmentPayments.sort(
          (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
        )[0]

        return {
          studentId: e.userId,
          studentName: e.userName || '—',
          studentPhone: e.userPhone || '—',
          courseTitle: e.courseTitle || '—',
          totalFee: e.totalFee,
          paidAmount,
          dueAmount: e.dueAmount,
          status:
            e.dueAmount <= 0
              ? 'paid'
              : e.dueAmount < e.totalFee
                ? 'partial'
                : 'unpaid',
          lastPaymentDate: lastPayment?.paidAt || null,
        }
      })
  }, [enrollments, payments])

  const studentPerformance: StudentPerformance[] = useMemo(() => {
    const perfMap: Record<string, StudentPerformance> = {}

    examSubmissions.forEach((s) => {
      if (!perfMap[s.userId]) {
        perfMap[s.userId] = {
          studentId: s.userId,
          studentName: s.userName || s.userStudentId || '—',
          examsAttempted: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 100,
        }
      }
      const p = perfMap[s.userId]
      const pct = (s.score / s.total) * 100
      p.examsAttempted++
      p.averageScore =
        (p.averageScore * (p.examsAttempted - 1) + pct) / p.examsAttempted
      p.highestScore = Math.max(p.highestScore, pct)
      p.lowestScore = Math.min(p.lowestScore, pct)
    })

    return Object.values(perfMap).map((p) => ({
      ...p,
      averageScore: Math.round(p.averageScore),
      highestScore: Math.round(p.highestScore),
      lowestScore: p.lowestScore === 100 ? 0 : Math.round(p.lowestScore),
    }))
  }, [examSubmissions])

  async function handleExport() {
    setExporting(true)
    try {
      let csv: string[] = []
      let filename = ''

      switch (activeReport) {
        case 'enrollment-trends':
          csv = [`${t('csvHeaders.enrollmentTrends')}\n`]
          enrollmentTrends.forEach((e) => csv.push(`${e.period},${e.count}`))
          filename = 'enrollment-trends.csv'
          break
        case 'revenue':
          csv = [`${t('csvHeaders.revenue')}\n`]
          revenueReport.forEach((r) =>
            csv.push(`${r.period},${r.verified},${r.pending},${r.total}`),
          )
          filename = 'revenue-report.csv'
          break
        case 'attendance':
          csv = [`${t('csvHeaders.attendance')}\n`]
          attendanceStats.forEach((s) =>
            csv.push(
              `${s.studentName},${s.present},${s.late},${s.absent},${s.total},${s.percentage}%`,
            ),
          )
          filename = 'attendance-report.csv'
          break
        case 'course-analytics':
          csv = [`${t('csvHeaders.courseAnalytics')}\n`]
          courseAnalytics.forEach((c) =>
            csv.push(
              `${c.courseTitle},${c.totalEnrollments},${c.activeStudents},${c.completedStudents},${c.totalRevenue},${c.averageAttendance}%`,
            ),
          )
          filename = 'course-analytics.csv'
          break
        case 'fee-collection':
          csv = [`${t('csvHeaders.feeCollection')}\n`]
          feeCollectionReport.forEach((f) =>
            csv.push(
              `${f.studentName},${f.studentPhone},${f.courseTitle},${f.totalFee},${f.paidAmount},${f.dueAmount},${f.status},${f.lastPaymentDate || '—'}`,
            ),
          )
          filename = 'fee-collection-report.csv'
          break
        case 'student-performance':
          csv = [`${t('csvHeaders.studentPerformance')}\n`]
          studentPerformance.forEach((s) =>
            csv.push(
              `${s.studentName},${s.examsAttempted},${s.averageScore}%,${s.highestScore}%,${s.lowestScore}%`,
            ),
          )
          filename = 'student-performance.csv'
          break
      }

      const blob = new Blob([csv.join('\n')], {
        type: 'text/csv;charset=utf-8;',
      })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  async function handleExportPdf() {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (dateRange.start) params.set('startDate', dateRange.start)
      if (dateRange.end) params.set('endDate', dateRange.end)
      const res = await fetch(
        `/api/reports/export/${activeReport}?${params.toString()}`,
      )
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${activeReport}.pdf`
      link.click()
    } catch (error) {
      console.error('PDF export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveReport(type.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeReport === type.id
                  ? 'bg-brand text-brand-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <type.icon className="size-4" />
              {type.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <span className="text-muted-foreground">{t('dateRangeFrom')}</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary/80 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileText className="size-4" />
            )}
            {t('exportPdf')}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {t('exportCsv')}
          </button>
        </div>
      </div>

      <ReportContent
        activeReport={activeReport}
        filteredEnrollments={filteredEnrollments}
        filteredPayments={filteredPayments}
        filteredAttendance={filteredAttendance}
        enrollmentTrends={enrollmentTrends}
        revenueReport={revenueReport}
        attendanceStats={attendanceStats}
        courseAnalytics={courseAnalytics}
        feeCollectionReport={feeCollectionReport}
        studentPerformance={studentPerformance}
      />
    </div>
  )
}