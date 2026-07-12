'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CheckCircle2, XCircle, Trophy, RotateCcw, Home, Loader2 } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

interface ExamResult {
  examId: string
  subject: string
  score: number
  total: number
  answers: Record<string, number>
  timestamp: number
}

function ExamResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const examId = searchParams.get('id')
  const [result, setResult] = useState<ExamResult | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!examId) { router.push('/exam'); return }
    const data = localStorage.getItem(`exam-result-${examId}`)
    if (!data) { router.push('/exam'); return }
    const parsed = JSON.parse(data)
    setResult(parsed)

    async function loadQuestions() {
      try {
        const res = await fetch(`/api/questions?examId=${examId}&limit=100`)
        if (res.ok) {
          const qData = await res.json()
          setQuestions(qData.data || [])
        }
      } catch {
        // fallback to empty
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [examId, router])

  if (!result || loading) {
    return (
      <>
        <SiteHeader />
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0

  function getGrade(score: number, total: number) {
    const p = total > 0 ? (score / total) * 100 : 0
    if (p >= 90) return { grade: 'A+', color: 'text-green' }
    if (p >= 80) return { grade: 'A', color: 'text-green' }
    if (p >= 70) return { grade: 'B', color: 'text-brand' }
    if (p >= 60) return { grade: 'C', color: 'text-brand' }
    if (p >= 50) return { grade: 'D', color: 'text-gold' }
    return { grade: 'F', color: 'text-destructive' }
  }

  const gradeInfo = getGrade(result.score, result.total)

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-secondary/20 py-8">
        <div className="mx-auto max-w-3xl px-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="bg-brand p-6 text-center text-brand-foreground">
              <Trophy className="mx-auto size-12" />
              <h1 className="mt-2 font-heading text-xl font-bold">পরীক্ষা সম্পন্ন!</h1>
              <p className="text-sm opacity-80">{result.subject || 'পরীক্ষা'} মডেল টেস্ট</p>
            </div>
            <div className="p-6 text-center">
              <div className={`text-6xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</div>
              <p className="mt-2 text-lg font-semibold text-foreground">{result.score}/{result.total}</p>
              <p className="text-sm text-muted-foreground">{pct}% সঠিক উত্তর</p>

              <div className="mx-auto mt-6 h-4 w-full max-w-xs overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 80 ? 'bg-green' : pct >= 60 ? 'bg-brand' : pct >= 40 ? 'bg-gold' : 'bg-destructive'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href={`/exam/${examId}`}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <RotateCcw className="size-4" />
                  আবার দিন
                </Link>
                <Link
                  href="/exam"
                  className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
                >
                  <Home className="size-4" />
                  সকল পরীক্ষা
                </Link>
              </div>
            </div>
          </div>

          {questions.length > 0 && (
            <>
              <h2 className="mt-8 mb-4 font-heading text-lg font-bold text-foreground">উত্তর পর্যালোচনা</h2>
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const userAnswer = result.answers[q.id]
                  const isCorrect = userAnswer === q.correctIndex
                  return (
                    <div key={q.id} className={`rounded-2xl border bg-card p-5 shadow-sm ${
                      isCorrect ? 'border-green/30' : 'border-destructive/30'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isCorrect ? 'bg-green/10 text-green' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{i + 1}. {q.question}</p>
                          <div className="mt-2 space-y-1">
                            {q.options.map((opt, j) => {
                              const isSelected = userAnswer === j
                              const isAnswer = j === q.correctIndex
                              return (
                                <div key={j} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ${
                                  isAnswer ? 'bg-green/10 text-green font-semibold' :
                                  isSelected && !isCorrect ? 'bg-destructive/10 text-destructive' :
                                  'text-muted-foreground'
                                }`}>
                                  <span className="font-bold">{String.fromCharCode(65 + j)}.</span>
                                  {opt}
                                  {isAnswer && <CheckCircle2 className="ml-auto size-3" />}
                                  {isSelected && !isAnswer && <XCircle className="ml-auto size-3" />}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

export default function ExamResultPage() {
  return (
    <Suspense fallback={
      <>
        <SiteHeader />
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </>
    }>
      <ExamResultContent />
    </Suspense>
  )
}
