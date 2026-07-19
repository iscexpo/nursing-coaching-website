'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Download,
  Loader2,
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  Filter,
  Clock,
  CheckCircle,
} from 'lucide-react'
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
} from './types'

const REPORT_TYPES = [
  { id: 'enrollment-trends', label: 'এনরোলমেন্ট ট্রেন্ড', icon: Users },
  { id: 'revenue', label: 'রেভেনিউ রিপোর্ট', icon: DollarSign },
  { id: 'attendance', label: 'উপস্থিতি পরিসংখ্যান', icon: Calendar },
  { id: 'course-analytics', label: 'কোর্স অ্যানালিটিক্স', icon: BarChart3 },
  { id: 'fee-collection', label: 'ফি সংগ্রহ রিপোর্ট', icon: FileText },
  { id: 'student-performance', label: 'শিক্ষার্থী পারফরম্যান্স', icon: TrendingUp },
] as const

type ReportType = (typeof REPORT_TYPES)[number]['id']

const MONTHS_BN = [
  'জানু',
  'ফেব্রু',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টে',
  'অক্টো',
  'নভে',
  'ডিসে',
]

function formatMonth(dateStr: string) {
  const d = new Date(dateStr)
  return `${MONTHS_BN[d.getMonth()]} ${d.getFullYear()}`
}

function formatCurrency(amount: number) {
  return `৳${amount.toLocaleString('bn-BD')}`
}

