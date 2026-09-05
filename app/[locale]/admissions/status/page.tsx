'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { SectionHeading } from '@/components/section-heading'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/breadcrumb'
import { Loader2 } from 'lucide-react'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('880') && digits.length === 13) return `+${digits}`
  if (digits.startsWith('01') && digits.length === 11) return `+880${digits}`
  return raw.trim()
}

interface ApplicationStatus {
  id: string
  reference: string
  name: string
  phone: string
  message?: string | null
  status: string
  courseId: string
  courseTitle: string | null
  createdAt: string
  updatedAt: string
}

export default function AdmissionStatusPage() {
  const [reference, setReference] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<ApplicationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const t = useTranslations('admissionStatusPage')
  const tCommon = useTranslations('common')

  async function handleCheckStatus(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStatus(null)
    setLoading(true)

    try {
      const res = await fetch(
        `/api/admissions/status?reference=${encodeURIComponent(reference)}&phone=${encodeURIComponent(normalizePhone(phone))}`,
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'কোনো ফলাফল পাওয়া যায়নি।')
        return
      }
      setStatus(data.data)
    } catch {
      setError('নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <Breadcrumb
            items={[
              { label: tCommon('admission') },
              { label: 'আবেদনের স্ট্যাটাস' },
            ]}
          />
          <SectionHeading
            eyebrow={tCommon('admission')}
            title={t('title')}
            description={t('description')}
          />
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <form onSubmit={handleCheckStatus} className="space-y-5">
              <div>
                <label
                  htmlFor="reference"
                  className="block text-sm font-medium text-foreground"
                >
                  আবেদন রেফারেন্স *
                </label>
                <input
                  id="reference"
                  value={reference}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setReference(e.target.value)
                  }
                  placeholder="ADM-XXXXXXXX"
                  required
                  className="mt-2 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-foreground"
                >
                  {tCommon('phone')} *
                </label>
                <input
                  id="phone"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPhone(e.target.value)
                  }
                  placeholder="01XXXXXXXXX"
                  required
                  className="mt-2 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={loading || !reference || !phone}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'স্ট্যাটাস দেখুন'
                )}
              </Button>
            </form>
          </div>

          {status && (
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold text-foreground">
                আবেদনের তথ্য
              </h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-foreground">রেফারেন্স</p>
                    <p>{status.reference}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {tCommon('fullName')}
                    </p>
                    <p>{status.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {tCommon('phone')}
                    </p>
                    <p>{status.phone}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {tCommon('courses')}
                    </p>
                    <p>{status.courseTitle || 'কোর্স নেই'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">স্থিতি</p>
                    <p className="text-brand">{status.status}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">সর্বশেষ আপডেট</p>
                    <p>{new Date(status.updatedAt).toLocaleString('bn-BD')}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">আপনার বার্তা</p>
                  <p>{status.message || 'কোনো বার্তা নেই'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
