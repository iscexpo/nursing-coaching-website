import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { SITE } from '@/lib/site-data'
import { Breadcrumb } from '@/components/breadcrumb'
import { CalendarDays, Clock, Users, FileCheck } from 'lucide-react'
import { db } from '@/lib/db'
import { exams } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export const metadata = {
  title: 'মডেল টেস্ট | কর্নিয়া নার্সিং কোচিং',
  description: 'কর্নিয়া নার্সিং কোচিং-এর সাপ্তাহিক মডেল টেস্টে অংশ নিন। BNMC ভর্তি পরীক্ষার প্রস্তুতি নিন।',
  alternates: { canonical: '/model-test' },
}

const FALLBACK_SCHEDULES = [
  {
    day: 'শুক্রবার',
    time: 'সকাল ১০:০০টা',
    topic: 'সাধারণ জ্ঞান ও বিজ্ঞান',
    seats: '২০ জন',
  },
  {
    day: 'শনিবার',
    time: 'বিকাল ৩:০০টা',
    topic: 'বাংলা ও ইংরেজি',
    seats: '২০ জন',
  },
]

const FEATURES = [
  { icon: FileCheck, label: 'MCQ ভিত্তিক পরীক্ষা', desc: 'BNMC প্যাটার্ন অনুযায়ী ১০০ টি প্রশ্ন' },
  { icon: Clock, label: '৬০ মিনিট সময়', desc: 'বাস্তব পরীক্ষার পরিবেশে পরীক্ষা' },
  { icon: Users, label: 'সীমিত আসন', desc: 'প্রতিটি ব্যাচে মাত্র ২০ জন' },
  { icon: CalendarDays, label: 'সাপ্তাহিক পরীক্ষা', desc: 'প্রতি সপ্তাহে দুইবার মডেল টেস্ট' },
]

export default async function ModelTestPage() {
  const activeExams = await db
    .select()
    .from(exams)
    .where(eq(exams.isActive, true))
    .orderBy(desc(exams.createdAt))

  const schedules = activeExams.length > 0
    ? activeExams.map((exam) => ({
        day: exam.subject,
        time: `${exam.duration} মিনিট`,
        topic: exam.title,
        difficulty: exam.difficulty,
      }))
    : FALLBACK_SCHEDULES

  return (
    <>
      <SiteHeader />
      <main>
        <Breadcrumb items={[{ label: 'মডেল টেস্ট' }]} />
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              eyebrow="মডেল টেস্ট"
              title="সাপ্তাহিক মডেল টেস্ট"
              description="BNMC ভর্তি পরীক্ষার আদলে আমাদের সাপ্তাহিক মডেল টেস্টে অংশ নিন এবং নিজেকে যাচাই করুন।"
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.label} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <f.icon className="size-8 text-brand" />
                  <h3 className="mt-3 font-heading font-semibold text-foreground">{f.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-secondary/30 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-center font-heading text-2xl font-bold text-foreground">
              পরীক্ষার সময়সূচি
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {schedules.map((s) => (
                <div key={s.day} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-bold text-brand">
                      {s.day}
                    </span>
                    <span className="text-sm text-muted-foreground">{s.time}</span>
                  </div>
                  <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
                    {s.topic}
                  </h3>
                  {'difficulty' in s && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      কঠিনতা: {s.difficulty === 'easy' ? 'সহজ' : s.difficulty === 'hard' ? 'কঠিন' : 'মাঝারি'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              মডেল টেস্টে যোগ দিন
            </h2>
            <p className="mt-3 text-muted-foreground">
              মডেল টেস্টে অংশ নিতে আমাদের অফিসে এসে নিবন্ধন করুন অথবা WhatsApp-এ যোগাযোগ করুন।
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-green px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green/90"
              >
                WhatsApp-এ যোগাযোগ
              </a>
              <a
                href={SITE.phoneHref}
                className="rounded-lg border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                ফোনে কল করুন
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  )
}
