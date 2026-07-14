'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { useSiteData } from '@/hooks/use-site-data'
import { Breadcrumb } from '@/components/breadcrumb'
import { FadeIn } from '@/components/ui/fade-in'
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft, User, BookOpen, GraduationCap, FileText } from 'lucide-react'

interface CourseOption {
  slug: string
  title: string
  fee: number
}

type EducationField = { result: string; institution: string; year: string; roll: string; registrationNo: string; board: string }

function emptyEducation(): EducationField {
  return { result: '', institution: '', year: '', roll: '', registrationNo: '', board: '' }
}

type AdmissionStep = 1 | 2 | 3 | 4

const STEP_ICONS = [User, GraduationCap, BookOpen, FileText]
const BOARDS = ['বোর্ড নির্বাচন করুন', 'ঢাকা বোর্ড', 'রাজশাহী বোর্ড', 'চট্টগ্রাম বোর্ড', 'খুলনা বোর্ড', 'বরিশাল বোর্ড', 'সিলেট বোর্ড', 'রংপুর বোর্ড', 'ময়মনসিংহ বোর্ড', 'দিনাজপুর বোর্ড', 'কুমিল্লা বোর্ড']

const inputCls = "mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
const smallInputCls = "mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"

function EduFields({ label, value, onChange }: { label: string; value: EducationField; onChange: (v: EducationField) => void }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">ফলাফল</label>
          <input type="text" value={value.result} onChange={(e) => onChange({ ...value, result: e.target.value })} placeholder="যেমন: GPA 5.00" className={smallInputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">প্রতিষ্ঠান</label>
          <input type="text" value={value.institution} onChange={(e) => onChange({ ...value, institution: e.target.value })} placeholder="কলেজ/বিশ্ববিদ্যালয়" className={smallInputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">সাল</label>
          <input type="text" value={value.year} onChange={(e) => onChange({ ...value, year: e.target.value })} placeholder="যেমন: 2020" className={smallInputCls} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">রোল নম্বর</label>
          <input type="text" value={value.roll} onChange={(e) => onChange({ ...value, roll: e.target.value })} placeholder="রোল নম্বর" className={smallInputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">রেজিস্ট্রেশন নম্বর</label>
          <input type="text" value={value.registrationNo} onChange={(e) => onChange({ ...value, registrationNo: e.target.value })} placeholder="রেজিস্ট্রেশন নম্বর" className={smallInputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground">বোর্ড</label>
          <select value={value.board} onChange={(e) => onChange({ ...value, board: e.target.value })} className={smallInputCls}>
            {BOARDS.map((b, i) => <option key={b} value={i === 0 ? '' : b}>{b}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

export default function AdmissionPage() {
  const searchParams = useSearchParams()
  const site = useSiteData()
  const [coursesList, setCoursesList] = useState<CourseOption[]>([])
  const [step, setStep] = useState<AdmissionStep>(1)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    course: '',
    message: '',
    ssc: emptyEducation(),
    hsc: emptyEducation(),
    honors: emptyEducation(),
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

  const stepLabels = ['ব্যক্তিগত তথ্য', 'শিক্ষাগত যোগ্যতা', 'কোর্স নির্বাচন', 'সারাংশ']

  const hasStepOneValues = form.name.trim().length > 0 && form.phone.trim().length > 0
  const hasStepTwoValues = true
  const hasStepThreeValues = form.course.length > 0

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
          ssc: form.ssc.roll || form.ssc.registrationNo ? form.ssc : undefined,
          hsc: form.hsc.roll || form.hsc.registrationNo ? form.hsc : undefined,
          honors: form.honors.roll || form.honors.registrationNo ? form.honors : undefined,
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
    if (step === 3 && !hasStepThreeValues) return
    setStep((current) => Math.min(current + 1, 4) as AdmissionStep)
  }

  function handlePrevious() {
    setStep((current) => Math.max(current - 1, 1) as AdmissionStep)
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Breadcrumb items={[{ label: 'ভর্তি' }]} />
            <FadeIn>
              <SectionHeading
                eyebrow="ভর্তি চলমান"
                title="এখনই ভর্তি হোন"
                description="ISC Expo - Icon Skill & Career Expo-এ ভর্তির জন্য এক সহজ অনলাইন ভর্তি উইজার্ড পূরণ করুন।"
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
                            {index < 3 && (
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
                        <p className="text-sm font-medium text-foreground mb-1">শিক্ষাগত যোগ্যতা (ঐচ্ছিক)</p>
                        <p className="text-xs text-muted-foreground mb-4">আপনার SSC, HSC এবং অনার্স তথ্য প্রদান করুন।</p>
                      </div>
                      <EduFields label="SSC (মাধ্যমিক সার্টিফিকেট)" value={form.ssc} onChange={(ssc) => setForm({ ...form, ssc })} />
                      <EduFields label="HSC (উচ্চ মাধ্যমিক সার্টিফিকেট) (ঐচ্ছিক)" value={form.hsc} onChange={(hsc) => setForm({ ...form, hsc })} />
                      <EduFields label="অনার্স (স্নাতক) (ঐচ্ছিক)" value={form.honors} onChange={(honors) => setForm({ ...form, honors })} />
                    </div>
                  )}

                  {step === 3 && (
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

                  {step === 4 && (
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
                          {form.ssc.roll && (
                            <div className="flex justify-between gap-4 rounded-lg bg-background/50 px-3 py-2">
                              <dt className="font-medium text-foreground">SSC</dt>
                              <dd className="text-muted-foreground text-right">রোল: {form.ssc.roll}, রেজি: {form.ssc.registrationNo}, বোর্ড: {form.ssc.board || '-'}</dd>
                            </div>
                          )}
                          {form.hsc.roll && (
                            <div className="flex justify-between gap-4 rounded-lg bg-background/50 px-3 py-2">
                              <dt className="font-medium text-foreground">HSC</dt>
                              <dd className="text-muted-foreground text-right">রোল: {form.hsc.roll}, রেজি: {form.hsc.registrationNo}, বোর্ড: {form.hsc.board || '-'}</dd>
                            </div>
                          )}
                          {form.honors.roll && (
                            <div className="flex justify-between gap-4 rounded-lg bg-background/50 px-3 py-2">
                              <dt className="font-medium text-foreground">অনার্স</dt>
                              <dd className="text-muted-foreground text-right">রোল: {form.honors.roll}, রেজি: {form.honors.registrationNo}, বোর্ড: {form.honors.board || '-'}</dd>
                            </div>
                          )}
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
                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={(step === 1 ? !hasStepOneValues : step === 3 ? !hasStepThreeValues : false) || loading}
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
                    ফোন: <a href={site.phoneHref} className="font-medium text-brand hover:underline">{site.phone}</a>
                  </p>
                  <p>
                    WhatsApp: <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">চ্যাট করুন</a>
                  </p>
                  <p>
                    ঠিকানা: {site.addressBn}
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
