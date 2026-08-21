'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Loader2, Upload, X, Plus, GripVertical, Trash2 } from 'lucide-react'
import { Field, TextInput, inputClass, selectClass } from './ui'
import type { FormState, SiteSettings } from './types'

type SetForm = React.Dispatch<React.SetStateAction<FormState>>
type UpdateSite = (field: keyof SiteSettings, value: string) => void

export function SiteIdentitySection({
  form,
  updateSite,
  uploading,
  onLogoUpload,
  logoInputRef,
}: {
  form: FormState
  updateSite: UpdateSite
  uploading: boolean
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  logoInputRef: React.RefObject<HTMLInputElement | null>
}) {
  const t = useTranslations('admin.settings')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h4 className="font-heading font-semibold text-foreground">
        {t('siteIdentity')}
      </h4>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          {t('logoLabel')}
        </label>
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center">
            {form.site.logo ? (
              <Image
                src={form.site.logo}
                alt={t('logoAlt')}
                fill
                className="object-contain"
              />
            ) : (
              <span className="text-xs text-muted-foreground">নেই</span>
            )}
          </div>
          <div className="flex-1">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={onLogoUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => logoInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {uploading ? t('logoUploading') : t('logoUpload')}
            </button>
            {form.site.logo && (
              <button
                type="button"
                onClick={() => updateSite('logo', '')}
                className="ml-2 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              >
                <X className="size-3.5" />
                {t('logoRemove')}
              </button>
            )}
          </div>
        </div>
      </div>

      <Field label={t('siteNameBn')}>
        <TextInput
          value={form.site.nameBn}
          onChange={(v) => updateSite('nameBn', v)}
          placeholder="ISC Expo - Icon Skill & Career Expo"
        />
      </Field>

      <Field label={t('siteNameEn')}>
        <TextInput
          value={form.site.nameEn}
          onChange={(v) => updateSite('nameEn', v)}
          placeholder="ISC Expo - Icon Skill & Career Expo"
        />
      </Field>

      <Field label={t('tagline')}>
        <TextInput
          value={form.site.tagline}
          onChange={(v) => updateSite('tagline', v)}
          placeholder={t('taglinePlaceholder')}
        />
      </Field>

      <Field label={t('city')}>
        <TextInput
          value={form.site.city}
          onChange={(v) => updateSite('city', v)}
          placeholder={t('cityPlaceholder')}
        />
      </Field>

      <Field label={t('fullAddress')}>
        <textarea
          value={form.site.addressBn}
          onChange={(e) => updateSite('addressBn', e.target.value)}
          placeholder={t('fullAddressPlaceholder')}
          rows={2}
          className={inputClass + ' resize-none'}
        />
      </Field>
    </div>
  )
}

export function ContactSection({
  form,
  updateSite,
}: {
  form: FormState
  updateSite: UpdateSite
}) {
  const t = useTranslations('admin.settings')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h4 className="font-heading font-semibold text-foreground">
        {t('contactSection')}
      </h4>

      <Field label={t('phoneLabel')}>
        <TextInput
          value={form.site.phone}
          onChange={(v) => updateSite('phone', v)}
          placeholder={t('contactPhone')}
        />
      </Field>

      <Field label={t('phoneHrefLabel')}>
        <TextInput
          value={form.site.phoneHref}
          onChange={(v) => updateSite('phoneHref', v)}
          placeholder="tel:+8801784176442"
        />
      </Field>

      <Field label={t('emailLabel')}>
        <TextInput
          value={form.site.email}
          onChange={(v) => updateSite('email', v)}
          placeholder={t('contactEmail')}
        />
      </Field>

      <h4 className="font-heading font-semibold text-foreground pt-2">
        {t('socialLinks')}
      </h4>

      <Field label="WhatsApp">
        <TextInput
          value={form.site.whatsapp}
          onChange={(v) => updateSite('whatsapp', v)}
          placeholder="https://wa.me/8801784176442"
        />
      </Field>

      <Field label="Facebook">
        <TextInput
          value={form.site.facebook}
          onChange={(v) => updateSite('facebook', v)}
          placeholder="https://www.facebook.com/..."
        />
      </Field>

      <Field label="YouTube">
        <TextInput
          value={form.site.youtube}
          onChange={(v) => updateSite('youtube', v)}
          placeholder="https://youtube.com/@..."
        />
      </Field>

      <Field label="Messenger">
        <TextInput
          value={form.site.messenger}
          onChange={(v) => updateSite('messenger', v)}
          placeholder="https://m.me/..."
        />
      </Field>
    </div>
  )
}

