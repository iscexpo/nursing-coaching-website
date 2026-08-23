'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Plus, Loader2, Calendar, LayoutGrid, List } from 'lucide-react'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { Enrollment, AttendanceRecord } from './types'

const CalendarView = dynamic(
  () => import('@/components/ui/calendar-view').then((m) => m.CalendarView),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl bg-secondary/50" />
    ),
  },
)

export function AttendancePanel({
  enrollments,
  attendance,
  onRefresh,
}: {
  enrollments: Enrollment[]
  attendance: AttendanceRecord[]
  onRefresh: () => void
}) {
  const t = useTranslations('admin.attendance')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    userId: '',
    date: '',
    status: 'present' as 'present' | 'late' | 'absent',
    time: '',
  })
  const [filterDate, setFilterDate] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')

  const students = enrollments.filter(
    (e) => e.status === 'active' || e.status === 'approved',
  )
  const uniqueStudents = students.reduce((acc, e) => {
    if (!acc.find((s) => s.userId === e.userId)) acc.push(e)
    return acc
  }, [] as Enrollment[])

  const filtered = filterDate
    ? attendance.filter((a) => a.date.startsWith(filterDate))
    : attendance

  const calendarData = useMemo(() => {
    const map: Record<string, 'present' | 'absent' | 'late'> = {}
    for (const a of attendance) {
      const key = a.date.slice(0, 10)
      if (!map[key]) map[key] = a.status as 'present' | 'absent' | 'late'
    }
    return map
  }, [attendance])

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
    present: { label: t('present'), cls: 'bg-green/10 text-green' },
    late: { label: t('late'), cls: 'bg-gold/10 text-gold' },
    absent: { label: t('absent'), cls: 'bg-destructive/10 text-destructive' },
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">
          {t('title')}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-brand text-brand-foreground' : 'bg-card text-muted-foreground hover:bg-secondary'}`}
              title="Table view"
              aria-label="Table view"
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 ${viewMode === 'calendar' ? 'bg-brand text-brand-foreground' : 'bg-card text-muted-foreground hover:bg-secondary'}`}
              title="Calendar view"
              aria-label="Calendar view"
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
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
            {t('takeAttendance')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {t('markTitle')}
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField id="att-student" label={t('studentLabel')} required>
                <select
                  id="att-student"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  aria-required="true"
                >
                  <option value="">{t('selectStudent')}</option>
                  {uniqueStudents.map((s) => (
                    <option key={s.userId} value={s.userId}>
                      {s.userName || s.userId.slice(0, 8)} — {s.userPhone || ''}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField id="att-date" label={t('dateLabel')} required>
                <Input
                  id="att-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  aria-required="true"
                />
              </FormField>
              <FormField id="att-status" label={t('statusLabel')}>
                <select
                  id="att-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as 'present' | 'late' | 'absent',
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="present">{t('present')}</option>
                  <option value="late">{t('late')}</option>
                  <option value="absent">{t('absent')}</option>
                </select>
              </FormField>
              <FormField id="att-time" label={t('timeOptional')}>
                <Input
                  id="att-time"
                  type="text"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder={t('timePlaceholder')}
                />
              </FormField>
            </div>
            <Separator />
            <button
              onClick={handleMarkAttendance}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Calendar className="size-4" />
              )}
              {t('saveBtn')}
            </button>
          </div>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <CalendarView
          attendanceData={calendarData}
          onDateClick={(date) => setFilterDate(date)}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('dateLabel')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('studentLabel')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    {t('statusLabel')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('timeLabel')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const student = enrollments.find((e) => e.userId === a.userId)
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(a.date).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {student?.userName ||
                          a.userStudentId ||
                          a.userId.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusLabel[a.status]?.cls || ''}`}
                        >
                          {statusLabel[a.status]?.label || a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {a.time || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      {t('noRecords')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
