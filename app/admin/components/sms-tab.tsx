'use client'

import { useState, useRef } from 'react'
import { Send, Loader2, Users, Upload, FileText } from 'lucide-react'

const inputCls = "mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"

export function SmsPanel() {
  return (
    <div className="space-y-6">
      <h3 className="font-heading text-lg font-bold text-foreground">SMS ব্যবস্থাপনা</h3>
      <SingleSmsSection />
      <BulkSmsSection />
      <CsvImportSection />
    </div>
  )
}

function SingleSmsSection() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleSend() {
    if (!phone.trim() || !message.trim()) return
    setSending(true)
    setStatus(null)
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), message: message.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setStatus({ ok: true, text: `পাঠানো হয়েছে — ${data.sent} জনকে (${data.provider})` })
      if (!data.skipped) { setPhone(''); setMessage('') }
    } catch (e) {
      setStatus({ ok: false, text: e instanceof Error ? e.message : 'SMS পাঠানো যায়নি' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Send className="size-5 text-brand" />
        <h4 className="font-heading font-semibold text-foreground">সিঙ্গেল SMS</h4>
      </div>
      <p className="text-sm text-muted-foreground">একটি ফোন নম্বরে SMS পাঠান</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground">ফোন নম্বর</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground">বার্তা</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="SMS লিখুন..." rows={3} className={inputCls} />
        </div>
      </div>
      <button onClick={handleSend} disabled={sending || !phone.trim() || !message.trim()}
        className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50">
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {sending ? 'পাঠানো হচ্ছে...' : 'SMS পাঠান'}
      </button>
      {status && (
        <p className={`text-sm ${status.ok ? 'text-green-600' : 'text-destructive'}`}>{status.text}</p>
      )}
    </div>
  )
}

function BulkSmsSection() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleSend() {
    if (!message.trim()) return
    setSending(true)
    setStatus(null)
    try {
      const res = await fetch('/api/sms/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: message.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setStatus({ ok: true, text: `পাঠানো হয়েছে — ${data.sent} জনকে (${data.provider})` })
      if (!data.skipped) setMessage('')
    } catch (e) {
      setStatus({ ok: false, text: e instanceof Error ? e.message : 'SMS পাঠানো যায়নি' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-brand" />
        <h4 className="font-heading font-semibold text-foreground">বাল্ক SMS (সকল শিক্ষার্থী)</h4>
      </div>
      <p className="text-sm text-muted-foreground">সকল নিবন্ধিত শিক্ষার্থীদের SMS পাঠান</p>
      <div>
        <label className="block text-sm font-medium text-foreground">বার্তা</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="SMS লিখুন..." rows={3} className={inputCls} />
      </div>
      <button onClick={handleSend} disabled={sending || !message.trim()}
        className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50">
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Users className="size-4" />}
        {sending ? 'পাঠানো হচ্ছে...' : 'সকলকে SMS পাঠান'}
      </button>
      {status && (
        <p className={`text-sm ${status.ok ? 'text-green-600' : 'text-destructive'}`}>{status.text}</p>
      )}
    </div>
  )
}

function CsvImportSection() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleSend() {
    if (!file || !message.trim()) return
    setSending(true)
    setStatus(null)
    try {
      const formData = new FormData()
      formData.append('title', 'মার্কেটিং')
      formData.append('content', message.trim())
      formData.append('file', file)
      const res = await fetch('/api/sms/marketing', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setStatus({ ok: true, text: `পাঠানো হয়েছে — ${data.sent} জনকে (${data.provider})` })
      setFile(null); setMessage('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setStatus({ ok: false, text: e instanceof Error ? e.message : 'SMS পাঠানো যায়নি' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="size-5 text-brand" />
        <h4 className="font-heading font-semibold text-foreground">CSV থেকে SMS (মার্কেটিং)</h4>
      </div>
      <p className="text-sm text-muted-foreground">CSV/Excel ফাইলে ফোন নম্বর দিয়ে SMS পাঠান</p>
      <div>
        <label className="block text-sm font-medium text-foreground">ফোন নম্বরের CSV/Excel ফাইল</label>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-brand/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-brand hover:file:bg-brand/20" />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground">বার্তা</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="SMS লিখুন..." rows={3} className={inputCls} />
      </div>
      <button onClick={handleSend} disabled={sending || !file || !message.trim()}
        className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50">
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {sending ? 'পাঠানো হচ্ছে...' : 'CSV থেকে SMS পাঠান'}
      </button>
      {status && (
        <p className={`text-sm ${status.ok ? 'text-green-600' : 'text-destructive'}`}>{status.text}</p>
      )}
    </div>
  )
}