export function SmsConfigSection({
  form,
  setForm,
}: {
  form: FormState
  setForm: SetForm
}) {
  const t = useTranslations('admin.settings')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h4 className="font-heading font-semibold text-foreground">
        {t('smsConfig')}
      </h4>
      <Field label={t('smsProvider')}>
        <select
          value={form.smsProvider}
          onChange={(e) => setForm({ ...form, smsProvider: e.target.value })}
          className={selectClass}
        >
          <option value="none">{t('smsOff')}</option>
          <option value="grameenphone">Grameenphone Bulk SMS</option>
          <option value="sasbulksms">SAS Bulk SMS</option>
          <option value="shiram">Shiram System SMS</option>
          <option value="twilio">Twilio</option>
        </select>
      </Field>
      {form.smsProvider === 'shiram' ? (
        <>
          <Field label={t('smsEmailLabel')}>
            <TextInput
              value={form.smsEmail}
              onChange={(v) => setForm({ ...form, smsEmail: v })}
              placeholder="example@shiramsystem.com"
            />
          </Field>
          <Field label={t('smsPasswordLabel')}>
            <input
              type="password"
              value={form.smsPassword}
              onChange={(e) => setForm({ ...form, smsPassword: e.target.value })}
              placeholder="Shiram API password (not login password)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
        </>
      ) : (
        <>
          <Field label={t('smsApiKeyLabel')}>
            <TextInput
              value={form.smsApiKey}
              onChange={(v) => setForm({ ...form, smsApiKey: v })}
            />
          </Field>
        </>
      )}
      <Field label={t('smsSenderIdLabel')}>
        <TextInput
          value={form.smsSenderId}
          onChange={(v) => setForm({ ...form, smsSenderId: v })}
          placeholder={form.smsProvider === 'shiram' ? 'Non-Masking' : ''}
        />
      </Field>
    </div>
  )
}

export function PaymentGatewaySection({
  form,
  setForm,
}: {
  form: FormState
  setForm: SetForm
}) {
  const t = useTranslations('admin.settings')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h4 className="font-heading font-semibold text-foreground">
        {t('paymentGateway')}
      </h4>
      <Field label={t('gatewayLabel')}>
        <select
          value={form.paymentGateway}
          onChange={(e) =>
            setForm({ ...form, paymentGateway: e.target.value })
          }
          className={selectClass}
        >
          <option value="none">{t('gatewayOff')}</option>
          <option value="sslcommerz">SSLCommerz</option>
          <option value="stripe">Stripe</option>
        </select>
      </Field>
      <Field label={t('apiKeyLabel')}>
        <TextInput
          value={form.paymentGatewayApiKey}
          onChange={(v) => setForm({ ...form, paymentGatewayApiKey: v })}
        />
      </Field>
      <Field label={t('secretLabel')}>
        <TextInput
          value={form.paymentGatewaySecret}
          onChange={(v) => setForm({ ...form, paymentGatewaySecret: v })}
        />
      </Field>
      <Field label={t('webhookSecretLabel')}>
        <TextInput
          value={form.paymentGatewayWebhookSecret}
          onChange={(v) =>
            setForm({ ...form, paymentGatewayWebhookSecret: v })
          }
        />
      </Field>
    </div>
  )
}

