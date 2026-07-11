'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Save, X } from 'lucide-react'
import { QUESTION_BANK, SUBJECTS } from '@/lib/site-data'
import type { Question } from '@/lib/site-data'

export function QuestionsPanel() {
  const [questions, setQuestions] = useState<Question[]>([...QUESTION_BANK])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)
  const [filterSubject, setFilterSubject] = useState('all')
  const [form, setForm] = useState({
    subject: 'বাংলা',
    question: '',
    options: ['', '', '', ''] as [string, string, string, string],
    correct: 0,
  })

  const filtered = filterSubject === 'all' ? questions : questions.filter((q) => q.subject === filterSubject)
  const subjectCounts = SUBJECTS.reduce((acc, s) => ({ ...acc, [s]: questions.filter((q) => q.subject === s).length }), {} as Record<string, number>)

  function handleSave() {
    if (!form.question.trim() || form.options.some((o) => !o.trim())) return
    if (editing) {
      setQuestions((prev) => prev.map((q) => q.id === editing.id ? { ...q, ...form } : q))
    } else {
      const newQ: Question = { id: Date.now(), ...form }
      setQuestions((prev) => [...prev, newQ])
    }
    setForm({ subject: 'বাংলা', question: '', options: ['', '', '', ''], correct: 0 })
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(q: Question) {
    setEditing(q)
    setForm({ subject: q.subject, question: q.question, options: [...q.options] as [string, string, string, string], correct: q.correct })
    setShowForm(true)
  }

  function handleDelete(id: number) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">প্রশ্নব্যাংক</h3>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ subject: 'বাংলা', question: '', options: ['', '', '', ''], correct: 0 }) }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন প্রশ্ন
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterSubject(filterSubject === s ? 'all' : s)}
            className={`rounded-xl border p-3 text-center transition-colors ${
              filterSubject === s ? 'border-brand bg-brand/5' : 'border-border bg-card hover:bg-secondary'
            }`}
          >
            <p className="text-lg font-bold text-foreground">{subjectCounts[s]}</p>
            <p className="text-xs text-muted-foreground">{s}</p>
          </button>
        ))}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? 'প্রশ্ন সম্পাদনা' : 'নতুন প্রশ্ন যোগ করুন'}
            </h4>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground">বিষয়</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">প্রশ্ন</label>
              <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                rows={2} placeholder="প্রশ্ন লিখুন..."
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {form.options.map((opt, i) => (
                <div key={i}>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <input type="radio" name="correct" checked={form.correct === i}
                      onChange={() => setForm({ ...form, correct: i })}
                      className="size-4" />
                    উত্তর {String.fromCharCode(65 + i)} {i === form.correct && <span className="text-green text-xs">(সঠিক)</span>}
                  </label>
                  <input type="text" value={opt} onChange={(e) => {
                    const newOpts = [...form.options] as [string, string, string, string]
                    newOpts[i] = e.target.value
                    setForm({ ...form, options: newOpts })
                  }} placeholder={`উত্তর ${String.fromCharCode(65 + i)}`}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
              <Save className="size-4" />
              {editing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-center font-semibold text-foreground w-10">#</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">বিষয়</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">প্রশ্ন</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">সঠিক</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, i) => (
                <tr key={q.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-center text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-brand">{q.subject}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground max-w-xs truncate">{q.question}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-green/10 text-xs font-bold text-green">
                      {String.fromCharCode(65 + q.correct)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(q)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
