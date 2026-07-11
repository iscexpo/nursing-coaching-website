'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, X, Clock } from 'lucide-react'
import type { Exam, Result } from './types'

const MOCK_EXAMS: Exam[] = [
  { id: 1, title: 'মডেল টেস্ট #১', date: '১২ জুলাই ২০২৬', time: 'সকাল ১০:০০', duration: '৬০ মিনিট', totalMarks: 100, status: 'completed' },
  { id: 2, title: 'মডেল টেস্ট #২', date: '১৯ জুলাই ২০২৬', time: 'সকাল ১০:০০', duration: '৬০ মিনিট', totalMarks: 100, status: 'completed' },
  { id: 3, title: 'মডেল টেস্ট #৩', date: '২৬ জুলাই ২০২৬', time: 'সকাল ১০:০০', duration: '৬০ মিনিট', totalMarks: 100, status: 'ongoing' },
  { id: 4, title: 'মডেল টেস্ট #৪', date: '৯ আগস্ট ২০২৬', time: 'সকাল ১০:০০', duration: '৬০ মিনিট', totalMarks: 100, status: 'upcoming' },
]

const MOCK_RESULTS: Result[] = [
  { id: 1, studentName: 'সাদিয়া আফরিন', studentId: 'STU-001', examId: 1, examTitle: 'মডেল টেস্ট #১', score: 78, total: 100, rank: 12 },
  { id: 2, studentName: 'রাকিব হাসান', studentId: 'STU-002', examId: 1, examTitle: 'মডেল টেস্ট #১', score: 85, total: 100, rank: 8 },
  { id: 3, studentName: 'নুসরাত জাহান', studentId: 'STU-003', examId: 1, examTitle: 'মডেল টেস্ট #১', score: 92, total: 100, rank: 1 },
  { id: 4, studentName: 'সাদিয়া আফরিন', studentId: 'STU-001', examId: 2, examTitle: 'মডেল টেস্ট #২', score: 85, total: 100, rank: 5 },
  { id: 5, studentName: 'রাকিব হাসান', studentId: 'STU-002', examId: 2, examTitle: 'মডেল টেস্ট #২', score: 79, total: 100, rank: 10 },
  { id: 6, studentName: 'নুসরাত জাহান', studentId: 'STU-003', examId: 2, examTitle: 'মডেল টেস্ট #২', score: 88, total: 100, rank: 3 },
]

