'use client'

import { Clock } from 'lucide-react'
import { AttendanceStatusBadge } from '@/components/ui/badges'
import type { AttendanceRecord } from './types'

export function AttendanceView({ attendance }: { attendance: AttendanceRecord[] }) {
  const presentDays = attendance.filter((a) => a.status === 'present').length
  const lateDays = attendance.filter((a) => a.status === 'late').length
  const absentDays = attendance.filter((a) => a.status === 'absent').length
  const totalDays = attendance.length
  const pct = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-green">{presentDays}</p>
          <p className="text-xs text-muted-foreground">উপস্থিত</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-gold">{lateDays}</p>
          <p className="text-xs text-muted-foreground">বিলম্বিত</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-destructive">{absentDays}</p>
          <p className="text-xs text-muted-foreground">অনুপস্থিত</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-bold text-foreground">সর্বমোট উপস্থিতি</h3>
          <span className="text-2xl font-bold text-brand">{pct}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {totalDays} দিনের মধ্যে {presentDays + lateDays} দিন উপস্থিত
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">তারিখ</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">সময়</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{new Date(a.date).toLocaleDateString('bn-BD')}</td>
                  <td className="px-4 py-3 text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {a.time || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AttendanceStatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">কোনো উপস্থিতি রেকর্ড নেই</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
