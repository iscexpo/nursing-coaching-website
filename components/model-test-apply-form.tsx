'use client'

import { useState } from 'react'
import { Loader2, Send, CheckCircle2 } from 'lucide-react'

type ExamOption = { id: string; title: string }

export function ModelTestApplyForm({ exams }: { exams: ExamOption[] }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [examId, setExamId] = useState('')
  const [preferredSubject, setPreferredSubject] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(null)
    try {
      const res = await fetch('/api/model-test/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          examId: examId || undefined,
          preferredSubject: preferredSubject.trim() || undefined,
          message: message.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(data.message || 'আবেদন গৃহীত হয়েছে')
        setName('')
        setPhone('')
        setExamId('')
        setPreferredSubject('')
        setMessage('')
      } else {
        setError(data.error || 'আবেদন জমা দিতে ব্যর্থ')
      }
    } catch {
      setError('আবেদন জমা দিতে ব্যর্থ')
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'mt-1 block w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green/10 px-3 py-2 text-sm text-green">
          <CheckCircle2 className="size-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground">
          নাম *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputCls}
          placeholder="আপনার নাম"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          মোবাইল নম্বর *
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className={inputCls}
          placeholder="01784-176442"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          পছন্দের পরীক্ষা
        </label>
        <select
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          className={inputCls}
        >
          <option value="">পরীক্ষা নির্বাচন করুন (ঐচ্ছিক)</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          পছন্দের বিষয়
        </label>
        <input
          value={preferredSubject}
          onChange={(e) => setPreferredSubject(e.target.value)}
          className={inputCls}
          placeholder="যেমন: অ্যানাটমি"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">
          বার্তা
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className={inputCls}
          placeholder="ঐচ্ছিক"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        মডেল টেস্টে আবেদন করুন
      </button>
    </form>
  )
}
