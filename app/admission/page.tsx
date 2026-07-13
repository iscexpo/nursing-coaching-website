'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { SITE } from '@/lib/site-data'
import { Breadcrumb } from '@/components/breadcrumb'
import { FadeIn } from '@/components/ui/fade-in'
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft, User, BookOpen, FileText } from 'lucide-react'

interface CourseOption {
  slug: string
  title: string
  fee: number
}

type AdmissionStep = 1 | 2 | 3

const STEP_ICONS = [User, BookOpen, FileText]

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
            <FadeIn>
              <SectionHeading
                eyebrow="ভর্তি চলমান"
                title="এখনই ভর্তি হোন"
                description="কর্নিয়া নার্সিং কোচিং-এ ভর্তির জন্য এক সহজ অনলাইন ভর্তি উইজার্ড পূরণ করুন।"
              />
            </FadeIn>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-4">
            {submitted ? (
              <FadeIn>
                <div className="rounded-3xl border border-green/30 bg-green/5 p-10 text-center shadow-lg shadow-green/5">
                  <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green/10 animate-scale-in">
                    <CheckCircle2 className="size-10 text-green" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-foreground">
                    আপনার আবেদন গ্রহণ করা হয়েছে!
                  </h3>
                  <p className="mt-3 text-muted-foreground">
                    আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। ধন্যবাদ!
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green/10 px-4 py-2 text-sm font-medium text-green">
                    <span className="size-2 rounded-full bg-green animate-pulse" />
                    আবেদন প্রক্রিয়া চলছে
                  </div>
                </div>
              </FadeIn>
            ) : (
              <FadeIn>
                <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                  {/* Step indicator */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      {stepLabels.map((label, index) => {
                        const StepIcon = STEP_ICONS[index]
                        const isCompleted = step > index + 1
                        const isCurrent = step === index + 1
                        return (
                          <div key={label} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex size-12 items-center justify-center rounded-2xl border-2 transition-all duration-500 ${
                                  isCompleted
                                    ? 'border-green bg-green text-green-foreground scale-100'
                                    : isCurrent
                                      ? 'border-brand bg-brand text-brand-foreground scale-110 shadow-lg shadow-brand/20'
                                      : 'border-border bg-background text-muted-foreground'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="size-5" />
                                ) : (
                                  <StepIcon className="size-5" />
                                )}
                              </div>
                              <span className={`mt-2 text-xs font-medium transition-colors ${
                                isCurrent ? 'text-brand' : isCompleted ? 'text-green' : 'text-muted-foreground'
                              }`}>
                                {label}
                              </span>
                            </div>
                            {index < 2 && (
                              <div className={`mx-3 h-0.5 flex-1 rounded-full transition-all duration-500 ${
                                isCompleted ? 'bg-green' : isCurrent ? 'bg-brand/30' : 'bg-border'
                              }`} style={{ marginTop: '-1.5rem' }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive animate-fade-in">
                      {error}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground">পুরো নাম *</label>
                        <input
                          id="name"
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="আপনার পুরো নাম লিখুন"
                          required
                          className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                          className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      <div>
                        <p className="text-sm font-medium text-foreground">আপনার আগ্রহী কোর্স নির্বাচন করুন *</p>
                        <select
                          id="course"
                          value={form.course}
                          onChange={(e) => setForm({ ...form, course: e.target.value })}
                          required
                          className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        >
                          <option value="">কোর্স বাছাই করুন</option>
                          {coursesList.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.title} — ৳{c.fee.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">কোর্স সংক্ষিপ্ত</p>
                        <p className="mt-2">নির্বাচিত কোর্সের উপর ভিত্তি করে আমাদের টিম আপনার সাথে যোগাযোগ করবে।</p>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5 animate-fade-in">
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-foreground">বার্তা (ঐচ্ছিক)</label>
                        <textarea
                          id="message"
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          rows={4}
                          placeholder="কোনো বিশেষ প্রশ্ন থাকলে লিখুন"
                          className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                      <div className="rounded-2xl border border-border bg-secondary/30 p-5">
                        <p className="font-medium text-foreground">আবেদনের সারাংশ</p>
                        <dl className="mt-4 space-y-3 text-sm">
                          <div className="flex justify-between gap-4 rounded-lg bg-background/50 px-3 py-2">
                            <dt className="font-medium text-foreground">নাম</dt>
                            <dd className="text-muted-foreground">{form.name || '-'}</dd>
                          </div>
                          <div className="flex justify-between gap-4 rounded-lg bg-background/50 px-3 py-2">
                            <dt className="font-medium text-foreground">মোবাইল</dt>
                            <dd className="text-muted-foreground">{form.phone || '-'}</dd>
                          </div>
                          <div className="flex justify-between gap-4 rounded-lg bg-background/50 px-3 py-2">
                            <dt className="font-medium text-foreground">কোর্স</dt>
                            <dd className="text-muted-foreground">{coursesList.find((c) => c.slug === form.course)?.title || '-'}</dd>
                          </div>
                          <div className="flex justify-between gap-4 rounded-lg bg-background/50 px-3 py-2">
                            <dt className="font-medium text-foreground">বার্তা</dt>
                            <dd className="text-muted-foreground">{form.message || 'কোনো বার্তা নেই'}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={step === 1 || loading}
                      className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ArrowLeft className="size-4" />
                      পূর্ববর্তী
                    </button>
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={step === 1 ? !hasStepOneValues || loading : !hasStepTwoValues || loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                      >
                        পরের ধাপ
                        <ArrowRight className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-green-foreground transition-all hover:bg-green/90 hover:shadow-lg hover:shadow-green/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                      >
                        {loading && <Loader2 className="size-4 animate-spin" />}
                        {loading ? 'জমা হচ্ছে...' : 'আবেদন সম্পন্ন করুন'}
                        {!loading && <CheckCircle2 className="size-4" />}
                      </button>
                    )}
                  </div>
                </form>
              </FadeIn>
            )}

            <FadeIn delay={200}>
              <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
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
            </FadeIn>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  )
}
