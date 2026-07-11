'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

export function NotificationsPanel() {
  const [form, setForm] = useState({ title: '', message: '', target: 'all' })
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!form.title.trim() || !form.message.trim()) return
    setSending(true)
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setForm({ title: '', message: '', target: 'all' })
    } catch (error) {
      console.error('Failed to send notification:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-foreground">নোটিফিকেশন পাঠান</h3>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground">শিরোনাম</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="নোটিফিকেশনের শিরোনাম"
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">বার্তা</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              placeholder="নোটিফিকেশনের বিবরণ"
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">লক্ষ্য</label>
            <select
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="all">সকল শিক্ষার্থী</option>
              <option value="active">সক্রিয় শিক্ষার্থী</option>
              <option value="pending">অপেক্ষমান</option>
            </select>
          </div>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            পাঠান
          </button>
        </div>
      </div>
    </div>
  )
}
