import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { SITE } from '@/lib/site-data'
import { Breadcrumb } from '@/components/breadcrumb'
import { CalendarDays, Clock, Users, FileCheck, BookOpen, Play, Filter } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'মডেল টেস্ট | ISC - Icon Skill & Career Expo',
  description: 'ISC - Icon Skill & Career Expo-এর সাপ্তাহিক মডেল টেস্টে অংশ নিন। BNMC ভর্তি পরীক্ষার প্রস্তুতি নিন।',
  alternates: { canonical: '/model-test' },
}

const FEATURES = [
  { icon: FileCheck, label: 'MCQ ভিত্তিক পরীক্ষা', desc: 'BNMC প্যাটার্ন অনুযায়ী প্রশ্ন' },
  { icon: Clock, label: 'টাইমড পরীক্ষা', desc: 'বাস্তব পরীক্ষার পরিবেশে পরীক্ষা' },
  { icon: Users, label: 'তাৎক্ষণিক ফলাফল', desc: 'সাবমিট করার সাথে সাথে ফলাফল' },
  { icon: CalendarDays, label: 'সাপ্তাহিক আপডেট', desc: 'নিয়মিত নতুন পরীক্ষা যোগ হয়' },
]

const DIFFICULTY_LABEL: Record<string, { label: string; cls: string }> = {
  easy: { label: 'সহজ', cls: 'bg-green/10 text-green' },
  medium: { label: 'মাঝারি', cls: 'bg-brand/10 text-brand' },
  hard: { label: 'কঠিন', cls: 'bg-destructive/10 text-destructive' },
}

type ExamRow = {
  id: string
  title: string
  subject: string
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  isActive: boolean
  createdAt: Date
  questionCount: number
}

async function getExams(): Promise<ExamRow[]> {
  try {
    const { db } = await import('@/lib/db')
    const { exams, questions } = await import('@/lib/db/schema')
    const { eq, desc, count } = await import('drizzle-orm')

    const data = await db
      .select({
        id: exams.id,
        title: exams.title,
        subject: exams.subject,
        duration: exams.duration,
        difficulty: exams.difficulty,
        isActive: exams.isActive,
        createdAt: exams.createdAt,
        questionCount: count(questions.id),
      })
      .from(exams)
      .leftJoin(questions, eq(exams.id, questions.examId))
      .where(eq(exams.isActive, true))
      .groupBy(exams.id, exams.title, exams.subject, exams.duration, exams.difficulty, exams.isActive, exams.createdAt)
      .orderBy(desc(exams.createdAt))

    return data
  } catch {
    return []
  }
}

export default async function ModelTestPage() {
  const exams = await getExams()

  const subjects = [...new Set(exams.map((e) => e.subject))]
  const subjectGroups = subjects.map((s) => ({
    subject: s,
    exams: exams.filter((e) => e.subject === s),
  }))

  return (
    <>
      <SiteHeader />
      <main>
        <Breadcrumb items={[{ label: 'মডেল টেস্ট' }]} />

        {/* Hero */}
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              eyebrow="মডেল টেস্ট"
              title="সাপ্তাহিক মডেল টেস্ট"
              description="BNMC ভর্তি পরীক্ষার আদলে আমাদের সাপ্তাহিক মডেল টেস্টে অংশ নিন এবং নিজেকে যাচাই করুন।"
            />
          </div>
        </section>

        {/* Features */}
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

        {/* Exam listings */}
        <section className="bg-secondary/30 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-center font-heading text-2xl font-bold text-foreground">
              উপলব্ধ পরীক্ষাসমূহ
            </h2>

            {exams.length === 0 ? (
              <FadeIn>
                <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
                  <BookOpen className="mx-auto size-12 text-muted-foreground" />
                  <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
                    কোনো পরীক্ষা পাওয়া যায়নি
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    শীঘ্রই নতুন পরীক্ষা যোগ করা হবে। আমাদের WhatsApp-এ যোগাযোগ করুন।
                  </p>
                  <a
                    href={SITE.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green/90"
                  >
                    WhatsApp-এ যোগাযোগ
                  </a>
                </div>
              </FadeIn>
            ) : (
              <div className="space-y-10">
                {subjectGroups.map((group) => (
                  <FadeIn key={group.subject}>
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-bold text-brand">
                          {group.subject}
                        </span>
                        <span className="text-xs text-muted-foreground">{group.exams.length} টি পরীক্ষা</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {group.exams.map((exam) => {
                          const diff = DIFFICULTY_LABEL[exam.difficulty] || DIFFICULTY_LABEL.medium
                          return (
                            <div
                              key={exam.id}
                              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10">
                                  <BookOpen className="size-5 text-brand" />
                                </div>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${diff.cls}`}>
                                  {diff.label}
                                </span>
                              </div>
                              <h3 className="mt-3 font-heading text-base font-bold text-foreground">
                                {exam.title}
                              </h3>
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <FileCheck className="size-3" />
                                  {exam.questionCount} টি প্রশ্ন
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {exam.duration} মিনিট
                                </span>
                              </div>
                              <Link
                                href={`/exam/${exam.id}`}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
                              >
                                <Play className="size-4" />
                                শুরু করুন
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
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