export function ExamsPanel() {
  const [exams, setExams] = useState<Exam[]>(MOCK_EXAMS)
  const [showExamForm, setShowExamForm] = useState(false)
  const [examForm, setExamForm] = useState({ title: '', date: '', time: 'সকাল ১০:০০', duration: '৬০ মিনিট', totalMarks: 100 })

  const [results, setResults] = useState<Result[]>(MOCK_RESULTS)
  const [showResultForm, setShowResultForm] = useState(false)
  const [filterExam, setFilterExam] = useState<string>('all')
  const [resultForm, setResultForm] = useState({ studentName: '', studentId: '', examId: 0, examTitle: '', score: 0, total: 100 })

  const filteredResults = filterExam === 'all' ? results : results.filter((r) => r.examTitle === filterExam)
  const uniqueExams = [...new Set(results.map((r) => r.examTitle))]

  function handleCreateExam() {
    if (!examForm.title.trim() || !examForm.date.trim()) return
    const newExam: Exam = {
      id: Date.now(),
      ...examForm,
      status: 'upcoming',
    }
    setExams((prev) => [...prev, newExam])
    setExamForm({ title: '', date: '', time: 'সকাল ১০:০০', duration: '৬০ মিনিট', totalMarks: 100 })
    setShowExamForm(false)
  }

  function handleDeleteExam(id: number) {
    setExams((prev) => prev.filter((e) => e.id !== id))
  }

  function toggleStatus(id: number) {
    setExams((prev) => prev.map((e) => {
      if (e.id !== id) return e
      const next = e.status === 'upcoming' ? 'ongoing' : e.status === 'ongoing' ? 'completed' : 'upcoming'
      return { ...e, status: next }
    }))
  }

  function handleAddResult() {
    if (!resultForm.studentName.trim() || !resultForm.examTitle.trim()) return
    const sameExam = results.filter((r) => r.examTitle === resultForm.examTitle)
    const rank = sameExam.filter((r) => r.score > resultForm.score).length + 1
    const newResult: Result = {
      id: Date.now(),
      ...resultForm,
      rank,
    }
    setResults((prev) => [...prev, newResult])
    setResultForm({ studentName: '', studentId: '', examId: 0, examTitle: '', score: 0, total: 100 })
    setShowResultForm(false)
  }

  function handleDeleteResult(id: number) {
    setResults((prev) => prev.filter((r) => r.id !== id))
  }

  const statusMap = {
    upcoming: { label: 'আসন্ন', cls: 'bg-brand/10 text-brand' },
    ongoing: { label: 'চলমান', cls: 'bg-green/10 text-green' },
    completed: { label: 'সম্পন্ন', cls: 'bg-secondary text-muted-foreground' },
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground">পরীক্ষা ব্যবস্থাপনা</h3>
          <button
            onClick={() => setShowExamForm(!showExamForm)}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <Plus className="size-4" />
            নতুন পরীক্ষা
          </button>
        </div>

        {showExamForm && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold text-foreground">নতুন পরীক্ষা তৈরি</h4>
              <button onClick={() => setShowExamForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">পরীক্ষার নাম</label>
                  <input type="text" value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} placeholder="যেমন: মডেল টেস্ট #৫"
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">তারিখ</label>
                  <input type="text" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} placeholder="যেমন: ১৬ আগস্ট ২০২৬"
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">সময়</label>
                  <input type="text" value={examForm.time} onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">মোট মার্কস</label>
                  <input type="number" value={examForm.totalMarks} onChange={(e) => setExamForm({ ...examForm, totalMarks: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
              </div>
              <button onClick={handleCreateExam} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
                <Save className="size-4" />
                পরীক্ষা তৈরি করুন
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">পরীক্ষা</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">তারিখ</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">সময়</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">মার্কস</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{e.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                    <td className="px-4 py-3 text-muted-foreground flex items-center gap-1"><Clock className="size-3.5" />{e.time}</td>
                    <td className="px-4 py-3 text-center text-foreground">{e.totalMarks}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleStatus(e.id)} className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${statusMap[e.status].cls}`}>
                        {statusMap[e.status].label}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDeleteExam(e.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-lg font-bold text-foreground">ফলাফল ব্যবস্থাপনা</h3>
          <div className="flex items-center gap-2">
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="all">সকল পরীক্ষা</option>
              {uniqueExams.map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
            <button
              onClick={() => setShowResultForm(!showResultForm)}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
            >
              <Plus className="size-4" />
              ফলাফল যোগ
            </button>
          </div>
        </div>

        {showResultForm && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-semibold text-foreground">নতুন ফলাফল যোগ করুন</h4>
              <button onClick={() => setShowResultForm(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground">শিক্ষার্থীর নাম</label>
                  <input type="text" value={resultForm.studentName} onChange={(e) => setResultForm({ ...resultForm, studentName: e.target.value })} placeholder="শিক্ষার্থীর নাম"
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">শিক্ষার্থী ID</label>
                  <input type="text" value={resultForm.studentId} onChange={(e) => setResultForm({ ...resultForm, studentId: e.target.value })} placeholder="STU-XXX"
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">পরীক্ষা</label>
                  <select value={resultForm.examId || ''} onChange={(e) => {
                    const exam = MOCK_EXAMS.find((ex) => ex.id === Number(e.target.value))
                    setResultForm({ ...resultForm, examId: Number(e.target.value), examTitle: exam?.title || '' })
                  }}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                    <option value="">পরীক্ষা বাছাই</option>
                    {MOCK_EXAMS.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground">প্রাপ্ত মার্কস</label>
                    <input type="number" value={resultForm.score || ''} onChange={(e) => setResultForm({ ...resultForm, score: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">মোট মার্কস</label>
                    <input type="number" value={resultForm.total} onChange={(e) => setResultForm({ ...resultForm, total: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                  </div>
                </div>
              </div>
              <button onClick={handleAddResult} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
                <Save className="size-4" />
                ফলাফল সংরক্ষণ
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">শিক্ষার্থী</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">পরীক্ষা</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">স্কোর</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">র‍্যাঙ্ক</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r) => {
                  const pct = Math.round((r.score / r.total) * 100)
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{r.studentName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.studentId}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.examTitle}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-foreground">{r.score}</span>
                        <span className="text-muted-foreground">/{r.total}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          r.rank <= 3 ? 'bg-green/10 text-green' : r.rank <= 10 ? 'bg-brand/10 text-brand' : 'bg-secondary text-muted-foreground'
                        }`}>
                          #{r.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDeleteResult(r.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
