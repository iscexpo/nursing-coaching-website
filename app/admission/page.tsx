'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { SITE } from '@/lib/site-data'
import { Breadcrumb } from '@/components/breadcrumb'
import { Loader2 } from 'lucide-react'

interface CourseOption {
  slug: string
  title: string
  fee: number
}

type AdmissionStep = 1 | 2 | 3

export default function AdmissionPage() {
  const searchParams = useSearchParams()
  const [coursesList, setCoursesList] = useState<CourseOption[]>([])
  const [step, setStep] = useState<AdmissionStep>(1)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    course: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || []
        const activeCourses = list
          .filter((c: { isActive: boolean }) => c.isActive)
          .map((c: { slug: string; title: string; fee: number }) => ({ slug: c.slug, title: c.title, fee: c.fee }))

        setCoursesList(activeCourses)

        const defaultCourse = searchParams.get('course')
        if (defaultCourse && activeCourses.some((course: CourseOption) => course.slug === defaultCourse)) {
          setForm((current) => ({ ...current, course: defaultCourse }))
        }
      })
      .catch(() => {})
  }, [searchParams])

  const stepLabels = ['ব্যক্তিগত তথ্য', 'কোর্স নির্বাচন', 'সারাংশ']

  const hasStepOneValues = form.name.trim().length > 0 && form.phone.trim().length > 0
  const hasStepTwoValues = form.course.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          courseSlug: form.course,
          message: form.message || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।')
        return
      }

      setSubmitted(true)
    } catch {
      setError('নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (step === 1 && !hasStepOneValues) return
    if (step === 2 && !hasStepTwoValues) return
    setStep((current) => Math.min(current + 1, 3) as AdmissionStep)
  }

  function handlePrevious() {
    setStep((current) => Math.max(current - 1, 1) as AdmissionStep)
  }

  return (
    <>
      <SiteHeader />
      <main>
        <Breadcrumb items={[{ label: 'ভর্তি' }]} />
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              eyebrow="ভর্তি চলমান"
              title="এখনই ভর্তি হোন"
              description="কর্নিয়া নার্সিং কোচিং-এ ভর্তির জন্য এক সহজ অনলাইন ভর্তি উইজার্ড পূরণ করুন।"
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-4">
            {submitted ? (
              <div className="rounded-2xl border border-green/30 bg-green/5 p-8 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green/10">
                  <svg className="size-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  আপনার আবেদন গ্রহণ করা হয়েছে!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। ধন্যবাদ!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">ভর্তি উইজার্ড</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ধাপে ধাপে ভর্তি ফরম পূরণ করুন।
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {stepLabels.map((label, index) => (
                      <div key={label} className={`rounded-full border px-3 py-1 ${step === index + 1 ? 'border-brand bg-brand/10 text-foreground' : 'border-border bg-background'}`}>
                        {index + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground">পুরো নাম *</label>
                      <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="আপনার পুরো নাম লিখুন"
                        required
                        className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground">মোবাইল নম্বর *</label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="01XXXXXXXXX"
                        required
                        className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">আপনার আগ্রহী কোর্স নির্বাচন করুন *</p>
                      <select
                        id="course"
                        value={form.course}
                        onChange={(e) => setForm({ ...form, course: e.target.value })}
                        required
                        className="mt-3 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                      >
                        <option value="">কোর্স বাছাই করুন</option>
                        {coursesList.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.title} — ৳{c.fee.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">কোর্স সংক্ষিপ্ত</p>
                      <p className="mt-2">নির্বাচিত কোর্সের উপর ভিত্তি করে আমাদের টিম আপনার সাথে যোগাযোগ করবে।</p>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground">বার্তা (ঐচ্ছিক)</label>
                      <textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        rows={4}
                        placeholder="কোনো বিশেষ প্রশ্ন থাকলে লিখুন"
                        className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">আবেদনের সারাংশ</p>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="font-medium text-foreground">নাম</dt>
                          <dd>{form.name || '-'}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="font-medium text-foreground">মোবাইল</dt>
                          <dd>{form.phone || '-'}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="font-medium text-foreground">কোর্স</dt>
                          <dd>{coursesList.find((c) => c.slug === form.course)?.title || '-'}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="font-medium text-foreground">বার্তা</dt>
                          <dd>{form.message || 'কোনো বার্তা নেই'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={step === 1 || loading}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-border/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    পূর্ববর্তী
                  </button>
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={step === 1 ? !hasStepOneValues || loading : !hasStepTwoValues || loading}
                      className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90 disabled:opacity-50"
                    >
                      পরের ধাপ
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90 disabled:opacity-50"
                    >
                      {loading && <Loader2 className="size-4 animate-spin" />}
                      {loading ? 'জমা হচ্ছে...' : 'আবেদন সম্পন্ন করুন'}
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-foreground">সরাসরি যোগাযোগ</h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  ফোন: <a href={SITE.phoneHref} className="font-medium text-brand hover:underline">{SITE.phone}</a>
                </p>
                <p>
                  WhatsApp: <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">চ্যাট করুন</a>
                </p>
                <p>
                  ঠিকানা: {SITE.addressBn}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  )
}