export function HeroSection({
  form,
  setForm,
}: {
  form: FormState
  setForm: SetForm
}) {
  const t = useTranslations('admin.settings')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div>
        <h4 className="font-heading font-semibold text-foreground">
          {t('heroSection')}
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('heroDescription')}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('heroEyebrow')}>
          <TextInput
            value={form.hero.eyebrow}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                hero: { ...prev.hero, eyebrow: v },
              }))
            }
            placeholder="BNMC ভর্তি পরীক্ষার সম্পূর্ণ প্রস্তুতি"
          />
        </Field>
        <Field label={t('heroTitle')}>
          <TextInput
            value={form.hero.title}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                hero: { ...prev.hero, title: v },
              }))
            }
            placeholder="খুলনার অন্যতম বিশ্বস্ত নার্সিং ভর্তি কোচিং"
          />
        </Field>
      </div>
      <Field label={t('heroDescriptionLabel')}>
        <textarea
          value={form.hero.subtitle}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              hero: { ...prev.hero, subtitle: e.target.value },
            }))
          }
          placeholder="অভিজ্ঞ শিক্ষক, আপডেটেড নোট..."
          rows={2}
          className={inputClass + ' resize-none'}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('heroPrimaryCta')}>
          <TextInput
            value={form.hero.primaryCta}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                hero: { ...prev.hero, primaryCta: v },
              }))
            }
            placeholder="ভর্তি হোন"
          />
        </Field>
        <Field label={t('heroSecondaryCta')}>
          <TextInput
            value={form.hero.secondaryCta}
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                hero: { ...prev.hero, secondaryCta: v },
              }))
            }
            placeholder="ফ্রি ক্লাস"
          />
        </Field>
      </div>
    </div>
  )
}

