'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { Clock, BookOpen, Play, Filter, Loader2 } from 'lucide-react'

interface ExamDef {
  id: string
  title: string
  subject: string
  questionCount: number
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
}

const difficultyLabel: Record<string, string> = {
  easy: 'সহজ',
  medium: 'মাঝারি',
  hard: 'কঠিন',
}

const difficultyColor: Record<string, string> = {
  easy: 'bg-green/10 text-green',
  medium: 'bg-brand/10 text-brand',
  hard: 'bg-destructive/10 text-destructive',
}

export default function ExamListPage() {
  const [filter, setFilter] = useState('all')
  const [exams, setExams] = useState<ExamDef[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch('/api/exams?limit=50')
        const data = await res.json()
        if (res.ok && data.data) {
          setExams(data.data.map((e: ExamDef & { questionCount: number }) => ({
            id: e.id,
            title: e.title,
            subject: e.subject,
            questionCount: e.questionCount,
            duration: e.duration,
            difficulty: e.difficulty,
          })))
        }
      } catch {
        // fallback to empty
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [])

  const subjects = [...new Set(exams.map((e) => e.subject))]
  const filtered = filter === 'all' ? exams : exams.filter((e) => e.subject === filter)

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-secondary/20">
        <div className="bg-gradient-to-b from-brand/5 to-background py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-brand">
              অনলাইন পরীক্ষা
            </span>
            <h1 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              মডেল টেস্ট দিন
            </h1>
            <p className="mt-3 text-muted-foreground">
              বিষয়ভিত্তিক মডেল টেস্টে অংশ নিন এবং নিজেকে যাচাই করুন
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : exams.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
              <BookOpen className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-4 font-heading text-lg font-bold text-foreground">
                কোনো পরীক্ষা পাওয়া যায়নি
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                শীঘ্রই পরীক্ষা যোগ করা হবে।
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <button
                  onClick={() => setFilter('all')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    filter === 'all' ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  সকল বিষয়
                </button>
                {subjects.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      filter === s ? 'bg-brand text-brand-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((exam) => (
                  <div key={exam.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10">
                        <BookOpen className="size-5 text-brand" />
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyColor[exam.difficulty]}`}>
                        {difficultyLabel[exam.difficulty]}
                      </span>
                    </div>
                    <h3 className="mt-3 font-heading text-base font-bold text-foreground">{exam.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="size-3" />{exam.questionCount} টি প্রশ্ন</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" />{exam.duration} মিনিট</span>
                    </div>
                    <Link
                      href={`/exam/${exam.id}`}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
                    >
                      <Play className="size-4" />
                      শুরু করুন
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  )
}
