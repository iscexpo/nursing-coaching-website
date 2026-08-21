'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Save } from 'lucide-react'
import { defaultForm, defaultHero, defaultSite } from './types'
import type { FormState, SiteSettings } from './types'
import {
  SiteIdentitySection,
  ContactSection,
  SmsConfigSection,
  PaymentGatewaySection,
  HeroSection,
  WhyIscSection,
  CountersSection,
  FaqSection,
} from './sections'

export function SettingsPanel({ onRefresh }: { onRefresh: () => void }) {
  const t = useTranslations('admin.settings')
  const [form, setForm] = useState<FormState>(defaultForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [previousLogoUrl, setPreviousLogoUrl] = useState('')
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null)

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
            smsEmail: data.smsEmail || '',
            smsPassword: data.smsPassword || '',
            paymentGateway: data.paymentGateway || 'none',
            paymentGatewayApiKey: data.paymentGatewayApiKey || '',
            paymentGatewaySecret: data.paymentGatewaySecret || '',
            paymentGatewayWebhookSecret: data.paymentGatewayWebhookSecret || '',
            site: { ...defaultSite, ...(data.cmsContent?.site || {}) },
            hero: { ...defaultHero, ...(data.cmsContent?.hero || {}) },
            whyCornia: data.cmsContent?.whyCornia || [],
            counters: data.cmsContent?.counters || [],
            faqs: data.cmsContent?.faqs || [],
          })
        }
      } catch {
        setMessage(t('loadFailed'))
        setMessageType('error')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [t])

  function updateSite(field: keyof SiteSettings, value: string) {
    setForm((prev) => ({ ...prev, site: { ...prev.site, [field]: value } }))
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('altText', t('logoAlt'))

      const res = await fetch('/api/media', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || t('logoUploadFailed'))
      }

      const media = await res.json()

      // Store previous logo URL for rollback
      setPreviousLogoUrl(form.site.logo)
      setCurrentMediaId(media.id)

      updateSite('logo', media.url)
      setMessage(t('logoUploadSuccess'))
      setMessageType('success')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('logoUploadFailed'))
      setMessageType('error')
    } finally {
      setUploading(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: form.site.nameBn || form.siteName,
          siteTagline: form.site.tagline || form.siteTagline,
          smsProvider: form.smsProvider,
          smsApiKey: form.smsApiKey,
          smsSenderId: form.smsSenderId,
          smsEmail: form.smsEmail,
          smsPassword: form.smsPassword,
          paymentGateway: form.paymentGateway,
          paymentGatewayApiKey: form.paymentGatewayApiKey,
          paymentGatewaySecret: form.paymentGatewaySecret,
          paymentGatewayWebhookSecret: form.paymentGatewayWebhookSecret,
          cmsContent: {
            site: form.site,
            hero: form.hero,
            whyCornia: form.whyCornia,
            counters: form.counters,
            faqs: form.faqs,
          },
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))

        // Rollback: delete newly uploaded media if settings save failed
        if (currentMediaId) {
          try {
            await fetch(`/api/media/${currentMediaId}`, { method: 'DELETE' })
            updateSite('logo', previousLogoUrl)
          } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError)
          }
        }

        throw new Error(errorData.error || t('saveFailed'))
      }

      setMessage(t('settingsUpdated'))
      setMessageType('success')

      // Clear rollback state on successful save
      setPreviousLogoUrl('')
      setCurrentMediaId(null)

      onRefresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('saveFailed'))
      setMessageType('error')
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
        <h3 className="font-heading text-lg font-bold text-foreground">
          {t('siteSettings')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('siteSettingsDescription')}
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            messageType === 'success'
              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300'
              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SiteIdentitySection
          form={form}
          updateSite={updateSite}
          uploading={uploading}
          onLogoUpload={handleLogoUpload}
          logoInputRef={logoInputRef}
        />

        <ContactSection form={form} updateSite={updateSite} />

        <SmsConfigSection form={form} setForm={setForm} />

        <PaymentGatewaySection form={form} setForm={setForm} />
      </div>

      <HeroSection form={form} setForm={setForm} />

      <WhyIscSection form={form} setForm={setForm} />

      <CountersSection form={form} setForm={setForm} />

      <FaqSection form={form} setForm={setForm} />

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {t('saveSuccess')}
      </button>
    </div>
  )
}
