'use client'

import { Download, AlertCircle } from 'lucide-react'
import { useSiteData } from '@/hooks/use-site-data'
import type { Enrollment, AdmitCard } from './types'

export function AdmitCardSection({
  user,
  enrollments,
  admitCards,
}: {
  user: { name: string; phoneNumber?: string | null; studentId?: string | null }
  enrollments: Enrollment[]
  admitCards: AdmitCard[]
}) {
  const site = useSiteData()
  const activeEnrollment = enrollments.find(
    (e) => e.status === 'active' || e.status === 'approved',
  )
  const admitCard = admitCards[0]

  if (!admitCard) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h3 className="font-heading text-lg font-bold text-foreground">
            এডমিট কার্ড পাওয়া যায়নি
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            আপনার জন্য কোনো এডমিট কার্ড তৈরি করা হয়নি। অ্যাডমিনের সাথে যোগাযোগ
            করুন।
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="bg-brand p-4 text-center text-brand-foreground">
          <h3 className="font-heading text-lg font-bold">{site.nameBn}</h3>
          <p className="text-xs opacity-80">নার্সিং ভর্তি কোচিং, {site.city}</p>
        </div>

        <div className="p-6">
          <h4 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            পরীক্ষার্থীর এডমিট কার্ড
          </h4>

          <div className="space-y-3 rounded-xl border border-border bg-secondary/30 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">নাম</span>
              <span className="font-semibold text-foreground">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">শিক্ষার্থী ID</span>
              <span className="font-semibold text-foreground">
                {user.studentId || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ফোন</span>
              <span className="font-semibold text-foreground">
                {user.phoneNumber || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">কোর্স</span>
              <span className="font-semibold text-foreground">
                {activeEnrollment?.courseTitle || 'নার্সিং অ্যাডমিশন কোচিং'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">পরীক্ষা</span>
              <span className="font-semibold text-foreground">
                {admitCard.examName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">তারিখ</span>
              <span className="font-semibold text-foreground">
                {admitCard.examDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">সময়</span>
              <span className="font-semibold text-foreground">
                {admitCard.examTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">কেন্দ্র</span>
              <span className="font-semibold text-foreground">
                {admitCard.center}
              </span>
            </div>
            {admitCard.seatNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">সিট নম্বর</span>
                <span className="font-semibold text-foreground">
                  {admitCard.seatNumber}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            <AlertCircle className="mx-auto mb-1 size-4" />
            পরীক্ষার দিন এডমিট কার্ড ও জাতীয় পরিচয়পত্র সাথে আনতে হবে।
          </div>
        </div>

        <div className="border-t border-border bg-secondary/20 px-6 py-3 text-center text-xs text-muted-foreground">
          {site.nameBn} · {site.phone}
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 print:hidden"
      >
        <Download className="size-4" />
        ডাউনলোড করুন
      </button>
    </div>
  )
}
