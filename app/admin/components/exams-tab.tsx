'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, X, Clock, Loader2 } from 'lucide-react'
import type { Exam, ExamSubmission } from './types'

const DIFFICULTY_LABELS: Record<string, { label: string; cls: string }> = {
  easy: { label: 'সহজ', cls: 'bg-green/10 text-green' },
  medium: { label: 'মাঝারি', cls: 'bg-brand/10 text-brand' },
  hard: { label: 'কঠিন', cls: 'bg-destructive/10 text-destructive' },
}

export function ExamsPanel({
  exams,
  submissions,
  onRefresh,
}: {
  exams: Exam[]
  submissions: ExamSubmission[]
  onRefresh: () => void
}) {
  const [showExamForm, setShowExamForm] = useState(false)
  const [examForm, setExamForm] = useState({
    title: '',
    subject: '',
    duration: 15,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  })
  const [saving, setSaving] = useState(false)
  const [subjects, setSubjects] = useState<{ name: string }[]>([])

  useEffect(() => {
    fetch('/api/subjects')
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setSubjects(d.data)
      })
      .catch(() => {})
  }, [])

  const [filterExam, setFilterExam] = useState<string>('all')
  const filteredSubmissions =
    filterExam === 'all'
      ? submissions
      : submissions.filter((s) => s.examId === filterExam)

  async function handleCreateExam() {
    if (!examForm.title.trim()) return
    setSaving(true)
    try {
      await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examForm),
      })
      setExamForm({
        title: '',
        subject: subjects[0]?.name || '',
        duration: 15,
        difficulty: 'medium',
      })
      setShowExamForm(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to create exam:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteExam(id: string) {
    try {
      await fetch(`/api/exams/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete exam:', error)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/exams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to toggle exam:', error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground">
            পরীক্ষা ব্যবস্থাপনা
          </h3>
          <button
            onClick={() => setShowExamForm(!showExamForm)}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <Plus className="size-4" />
            নতুন পরীক্ষা
          </button>
        </div>

        {showExamForm && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold text-foreground">
                নতুন পরীক্ষা তৈরি
              </h4>
              <button
                onClick={() => setShowExamForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    পরীক্ষার নাম
                  </label>
                  <input
                    type="text"
                    value={examForm.title}
                    onChange={(e) =>
                      setExamForm({ ...examForm, title: e.target.value })
                    }
                    placeholder="যেমন: মডেল টেস্ট #৫"
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    বিষয়
                  </label>
                  <select
                    value={examForm.subject}
                    onChange={(e) =>
                      setExamForm({ ...examForm, subject: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    {subjects.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    সময়কাল (মিনিট)
                  </label>
                  <input
                    type="number"
                    value={examForm.duration}
                    onChange={(e) =>
                      setExamForm({
                        ...examForm,
                        duration: Number(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    কঠিনতা
                  </label>
                  <select
                    value={examForm.difficulty}
                    onChange={(e) =>
                      setExamForm({
                        ...examForm,
                        difficulty: e.target.value as
                          'easy' | 'medium' | 'hard',
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="easy">সহজ</option>
                    <option value="medium">মাঝারি</option>
                    <option value="hard">কঠিন</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleCreateExam}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                পরীক্ষা তৈরি করুন
              </button>
            </div>
          </div>
        )}

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
                    সময়কাল
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    প্রশ্ন
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    কঠিনতা
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    অবস্থা
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {e.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-brand">
                        {e.subject}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Clock className="size-3.5" />
                      {e.duration} মিনিট
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {e.questionCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_LABELS[e.difficulty]?.cls || ''}`}
                      >
                        {DIFFICULTY_LABELS[e.difficulty]?.label || e.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(e.id, e.isActive)}
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${e.isActive ? 'bg-green/10 text-green' : 'bg-secondary text-muted-foreground'}`}
                      >
                        {e.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteExam(e.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      কোনো পরীক্ষা নেই
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-lg font-bold text-foreground">
            ফলাফল ব্যবস্থাপনা
          </h3>
          <div className="flex items-center gap-2">
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
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    শিক্ষার্থী
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    পরীক্ষা
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    স্কোর
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    সময়
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    তারিখ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((s) => {
                  const pct =
                    s.total > 0 ? Math.round((s.score / s.total) * 100) : 0
                  const exam = exams.find((e) => e.id === s.examId)
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {s.userStudentId || s.userId.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {exam?.title || s.examId.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-foreground">
                          {s.score}
                        </span>
                        <span className="text-muted-foreground">
                          /{s.total}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {s.timeTaken ? `${s.timeTaken} সে.` : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                    </tr>
                  )
                })}
                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      কোনো ফলাফল নেই
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
