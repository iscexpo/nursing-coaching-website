'use client'

import { useState } from 'react'
import { Plus, Trash2, Loader2, CreditCard } from 'lucide-react'
import type { Enrollment, Exam, AdmitCard } from './types'

export function AdmitCardsPanel({ enrollments, exams, admitCards, onRefresh }: { enrollments: Enrollment[]; exams: Exam[]; admitCards: AdmitCard[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ userId: '', examId: '', examName: '', examDate: '', examTime: '', center: '', seatNumber: '' })

  const students = enrollments.filter((e) => e.status === 'active' || e.status === 'approved')
  const uniqueStudents = students.reduce((acc, e) => {
    if (!acc.find((s) => s.userId === e.userId)) acc.push(e)
    return acc
  }, [] as Enrollment[])

  function handleExamSelect(examId: string) {
    const exam = exams.find((e) => e.id === examId)
    setForm({ ...form, examId, examName: exam?.title || '' })
  }

  async function handleCreate() {
    if (!form.userId || !form.examId || !form.examName || !form.examDate || !form.examTime || !form.center) return
    setSaving(true)
    try {
      await fetch('/api/admit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId,
          examId: form.examId,
          examName: form.examName,
          examDate: form.examDate,
          examTime: form.examTime,
          center: form.center,
          seatNumber: form.seatNumber || undefined,
        }),
      })
      setForm({ userId: '', examId: '', examName: '', examDate: '', examTime: '', center: '', seatNumber: '' })
      setShowForm(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to create admit card:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admit-cards/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete admit card:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">এডমিট কার্ড ব্যবস্থাপনা</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন এডমিট কার্ড
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">নতুন এডমিট কার্ড তৈরি</h4>
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
                <label className="block text-sm font-medium text-foreground">পরীক্ষা</label>
                <select value={form.examId} onChange={(e) => handleExamSelect(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                  <option value="">পরীক্ষা বাছাই করুন</option>
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">পরীক্ষার তারিখ</label>
                <input type="text" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} placeholder="যেমন: ৯ আগস্ট ২০২৬"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">সময়</label>
                <input type="text" value={form.examTime} onChange={(e) => setForm({ ...form, examTime: e.target.value })} placeholder="যেমন: সকাল ১০:০০ — ১১:০০"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">কেন্দ্র</label>
                <input type="text" value={form.center} onChange={(e) => setForm({ ...form, center: e.target.value })} placeholder="পরীক্ষা কেন্দ্র"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">সিট নম্বর (ঐচ্ছিক)</label>
                <input type="text" value={form.seatNumber} onChange={(e) => setForm({ ...form, seatNumber: e.target.value })} placeholder="সিট নম্বর"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <button onClick={handleCreate} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
              এডমিট কার্ড তৈরি করুন
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">শিক্ষার্থী</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">পরীক্ষা</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">তারিখ</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">সময়</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">কেন্দ্র</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">সিট</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {admitCards.map((card) => {
                const student = enrollments.find((e) => e.userId === card.userId)
                return (
                   <tr key={card.id} className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50">
                    <td className="px-4 py-3 font-medium text-foreground">{student?.userName || card.userId.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{card.examName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{card.examDate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{card.examTime}</td>
                    <td className="px-4 py-3 text-muted-foreground">{card.center}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{card.seatNumber || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(card.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {admitCards.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">কোনো এডমিট কার্ড নেই</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
