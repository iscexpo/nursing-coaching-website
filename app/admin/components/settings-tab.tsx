'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'

const initialState = {
  siteName: '',
  siteTagline: '',
  smsProvider: 'none',
  smsApiKey: '',
  smsSenderId: '',
  paymentGateway: 'none',
  paymentGatewayApiKey: '',
  paymentGatewaySecret: '',
  paymentGatewayWebhookSecret: '',
}

export function SettingsPanel({ onRefresh }: { onRefresh: () => void }) {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          setForm({
            siteName: data.siteName || '',
            siteTagline: data.siteTagline || '',
            smsProvider: data.smsProvider || 'none',
            smsApiKey: data.smsApiKey || '',
            smsSenderId: data.smsSenderId || '',
            paymentGateway: data.paymentGateway || 'none',
            paymentGatewayApiKey: data.paymentGatewayApiKey || '',
            paymentGatewaySecret: data.paymentGatewaySecret || '',
            paymentGatewayWebhookSecret: data.paymentGatewayWebhookSecret || '',
          })
        }
      } catch {
        setMessage('লোড করতে ব্যর্থ হয়েছে')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'সংরক্ষণ ব্যর্থ')
      }

      setMessage('সেটিংস সফলভাবে সংরক্ষিত হয়েছে')
      onRefresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'সংরক্ষণ ব্যর্থ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card p-6">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-heading text-lg font-bold text-foreground">সুপার অ্যাডমিন সেটিংস</h3>
        <p className="mt-1 text-sm text-muted-foreground">কনটেন্ট, SMS এবং পেমেন্ট গেটওয়ে কনফিগার করুন</p>
      </div>

      {message && (
        <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          {message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h4 className="font-heading font-semibold text-foreground">সাইট কনটেন্ট</h4>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">সাইটের নাম</label>
            <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">সাইটের ট্যাগলাইন</label>
            <input value={form.siteTagline} onChange={(e) => setForm({ ...form, siteTagline: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <h4 className="font-heading font-semibold text-foreground">SMS কনফিগারেশন</h4>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">প্রোভাইডার</label>
            <select value={form.smsProvider} onChange={(e) => setForm({ ...form, smsProvider: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="none">বন্ধ</option>
              <option value="bulk">BulkSMS</option>
              <option value="twilio">Twilio</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">API Key</label>
            <input value={form.smsApiKey} onChange={(e) => setForm({ ...form, smsApiKey: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Sender ID</label>
            <input value={form.smsSenderId} onChange={(e) => setForm({ ...form, smsSenderId: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 lg:col-span-2">
          <h4 className="font-heading font-semibold text-foreground">পেমেন্ট গেটওয়ে কনফিগারেশন</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">গেটওয়ে</label>
              <select value={form.paymentGateway} onChange={(e) => setForm({ ...form, paymentGateway: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="none">বন্ধ</option>
                <option value="sslcommerz">SSLCommerz</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">API Key</label>
              <input value={form.paymentGatewayApiKey} onChange={(e) => setForm({ ...form, paymentGatewayApiKey: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Secret</label>
              <input value={form.paymentGatewaySecret} onChange={(e) => setForm({ ...form, paymentGatewaySecret: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Webhook Secret</label>
              <input value={form.paymentGatewayWebhookSecret} onChange={(e) => setForm({ ...form, paymentGatewayWebhookSecret: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50">
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        সংরক্ষণ করুন
      </button>
    </div>
  )
}