export function WhyIscSection({
  form,
  setForm,
}: {
  form: FormState
  setForm: SetForm
}) {
  const t = useTranslations('admin.settings')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-heading font-semibold text-foreground">
            {t('whyIscSection')}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('whyIscDescription')}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              whyCornia: [...prev.whyCornia, { title: '', description: '' }],
            }))
          }
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
        >
          <Plus className="size-4" /> {t('addNew')}
        </button>
      </div>

      {form.whyCornia.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {t('whyIscEmpty')}
        </p>
      )}

      <div className="space-y-3">
        {form.whyCornia.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {t('whyIscCard')} {index + 1}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => {
                        const arr = [...prev.whyCornia]
                        ;[arr[index - 1], arr[index]] = [
                          arr[index],
                          arr[index - 1],
                        ]
                        return { ...prev, whyCornia: arr }
                      })
                    }
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                    title={t('moveUp')}
                  >
                    <svg
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                )}
                {index < form.whyCornia.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => {
                        const arr = [...prev.whyCornia]
                        ;[arr[index], arr[index + 1]] = [
                          arr[index + 1],
                          arr[index],
                        ]
                        return { ...prev, whyCornia: arr }
                      })
                    }
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                    title={t('moveDown')}
                  >
                    <svg
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      whyCornia: prev.whyCornia.filter((_, i) => i !== index),
                    }))
                  }
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {t('whyIscTitleLabel')}
              </label>
              <input
                type="text"
                value={item.title}
                onChange={(e) =>
                  setForm((prev) => {
                    const arr = [...prev.whyCornia]
                    arr[index] = { ...arr[index], title: e.target.value }
                    return { ...prev, whyCornia: arr }
                  })
                }
                placeholder={t('whyIscTitlePlaceholder')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {t('whyIscDescLabel')}
              </label>
              <textarea
                value={item.description}
                onChange={(e) =>
                  setForm((prev) => {
                    const arr = [...prev.whyCornia]
                    arr[index] = {
                      ...arr[index],
                      description: e.target.value,
                    }
                    return { ...prev, whyCornia: arr }
                  })
                }
                placeholder={t('whyIscDescPlaceholder')}
                rows={2}
                className={inputClass + ' resize-none'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CountersSection({
  form,
  setForm,
}: {
  form: FormState
  setForm: SetForm
}) {
  const t = useTranslations('admin.settings')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-heading font-semibold text-foreground">
            {t('counterSection')}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('counterDescription')}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              counters: [...prev.counters, { value: '', label: '' }],
            }))
          }
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
        >
          <Plus className="size-4" /> {t('addNew')}
        </button>
      </div>

      {form.counters.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {t('counterEmpty')}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {form.counters.map((counter, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {t('counterItem')} {index + 1}
              </span>
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => {
                        const arr = [...prev.counters]
                        ;[arr[index - 1], arr[index]] = [
                          arr[index],
                          arr[index - 1],
                        ]
                        return { ...prev, counters: arr }
                      })
                    }
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                    title={t('moveUp')}
                  >
                    <svg
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                )}
                {index < form.counters.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => {
                        const arr = [...prev.counters]
                        ;[arr[index], arr[index + 1]] = [
                          arr[index + 1],
                          arr[index],
                        ]
                        return { ...prev, counters: arr }
                      })
                    }
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                    title={t('moveDown')}
                  >
                    <svg
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      counters: prev.counters.filter((_, i) => i !== index),
                    }))
                  }
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {t('counterValueLabel')}
                </label>
                <input
                  type="text"
                  value={counter.value}
                  onChange={(e) =>
                    setForm((prev) => {
                      const arr = [...prev.counters]
                      arr[index] = { ...arr[index], value: e.target.value }
                      return { ...prev, counters: arr }
                    })
                  }
                  placeholder={t('counterValuePlaceholder')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {t('counterLabelLabel')}
                </label>
                <input
                  type="text"
                  value={counter.label}
                  onChange={(e) =>
                    setForm((prev) => {
                      const arr = [...prev.counters]
                      arr[index] = { ...arr[index], label: e.target.value }
                      return { ...prev, counters: arr }
                    })
                  }
                  placeholder={t('counterLabelPlaceholder')}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FaqSection({
  form,
  setForm,
}: {
  form: FormState
  setForm: SetForm
}) {
  const t = useTranslations('admin.settings')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-heading font-semibold text-foreground">
            {t('faqSection')}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('faqDescription')}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              faqs: [...prev.faqs, { question: '', answer: '' }],
            }))
          }
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 transition-colors"
        >
          <Plus className="size-4" /> {t('addNew')}
        </button>
      </div>

      {form.faqs.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {t('faqEmpty')}
        </p>
      )}

      <div className="space-y-3">
        {form.faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {t('faqQuestion')} {index + 1}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => {
                        const faqs = [...prev.faqs]
                        ;[faqs[index - 1], faqs[index]] = [
                          faqs[index],
                          faqs[index - 1],
                        ]
                        return { ...prev, faqs }
                      })
                    }
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                    title={t('moveUp')}
                  >
                    <svg
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                )}
                {index < form.faqs.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => {
                        const faqs = [...prev.faqs]
                        ;[faqs[index], faqs[index + 1]] = [
                          faqs[index + 1],
                          faqs[index],
                        ]
                        return { ...prev, faqs }
                      })
                    }
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                    title={t('moveDown')}
                  >
                    <svg
                      className="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      faqs: prev.faqs.filter((_, i) => i !== index),
                    }))
                  }
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {t('faqQuestionLabel')}
              </label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) =>
                  setForm((prev) => {
                    const faqs = [...prev.faqs]
                    faqs[index] = { ...faqs[index], question: e.target.value }
                    return { ...prev, faqs }
                  })
                }
                placeholder={t('faqQuestionPlaceholder')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {t('faqAnswerLabel')}
              </label>
              <textarea
                value={faq.answer}
                onChange={(e) =>
                  setForm((prev) => {
                    const faqs = [...prev.faqs]
                    faqs[index] = { ...faqs[index], answer: e.target.value }
                    return { ...prev, faqs }
                  })
                }
                placeholder={t('faqAnswerPlaceholder')}
                rows={3}
                className={inputClass + ' resize-none'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}