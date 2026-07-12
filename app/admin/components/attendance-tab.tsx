'use client'

import { useState } from 'react'
import { Plus, Loader2, Calendar } from 'lucide-react'
import type { Enrollment, AttendanceRecord } from './types'

export function AttendancePanel({ enrollments, attendance, onRefresh }: { enrollments: Enrollment[]; attendance: AttendanceRecord[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ userId: '', date: '', status: 'present' as 'present' | 'late' | 'absent', time: '' })
  const [filterDate, setFilterDate] = useState('')

  const students = enrollments.filter((e) => e.status === 'active' || e.status === 'approved')
  const uniqueStudents = students.reduce((acc, e) => {
    if (!acc.find((s) => s.userId === e.userId)) acc.push(e)
    return acc
  }, [] as Enrollment[])

  const filtered = filterDate
    ? attendance.filter((a) => a.date.startsWith(filterDate))
    : attendance

  async function handleMarkAttendance() {
    if (!form.userId || !form.date) return
    setSaving(true)
    try {
      await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId,
          date: new Date(form.date).toISOString(),
          status: form.status,
          time: form.time || undefined,
        }),
      })
      setForm({ userId: '', date: '', status: 'present', time: '' })
      setShowForm(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to mark attendance:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/attendance/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete attendance:', error)
    }
  }

  const statusLabel: Record<string, { label: string; cls: string }> = {
    present: { label: 'উপস্থিত', cls: 'bg-green/10 text-green' },
    late: { label: 'বিলম্বিত', cls: 'bg-gold/10 text-gold' },
    absent: { label: 'অনুপস্থিত', cls: 'bg-destructive/10 text-destructive' },
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">উপস্থিতি ব্যবস্থাপনা</h3>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <Plus className="size-4" />
            উপস্থিতি নিন
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">উপস্থিতি নির্ধারণ</h4>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">শিক্ষার্থী</label>
                <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                  <option value="">শিক্ষার্থী বাছাই করুন</option>
                  {uniqueStudents.map((s) => (
                    <option key={s.userId} value={s.userId}>{s.userName || s.userId.slice(0, 8)} — {s.userPhone || ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">তারিখ</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">অবস্থা</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'present' | 'late' | 'absent' })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                  <option value="present">উপস্থিত</option>
                  <option value="late">বিলম্বিত</option>
                  <option value="absent">অনুপস্থিত</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">সময় (ঐচ্ছিক)</label>
                <input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="যেমন: সকাল ১০:০০"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <button onClick={handleMarkAttendance} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Calendar className="size-4" />}
              উপস্থিতি সংরক্ষণ
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">তারিখ</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">শিক্ষার্থী</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">সময়</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const student = enrollments.find((e) => e.userId === a.userId)
                return (
                   <tr key={a.id} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3 text-muted-foreground">{new Date(a.date).toLocaleDateString('bn-BD')}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{student?.userName || a.userStudentId || a.userId.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusLabel[a.status]?.cls || ''}`}>
                        {statusLabel[a.status]?.label || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.time || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(a.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        মুছুন
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">কোনো উপস্থিতি রেকর্ড নেই</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
