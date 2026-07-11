'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Save, X } from 'lucide-react'
import { NOTICES } from '@/lib/site-data'
import type { Notice } from './types'

export function NoticesPanel() {
  const [notices, setNotices] = useState<Notice[]>(
    NOTICES.map((n, i) => ({ ...n, id: i + 1 }))
  )
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [form, setForm] = useState({ tag: 'ভর্তি', title: '', urgent: false })

  function handleSave() {
    if (!form.title.trim()) return
    if (editing) {
      setNotices((prev) => prev.map((n) => n.id === editing.id ? { ...n, ...form, date: n.date } : n))
    } else {
      const newNotice: Notice = {
        id: Date.now(),
        ...form,
        date: 'আজ',
      }
      setNotices((prev) => [newNotice, ...prev])
    }
    setForm({ tag: 'ভর্তি', title: '', urgent: false })
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(n: Notice) {
    setEditing(n)
    setForm({ tag: n.tag, title: n.title, urgent: n.urgent })
    setShowForm(true)
  }

  function handleDelete(id: number) {
    setNotices((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">নোটিশ ব্যবস্থাপনা</h3>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ tag: 'ভর্তি', title: '', urgent: false }) }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন নোটিশ
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ'}
            </h4>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">ট্যাগ</label>
                <select
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option>ভর্তি</option>
                  <option>ক্লাস</option>
                  <option>পরীক্ষা</option>
                  <option>ডেডলাইন</option>
                  <option>সাধারণ</option>
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.urgent}
                    onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                    className="size-4 rounded border-border"
                  />
                  জরুরি
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">নোটিশ</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="নোটিশের বিষয় লিখুন"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
              <Save className="size-4" />
              {editing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n.id} className={`rounded-2xl border bg-card p-4 shadow-sm ${n.urgent ? 'border-gold/50' : 'border-border'}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-brand">{n.tag}</span>
              {n.urgent && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">জরুরি</span>}
              <span className="ml-auto text-xs text-muted-foreground">{n.date}</span>
              <button onClick={() => handleEdit(n)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => handleDelete(n.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{n.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
