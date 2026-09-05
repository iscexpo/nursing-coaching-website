'use client'

import { useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { useSiteData } from '@/hooks/use-site-data'
import { Breadcrumb } from '@/components/breadcrumb'
import { MapPin, Phone, Mail, MessageCircle, Loader2 } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const site = useSiteData()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const infoItems = [
    { icon: MapPin, label: 'Address', value: site.addressBn },
    { icon: Phone, label: 'Phone', value: site.phone, href: site.phoneHref },
    {
      icon: Mail,
      label: 'Email',
      value: site.email,
      href: `mailto:${site.email}`,
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: 'Chat Now',
      href: site.whatsapp,
    },
  ]

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Breadcrumb items={[{ label: 'Contact' }]} />
            <SectionHeading
              eyebrow="Contact"
              title="Contact Us"
              description="Get in touch with us for any questions or information."
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {infoItems.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                        <item.icon className="size-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={
                              item.href.startsWith('http')
                                ? '_blank'
                                : undefined
                            }
                            rel={
                              item.href.startsWith('http')
                                ? 'noopener noreferrer'
                                : undefined
                            }
                            className="text-sm text-muted-foreground hover:text-brand"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h4 className="font-heading text-sm font-semibold text-foreground">
                    Office Hours
                  </h4>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>Sat—Thu: 9:00 AM — 8:00 PM</p>
                    <p>Friday: Closed</p>
                  </div>
                </div>
              </div>

              <div>
                {submitted ? (
                  <div className="rounded-2xl border border-green/30 bg-green/5 p-8 text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green/10">
                      <svg
                        className="size-8 text-green"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground">
                      Message Sent!
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We will contact you soon.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Send a Message
                    </h3>

                    {error && (
                      <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="c-name"
                        className="block text-sm font-medium text-foreground"
                      >
                        Name
                      </label>
                      <input
                        id="c-name"
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Your name"
                        required
                        className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="c-phone"
                        className="block text-sm font-medium text-foreground"
                      >
                        Phone Number
                      </label>
                      <input
                        id="c-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="01XXXXXXXXX"
                        required
                        className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="c-msg"
                        className="block text-sm font-medium text-foreground"
                      >
                        Message
                      </label>
                      <textarea
                        id="c-msg"
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        rows={4}
                        placeholder="Write your message"
                        required
                        className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
                    >
                      {loading && <Loader2 className="size-4 animate-spin" />}
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
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
