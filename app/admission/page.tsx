'use client'

import { useState, useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { SITE } from '@/lib/site-data'
import { Loader2 } from 'lucide-react'

interface CourseOption {
  slug: string
  title: string
  fee: number
}

export default function AdmissionPage() {
  const [coursesList, setCoursesList] = useState<CourseOption[]>([])
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
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data || []
        setCoursesList(list.filter((c: { isActive: boolean }) => c.isActive).map((c: { slug: string; title: string; fee: number }) => ({ slug: c.slug, title: c.title, fee: c.fee })))
      })
      .catch(() => {})
  }, [])

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

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              eyebrow="ভর্তি চলমান"
              title="এখনই ভর্তি হোন"
              description="কর্নিয়া নার্সিং কোচিং-এ ভর্তির জন্য নিচের ফরম পূরণ করুন অথবা সরাসরি যোগাযোগ করুন।"
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
                <h3 className="font-heading text-lg font-bold text-foreground">
                  ভর্তি ফরম
                </h3>

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    পুরো নাম *
                  </label>
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
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                    মোবাইল নম্বর *
                  </label>
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

                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-foreground">
                    কোর্স নির্বাচন *
                  </label>
                  <select
                    id="course"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="">কোর্স বাছাই করুন</option>
                    {coursesList.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title} — ৳{c.fee.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground">
                    বার্তা (ঐচ্ছিক)
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    placeholder="কোনো বিশেষ প্রশ্ন থাকলে লিখুন"
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {loading ? 'জমা হচ্ছে...' : 'আবেদন জমা দিন'}
                </button>
              </form>
            )}

            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-foreground">
                সরাসরি যোগাযোগ
              </h3>
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
