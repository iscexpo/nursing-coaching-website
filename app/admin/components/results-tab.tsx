'use client'

import { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react'
import type { Exam, ExamSubmission } from './types'

interface ResultsPanelProps {
  exams: Exam[]
  submissions: ExamSubmission[]
}

export function ResultsPanel({ exams, submissions }: ResultsPanelProps) {
  const [filterExam, setFilterExam] = useState<string>('all')

  const filtered = useMemo(
    () =>
      filterExam === 'all'
        ? submissions
        : submissions.filter((s) => s.examId === filterExam),
    [submissions, filterExam],
  )

  const stats = useMemo(() => {
    if (filtered.length === 0) return null

    const scores = filtered.map((s) =>
      s.total > 0 ? (s.score / s.total) * 100 : 0,
    )
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const passed = scores.filter((s) => s >= 40).length
    const passRate = (passed / scores.length) * 100
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)
    const uniqueStudents = new Set(filtered.map((s) => s.userId)).size

    return {
      avg,
      passRate,
      highest,
      lowest,
      uniqueStudents,
      total: filtered.length,
    }
  }, [filtered])

  const perExam = useMemo(() => {
    const map = new Map<
      string,
      { exam: Exam; subs: ExamSubmission[]; avg: number; passRate: number }
    >()
    for (const exam of exams) {
      const subs = filtered.filter((s) => s.examId === exam.id)
      if (subs.length === 0) continue
      const scores = subs.map((s) =>
        s.total > 0 ? (s.score / s.total) * 100 : 0,
      )
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const passed = scores.filter((s) => s >= 40).length
      map.set(exam.id, {
        exam,
        subs,
        avg,
        passRate: (passed / subs.length) * 100,
      })
    }
    return Array.from(map.values())
  }, [exams, filtered])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">
          পরীক্ষার ফলাফল বিশ্লেষণ
        </h3>
        <select
          value={filterExam}
          onChange={(e) => setFilterExam(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="all">সকল পরীক্ষা</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </select>
      </div>

      {stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={BarChart3}
              label="গড় স্কোর"
              value={`${stats.avg.toFixed(1)}%`}
            />
            <StatCard
              icon={TrendingUp}
              label="পাসের হার"
              value={`${stats.passRate.toFixed(1)}%`}
            />
            <StatCard
              icon={Award}
              label="সর্বোচ্চ স্কোর"
              value={`${stats.highest.toFixed(1)}%`}
            />
            <StatCard
              icon={Users}
              label="অংশগ্রহণকারী"
              value={`${stats.uniqueStudents} জন`}
            />
          </div>

          {perExam.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-heading font-semibold text-foreground">
                বিষয়ভিত্তিক ফলাফল
              </h4>
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/30">
                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                          পরীক্ষা
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                          বিষয়
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">
                          অংশগ্রহণ
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">
                          গড় স্কোর
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">
                          পাসের হার
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {perExam.map((pe) => (
                        <tr
                          key={pe.exam.id}
                          className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {pe.exam.title}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-brand">
                              {pe.exam.subject}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-foreground">
                            {pe.subs.length}
                          </td>
                          <td className="px-4 py-3 text-center text-foreground">
                            {pe.avg.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${pe.passRate >= 60 ? 'bg-green/10 text-green' : pe.passRate >= 40 ? 'bg-brand/10 text-brand' : 'bg-destructive/10 text-destructive'}`}
                            >
                              {pe.passRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <BarChart3 className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            এখনো কোনো ফলাফল নেই
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <Icon className="size-6 text-brand" />
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
