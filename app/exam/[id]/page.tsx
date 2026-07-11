'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { Clock, ChevronLeft, ChevronRight, AlertCircle, Send, Loader2 } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
}

interface Exam {
  id: string
  title: string
  subject: string
  duration: number
  difficulty: string
}

export default function ExamPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.id as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadExam() {
      try {
        const [examRes, questionsRes] = await Promise.all([
          fetch(`/api/exams/${examId}`),
          fetch(`/api/questions?examId=${examId}&limit=100`),
        ])

        if (!examRes.ok) return
        const examData = await examRes.json()
        setExam(examData)
        setTimeLeft(examData.duration * 60)

        if (questionsRes.ok) {
          const qData = await questionsRes.json()
          setQuestions(qData.data || [])
        }
      } catch {
        // exam not found
      } finally {
        setLoading(false)
      }
    }
    loadExam()
  }, [examId])

  useEffect(() => {
    if (submitting || questions.length === 0) return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitting, questions.length])

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/exam-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          answers,
          timeTaken: (exam?.duration || 15) * 60 - timeLeft,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Submission failed')
        setSubmitting(false)
        return
      }

      const result = await res.json()
      localStorage.setItem(`exam-result-${examId}`, JSON.stringify({
        examId,
        subject: exam?.subject,
        score: result.score,
        total: result.total,
        answers,
        questions: result.questions,
        timestamp: Date.now(),
      }))

      router.push(`/exam/result?id=${examId}`)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }, [submitting, answers, questions, examId, exam, timeLeft, router])

  if (loading) {
    return (
      <>
        <SiteHeader />
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (!exam || questions.length === 0) {
    return (
      <>
        <SiteHeader />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-xl font-bold text-foreground">পরীক্ষা পাওয়া যায়নি</h1>
            <Link href="/exam" className="mt-4 inline-block text-sm text-brand hover:underline">পরীক্ষার তালিকায় ফিরুন</Link>
          </div>
        </div>
      </>
    )
  }

  const q = questions[current]
  const answeredCount = Object.keys(answers).length
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  function selectAnswer(optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-secondary/20">
        <div className="sticky top-16 z-40 border-b border-border bg-card shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div>
              <h1 className="font-heading text-sm font-bold text-foreground sm:text-base">{exam.title}</h1>
              <p className="text-xs text-muted-foreground">প্রশ্ন {current + 1}/{questions.length}</p>
            </div>
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold ${
              timeLeft < 60 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-secondary text-foreground'
            }`}>
              <Clock className="size-4" />
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
          <div className="h-1 bg-secondary">
            <div className="h-full bg-brand transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-8">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                {current + 1}
              </span>
              <p className="text-base font-medium text-foreground">{q.question}</p>
            </div>

            <div className="mt-6 space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left text-sm transition-all ${
                    answers[q.id] === i
                      ? 'border-brand bg-brand/5 text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-brand/50 hover:text-foreground'
                  }`}
                >
                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    answers[q.id] === i ? 'border-brand bg-brand text-brand-foreground' : 'border-border'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
              আগের
            </button>

            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`size-8 rounded-lg text-xs font-bold transition-colors ${
                    i === current ? 'bg-brand text-brand-foreground' :
                    answers[questions[i].id] !== undefined ? 'bg-green/10 text-green' :
                    'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {current === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green/90 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {submitting ? 'জমা হচ্ছে...' : 'জমা দিন'}
              </button>
            ) : (
              <button
                onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                পরবর্তী
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-4 text-center text-sm text-muted-foreground">
            <AlertCircle className="mx-auto mb-1 size-4 text-gold" />
            {answeredCount}/{questions.length} প্রশ্নের উত্তর দেওয়া হয়েছে
          </div>
        </div>
      </main>
    </>
  )
}
