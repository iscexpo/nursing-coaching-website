'use client'

import { BarChart3, Receipt, GraduationCap } from 'lucide-react'
import { AttendanceStatusBadge, EnrollmentStatusBadge } from '@/components/ui/badges'
import { StatCard } from '@/components/ui/stat-card'
import type { Enrollment, ExamSubmission, AttendanceRecord } from './types'

export function OverviewTab({
  examSubmissions,
  attendance,
  enrollments,
  totalDue,
  totalPaid,
}: {
  examSubmissions: ExamSubmission[]
  attendance: AttendanceRecord[]
  enrollments: Enrollment[]
  totalDue: number
  totalPaid: number
}) {
  const avgScore = examSubmissions.length > 0
    ? Math.round(examSubmissions.reduce((s, r) => s + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / examSubmissions.length)
    : 0
  const activeEnrollments = enrollments.filter((e) => e.status === 'active' || e.status === 'approved')

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="সক্রিয় কোর্স" value={`${activeEnrollments.length}টি`} icon={GraduationCap} color="brand" />
        <StatCard label="গড় স্কোর" value={`${avgScore}%`} icon={BarChart3} color="green" />
        <StatCard label="মোট পেমেন্ট" value={`৳${totalPaid.toLocaleString()}`} icon={Receipt} color="green" />
        <StatCard label="বকেয়" value={totalDue > 0 ? `৳${totalDue.toLocaleString()}` : '০'} icon={Receipt} color={totalDue > 0 ? 'gold' : 'green'} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">সর্বশেষ ফলাফল</h3>
          <div className="mt-3 space-y-2">
            {examSubmissions.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{r.examTitle || 'পরীক্ষা'}</span>
                <span className="font-semibold text-brand">{r.score}/{r.total}</span>
              </div>
            ))}
            {examSubmissions.length === 0 && (
              <p className="text-xs text-muted-foreground">কোনো ফলাফল নেই</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">সাম্প্রতিক উপস্থিতি</h3>
          <div className="mt-3 space-y-2">
            {attendance.slice(-5).reverse().map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{new Date(a.date).toLocaleDateString('bn-BD')}</span>
                <AttendanceStatusBadge status={a.status} />
              </div>
            ))}
            {attendance.length === 0 && (
              <p className="text-xs text-muted-foreground">কোনো উপস্থিতি রেকর্ড নেই</p>
            )}
          </div>
        </div>
      </div>
      {enrollments.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">আমার এনরোলমেন্ট</h3>
          <div className="mt-3 space-y-3">
            {enrollments.slice(0, 3).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-foreground">{e.courseTitle || 'কোর্স'}</span>
                  <span className="ml-2 text-muted-foreground">({e.courseDuration || ''})</span>
                </div>
                <EnrollmentStatusBadge status={e.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