function calculatePercentage(value: number, total: number) {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

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
  const [activeReport, setActiveReport] = useState<ReportType>('enrollment-trends')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [loading, setLoading] = useState(false)
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
      if (dateRange.end && new Date(a.date) > new Date(dateRange.end)) return false
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
  }, [filteredEnrollments])

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
  }, [filteredPayments])

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
  }, [students, filteredAttendance])

  const courseAnalytics: CourseAnalytics[] = useMemo(() => {
    return courses.map((course) => {
      const courseEnrollments = enrollments.filter((e) => e.courseId === course.id)
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
  }, [courses, enrollments, payments, attendance])

  const feeCollectionReport: FeeCollectionReport[] = useMemo(() => {
    return enrollments
      .filter((e) => e.status === 'active' || e.status === 'approved')
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
          status: e.dueAmount <= 0 ? 'paid' : e.dueAmount < e.totalFee ? 'partial' : 'unpaid',
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
      p.averageScore = (p.averageScore * (p.examsAttempted - 1) + pct) / p.examsAttempted
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
          csv = ['মাস,এনরোলমেন্ট সংখ্যা\n']
          enrollmentTrends.forEach((t) => csv.push(`${t.period},${t.count}`))
          filename = 'enrollment-trends.csv'
          break
        case 'revenue':
          csv = ['মাস,যাচাইকৃত,অপেক্ষমান,মোট\n']
          revenueReport.forEach((r) =>
            csv.push(
              `${r.period},${r.verified},${r.pending},${r.total}`,
            ),
          )
          filename = 'revenue-report.csv'
          break
        case 'attendance':
          csv = ['শিক্ষার্থী,উপস্থিত,বিলম্বিত,অনুপস্থিত,মোট,শতাংশ\n']
          attendanceStats.forEach((s) =>
            csv.push(
              `${s.studentName},${s.present},${s.late},${s.absent},${s.total},${s.percentage}%`,
            ),
          )
          filename = 'attendance-report.csv'
          break
        case 'course-analytics':
          csv = [
            'কোর্স,মোট এনরোলমেন্ট,সক্রিয়,সম্পন্ন,রেভেনিউ,গড় উপস্থিতি\n',
          ]
          courseAnalytics.forEach((c) =>
            csv.push(
              `${c.courseTitle},${c.totalEnrollments},${c.activeStudents},${c.completedStudents},${c.totalRevenue},${c.averageAttendance}%`,
            ),
          )
          filename = 'course-analytics.csv'
          break
        case 'fee-collection':
          csv = [
            'শিক্ষার্থী,ফোন,কোর্স,মোট ফি,পরিশোধ,বকেয়া,অবস্থা,শেষ পেমেন্ট\n',
          ]
          feeCollectionReport.forEach((f) =>
            csv.push(
              `${f.studentName},${f.studentPhone},${f.courseTitle},${f.totalFee},${f.paidAmount},${f.dueAmount},${f.status},${f.lastPaymentDate || '—'}`,
            ),
          )
          filename = 'fee-collection-report.csv'
          break
        case 'student-performance':
          csv = [
            'শিক্ষার্থী,পরীক্ষা দেওয়া,গড় স্কোর,সর্বোচ্চ,সর্বনিম্ন\n',
          ]
          studentPerformance.forEach((s) =>
            csv.push(
              `${s.studentName},${s.examsAttempted},${s.averageScore}%,${s.highestScore}%,${s.lowestScore}%`,
            ),
          )
          filename = 'student-performance.csv'
          break
      }

      const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
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

  const renderReportContent = () => {
    switch (activeReport) {
      case 'enrollment-trends':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="মোট এনরোলমেন্ট"
                value={filteredEnrollments.length}
                icon={Users}
                color="brand"
              />
              <StatCard
                label="এই মাসে"
                value={
                  filteredEnrollments.filter(
                    (e) => new Date(e.enrolledAt).getMonth() === new Date().getMonth(),
                  ).length
                }
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                label="ব� 기다"
                value={
                  filteredEnrollments.filter((e) => e.status === 'pending').length
                }
                icon={Calendar}
                color="gold"
              />
            </div>
            <ChartCard title="মাসিক এনরোলমেন্ট ট্রেন্ড">
              <BarChart data={enrollmentTrends} xKey="period" yKey="count" />
            </ChartCard>
            <DataTable
              headers={['মাস', 'এনরোলমেন্ট']}
              rows={enrollmentTrends.map((t) => [t.period, t.count.toString()])}
            />
          </div>
        )

      case 'revenue':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="মোট রেভেনিউ"
                value={formatCurrency(
                  revenueReport.reduce((s, r) => s + r.verified, 0),
                )}
                icon={DollarSign}
                color="green"
              />
              <StatCard
                label="অপেক্ষমান"
                value={formatCurrency(
                  revenueReport.reduce((s, r) => s + r.pending, 0),
                )}
                icon={Clock}
                color="gold"
              />
              <StatCard
                label="মোট পেমেন্ট"
                value={filteredPayments.length}
                icon={FileText}
                color="brand"
              />
            </div>
            <ChartCard title="মাসিক রেভেনিউ">
              <RevenueChart data={revenueReport} />
            </ChartCard>
            <DataTable
              headers={['মাস', 'যাচাইকৃত', 'অপেক্ষমান', 'মোট']}
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
                label="গড় উপস্থিতি"
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
                label="মোট রেকর্ড"
                value={filteredAttendance.length}
                icon={FileText}
                color="brand"
              />
              <StatCard
                label="শিক্ষার্থী নম্বর"
                value={attendanceStats.length}
                icon={Users}
                color="blue"
              />
            </div>
            <ChartCard title="উপস্থিতি ওভারভিউ">
              <AttendanceChart data={attendanceStats} />
            </ChartCard>
            <DataTable
              headers={['শিক্ষার্থী', 'উপস্থিত', 'বিলম্বিত', 'অনুপস্থিত', 'মোট', 'শতাংশ']}
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
            <ChartCard title="কোর্স-ওয়ার অ্যানালিটিক্স">
              <CourseAnalyticsChart data={courseAnalytics} />
            </ChartCard>
            <DataTable
              headers={['কোর্স', 'মোট', 'সক্রিয়', 'সম্পন্ন', 'রেভেনিউ', 'গড় উপস্থিতি']}
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
        const totalCollected = feeCollectionReport.reduce((s, f) => s + f.paidAmount, 0)
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="মোট বকেয়া"
                value={formatCurrency(totalDue)}
                icon={DollarSign}
                color="red"
              />
              <StatCard
                label="মোট সংগ্রহ"
                value={formatCurrency(totalCollected)}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                label="সম্পূর্ণ প্রদান"
                value={
                  feeCollectionReport.filter((f) => f.status === 'paid').length
                }
                icon={CheckCircle}
                color="blue"
              />
            </div>
            <DataTable
              headers={['শিক্ষার্থী', 'ফোন', 'কোর্স', 'মোট ফি', 'পরিশোধ', 'বকেয়া', 'অবস্থা', 'শেষ পেমেন্ট']}
              rows={feeCollectionReport.map((f) => [
                f.studentName,
                f.studentPhone,
                f.courseTitle,
                formatCurrency(f.totalFee),
                formatCurrency(f.paidAmount),
                formatCurrency(f.dueAmount),
                f.status === 'paid'
                  ? 'প্রদান'
                  : f.status === 'partial'
                    ? 'আংশিক'
                    : 'বাকি',
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
                label="মোট শিক্ষার্থী"
                value={studentPerformance.length}
                icon={Users}
                color="brand"
              />
              <StatCard
                label="গড় স্কোর"
                value={
                  studentPerformance.length > 0
                    ? `${Math.round(
                        studentPerformance.reduce((s, p) => s + p.averageScore, 0) /
                          studentPerformance.length,
                      )}%`
                    : '0%'
                }
                icon={BarChart3}
                color="green"
              />
              <StatCard
                label="পরীক্ষা দেওয়া"
                value={
                  studentPerformance.reduce((s, p) => s + p.examsAttempted, 0)
                }
                icon={FileText}
                color="blue"
              />
            </div>
            <ChartCard title="শিক্ষার্থী পারফরম্যান্স">
              <PerformanceChart data={studentPerformance} />
            </ChartCard>
            <DataTable
              headers={['শিক্ষার্থী', 'পরীক্ষা', 'গড় স্কোর', 'সর্বোচ্চ', 'সর্বনিম্ন']}
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
          <span className="text-muted-foreground">থেকে</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
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
            এক্সপোর্ট CSV
          </button>
        </div>
      </div>

      {renderReportContent()}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand/10 text-brand',
    green: 'bg-green/10 text-green',
    gold: 'bg-gold/15 text-gold',
    red: 'bg-destructive/10 text-destructive',
    blue: 'bg-blue-500/10 text-blue-500',
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex size-11 items-center justify-center rounded-xl ${colorMap[color]}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h4 className="font-heading font-semibold text-foreground mb-4">{title}</h4>
      {children}
    </div>
  )
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-muted-foreground">
                  কোনো ডেটা নেই
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BarChart({ data, xKey, yKey }: { data: any[]; xKey: string; yKey: string }) {
  const maxValue = Math.max(...data.map((d) => d[yKey]), 1)
  return (
    <div className="h-64 flex items-end justify-around gap-1 px-2">
      {data.map((d, i) => {
        const height = (d[yKey] / maxValue) * 240
        return (
          <div key={i} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-brand rounded-t transition-all hover:bg-brand/80"
              style={{ height: `${height}px` }}
              title={`${d[xKey]}: ${d[yKey]}`}
            />
            <span className="text-xs text-muted-foreground mt-2">{d[xKey]}</span>
            <span className="text-xs font-medium text-foreground">{d[yKey]}</span>
          </div>
        )
      })}
    </div>
  )
}

function RevenueChart({ data }: { data: RevenueReport[] }) {
  const maxValue = Math.max(...data.map((d) => d.total), 1)
  return (
    <div className="h-64 flex items-end justify-around gap-1 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div className="w-full flex flex-col-reverse" style={{ height: '240px' }}>
            <div
              className="bg-green rounded-t transition-all hover:bg-green/80"
              style={{ height: `${(d.verified / maxValue) * 240}px` }}
              title={`${d.period} যাচাইকৃত: ${d.verified}`}
            />
            <div
              className="bg-gold rounded-t transition-all hover:bg-gold/80"
              style={{ height: `${(d.pending / maxValue) * 240}px` }}
              title={`${d.period} অপেক্ষমান: ${d.pending}`}
            />
          </div>
          <span className="text-xs text-muted-foreground mt-2">{d.period}</span>
        </div>
      ))}
      <div className="flex items-center gap-4 ml-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green" /> যাচাইকৃত</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gold" /> অপেক্ষমান</span>
      </div>
    </div>
  )
}

function AttendanceChart({ data }: { data: AttendanceStats[] }) {
  if (data.length === 0) return <p className="text-center text-muted-foreground py-8">কোনো ডেটা নেই</p>
  const present = data.reduce((s, d) => s + d.present + d.late, 0)
  const absent = data.reduce((s, d) => s + d.absent, 0)
  const total = present + absent
  return (
    <div className="h-64 flex items-center justify-center gap-8">
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              className="text-muted-foreground/20"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              strokeDasharray={`${(present / total) * 439.8} 439.8`}
              strokeLinecap="round"
              className="text-green"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-foreground">
              {total > 0 ? Math.round((present / total) * 100) : 0}%
            </span>
            <span className="text-xs text-muted-foreground">উপস্থিতি</span>
          </div>
        </div>
      </div>
      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green" />
          <span>উপস্থিত: {present}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gold" />
          <span>বিলম্বিত: {data.reduce((s, d) => s + d.late, 0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-destructive" />
          <span>অনুপস্থিত: {absent}</span>
        </div>
      </div>
    </div>
  )
}

function CourseAnalyticsChart({ data }: { data: CourseAnalytics[] }) {
  if (data.length === 0) return <p className="text-center text-muted-foreground py-8">কোনো কোর্স নেই</p>
  return (
    <div className="h-64 flex items-end justify-around gap-1 px-2 overflow-x-auto">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 min-w-[60px]">
          <div
            className="w-full bg-brand rounded-t transition-all hover:bg-brand/80"
            style={{ height: `${Math.max(40, (d.totalEnrollments / Math.max(...data.map(x => x.totalEnrollments), 1)) * 240)}px` }}
            title={`${d.courseTitle}: ${d.totalEnrollments} এনরোলমেন্ট`}
          />
          <span className="text-xs text-muted-foreground mt-2 text-center truncate w-full">
            {d.courseTitle}
          </span>
          <span className="text-xs font-medium text-foreground">{d.totalEnrollments}</span>
        </div>
      ))}
    </div>
  )
}

function PerformanceChart({ data }: { data: StudentPerformance[] }) {
  if (data.length === 0) return <p className="text-center text-muted-foreground py-8">কোনো ডেটা নেই</p>
  const sorted = [...data].sort((a, b) => b.averageScore - a.averageScore).slice(0, 10)
  return (
    <div className="h-64 flex items-end justify-around gap-1 px-2">
      {sorted.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 min-w-[50px]">
          <div
            className="w-full bg-brand rounded-t transition-all hover:bg-brand/80"
            style={{ height: `${(d.averageScore / 100) * 240}px` }}
            title={`${d.studentName}: ${d.averageScore}%`}
          />
          <span className="text-xs text-muted-foreground mt-2 text-center truncate w-full">
            {d.studentName}
          </span>
          <span className="text-xs font-medium text-foreground">{d.averageScore}%</span>
        </div>
      ))}
    </div>
  )
}