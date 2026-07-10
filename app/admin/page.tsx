'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { SITE, COURSES, NOTICES, QUESTION_BANK, SUBJECTS, type Question } from '@/lib/site-data'
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  BarChart3,
  Users,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  Eye,
  Save,
  X,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  GraduationCap,
  TrendingUp,
  HelpCircle,
} from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
  { id: 'notices', label: 'নোটিশ', icon: Megaphone },
  { id: 'exams', label: 'পরীক্ষা', icon: FileText },
  { id: 'questions', label: 'প্রশ্নব্যাংক', icon: HelpCircle },
  { id: 'results', label: 'ফলাফল', icon: BarChart3 },
  { id: 'students', label: 'শিক্ষার্থী', icon: Users },
] as const

type TabId = (typeof TABS)[number]['id']

interface Notice {
  id: number
  tag: string
  title: string
  date: string
  urgent: boolean
}

interface Exam {
  id: number
  title: string
  date: string
  time: string
  duration: string
  totalMarks: number
  status: 'upcoming' | 'ongoing' | 'completed'
}

interface Result {
  id: number
  studentName: string
  studentId: string
  examId: number
  examTitle: string
  score: number
  total: number
  rank: number
}

interface Student {
  id: string
  name: string
  phone: string
  course: string
  enrolled: string
  status: 'active' | 'inactive'
}

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

const MOCK_STUDENTS: Student[] = [
  { id: 'STU-001', name: 'সাদিয়া আফরিন', phone: '01712-345678', course: 'নার্সিং অ্যাডমিশন কোচিং', enrolled: '১ জুলাই ২০২৬', status: 'active' },
  { id: 'STU-002', name: 'রাকিব হাসান', phone: '01834-567890', course: 'B.Sc Nursing প্রস্তুতি', enrolled: '৩ জুলাই ২০২৬', status: 'active' },
  { id: 'STU-003', name: 'নুসরাত জাহান', phone: '01956-789012', course: 'নার্সিং কাউন্সিল পরীক্ষা', enrolled: '৫ জুলাই ২০২৬', status: 'active' },
  { id: 'STU-004', name: 'তানভীর আহমেদ', phone: '01678-901234', course: 'নার্সিং অ্যাডমিশন কোচিং', enrolled: '৭ জুলাই ২০২৬', status: 'active' },
  { id: 'STU-005', name: 'ফাতেমা খানম', phone: '01590-123456', course: 'চাকরি প্রস্তুতি', enrolled: '১০ জুলাই ২০২৬', status: 'inactive' },
]

export default function AdminPage() {
  const router = useRouter()
  const session = authClient.useSession()
  const [tab, setTab] = useState<TabId>('overview')

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/auth/sign-in')
    router.refresh()
  }

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    )
  }

  if (!session.data) {
    router.push('/auth/sign-in')
    return null
  }

  if (session.data.user.role !== 'admin') {
    router.push('/dashboard')
    return null
  }

  const activeStudents = MOCK_STUDENTS.filter((s) => s.status === 'active').length
  const upcomingExams = MOCK_EXAMS.filter((e) => e.status === 'upcoming').length

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-lg font-bold text-foreground">
              {SITE.nameBn}
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">|</span>
            <span className="hidden text-sm font-medium text-brand sm:inline">অ্যাডমিন প্যানেল</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">সাইন আউট</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-foreground">
            স্বাগতম, {session.data.user.name}!
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">অ্যাডমিন হিসেবে লগইন করেছেন</p>
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <OverviewCard label="শিক্ষার্থী" value={`${activeStudents}`} sub="সক্রিয়" icon={Users} color="brand" />
              <OverviewCard label="কোর্স" value={`${COURSES.length}`} sub="সক্রিয়" icon={BookOpen} color="green" />
              <OverviewCard label="পরীক্ষা" value={`${upcomingExams}`} sub="আসন্ন" icon={FileText} color="gold" />
              <OverviewCard label="নোটিশ" value={`${NOTICES.length}`} sub="সক্রিয়" icon={Megaphone} color="brand" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-foreground">আসন্ন পরীক্ষা</h3>
                <div className="mt-3 space-y-2">
                  {MOCK_EXAMS.filter((e) => e.status !== 'completed').slice(0, 3).map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{e.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        e.status === 'ongoing' ? 'bg-green/10 text-green' : 'bg-brand/10 text-brand'
                      }`}>
                        {e.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-foreground">সর্বশেষ নোটিশ</h3>
                <div className="mt-3 space-y-2">
                  {NOTICES.slice(0, 3).map((n, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{n.title.slice(0, 30)}...</span>
                      {n.urgent && <span className="text-xs font-semibold text-destructive">জরুরি</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'notices' && <NoticesManager />}
        {tab === 'exams' && <ExamsManager />}
        {tab === 'questions' && <QuestionBankManager />}
        {tab === 'results' && <ResultsManager />}
        {tab === 'students' && <StudentsManager />}
      </div>
    </div>
  )
}

function OverviewCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub: string; icon: React.ElementType; color: string }) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand/10 text-brand',
    green: 'bg-green/10 text-green',
    gold: 'bg-gold/10 text-gold',
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-xl ${colorMap[color]}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label} · {sub}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Notices Manager ─── */
function NoticesManager() {
  const [notices, setNotices] = useState<Notice[]>(
    NOTICES.map((n, i) => ({ ...n, id: i + 1 }))
  )
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [form, setForm] = useState({ tag: 'ভর্তি', title: '', urgent: false })

  function handleSave() {
    if (!form.title.trim()) return
    if (editing) {
      setNotices((prev) => prev.map((n) => n.id === editing.id ? { ...n, ...form, date: n.date } : n))
    } else {
      const newNotice: Notice = {
        id: Date.now(),
        ...form,
        date: 'আজ',
      }
      setNotices((prev) => [newNotice, ...prev])
    }
    setForm({ tag: 'ভর্তি', title: '', urgent: false })
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(n: Notice) {
    setEditing(n)
    setForm({ tag: n.tag, title: n.title, urgent: n.urgent })
    setShowForm(true)
  }

  function handleDelete(id: number) {
    setNotices((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">নোটিশ ব্যবস্থাপনা</h3>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ tag: 'ভর্তি', title: '', urgent: false }) }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন নোটিশ
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ'}
            </h4>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">ট্যাগ</label>
                <select
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option>ভর্তি</option>
                  <option>ক্লাস</option>
                  <option>পরীক্ষা</option>
                  <option>ডেডলাইন</option>
                  <option>সাধারণ</option>
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.urgent}
                    onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                    className="size-4 rounded border-border"
                  />
                  জরুরি
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">নোটিশ</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="নোটিশের বিষয় লিখুন"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
              <Save className="size-4" />
              {editing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n.id} className={`rounded-2xl border bg-card p-4 shadow-sm ${n.urgent ? 'border-gold/50' : 'border-border'}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-brand">{n.tag}</span>
              {n.urgent && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">জরুরি</span>}
              <span className="ml-auto text-xs text-muted-foreground">{n.date}</span>
              <button onClick={() => handleEdit(n)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => handleDelete(n.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{n.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Exams Manager ─── */
function ExamsManager() {
  const [exams, setExams] = useState<Exam[]>(MOCK_EXAMS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', time: 'সকাল ১০:০০', duration: '৬০ মিনিট', totalMarks: 100 })

  function handleCreate() {
    if (!form.title.trim() || !form.date.trim()) return
    const newExam: Exam = {
      id: Date.now(),
      ...form,
      status: 'upcoming',
    }
    setExams((prev) => [...prev, newExam])
    setForm({ title: '', date: '', time: 'সকাল ১০:০০', duration: '৬০ মিনিট', totalMarks: 100 })
    setShowForm(false)
  }

  function handleDelete(id: number) {
    setExams((prev) => prev.filter((e) => e.id !== id))
  }

  function toggleStatus(id: number) {
    setExams((prev) => prev.map((e) => {
      if (e.id !== id) return e
      const next = e.status === 'upcoming' ? 'ongoing' : e.status === 'ongoing' ? 'completed' : 'upcoming'
      return { ...e, status: next }
    }))
  }

  const statusMap = {
    upcoming: { label: 'আসন্ন', cls: 'bg-brand/10 text-brand' },
    ongoing: { label: 'চলমান', cls: 'bg-green/10 text-green' },
    completed: { label: 'সম্পন্ন', cls: 'bg-secondary text-muted-foreground' },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">পরীক্ষা ব্যবস্থাপনা</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন পরীক্ষা
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">নতুন পরীক্ষা তৈরি</h4>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">পরীক্ষার নাম</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="যেমন: মডেল টেস্ট #৫"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">তারিখ</label>
                <input type="text" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="যেমন: ১৬ আগস্ট ২০২৬"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">সময়</label>
                <input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">মোট মার্কস</label>
                <input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <button onClick={handleCreate} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
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
                    <button onClick={() => handleDelete(e.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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
  )
}

/* ─── Results Manager ─── */
function ResultsManager() {
  const [results, setResults] = useState<Result[]>(MOCK_RESULTS)
  const [showForm, setShowForm] = useState(false)
  const [filterExam, setFilterExam] = useState<string>('all')
  const [form, setForm] = useState({ studentName: '', studentId: '', examId: 0, examTitle: '', score: 0, total: 100 })

  const filtered = filterExam === 'all' ? results : results.filter((r) => r.examTitle === filterExam)
  const uniqueExams = [...new Set(results.map((r) => r.examTitle))]

  function handleAdd() {
    if (!form.studentName.trim() || !form.examTitle.trim()) return
    const sameExam = results.filter((r) => r.examTitle === form.examTitle)
    const rank = sameExam.filter((r) => r.score > form.score).length + 1
    const newResult: Result = {
      id: Date.now(),
      ...form,
      rank,
    }
    setResults((prev) => [...prev, newResult])
    setForm({ studentName: '', studentId: '', examId: 0, examTitle: '', score: 0, total: 100 })
    setShowForm(false)
  }

  function handleDelete(id: number) {
    setResults((prev) => prev.filter((r) => r.id !== id))
  }

  return (
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
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <Plus className="size-4" />
            ফলাফল যোগ
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">নতুন ফলাফল যোগ করুন</h4>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">শিক্ষার্থীর নাম</label>
                <input type="text" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="শিক্ষার্থীর নাম"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">শিক্ষার্থী ID</label>
                <input type="text" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="STU-XXX"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">পরীক্ষা</label>
                <select value={form.examId || ''} onChange={(e) => {
                  const exam = MOCK_EXAMS.find((ex) => ex.id === Number(e.target.value))
                  setForm({ ...form, examId: Number(e.target.value), examTitle: exam?.title || '' })
                }}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                  <option value="">পরীক্ষা বাছাই</option>
                  {MOCK_EXAMS.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground">প্রাপ্ত মার্কস</label>
                  <input type="number" value={form.score || ''} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">মোট মার্কস</label>
                  <input type="number" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
              </div>
            </div>
            <button onClick={handleAdd} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
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
              {filtered.map((r) => {
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
                      <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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
  )
}

/* ─── Students Manager ─── */
function StudentsManager() {
  const [search, setSearch] = useState('')
  const filtered = MOCK_STUDENTS.filter(
    (s) => s.name.includes(search) || s.id.includes(search) || s.phone.includes(search)
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">শিক্ষার্থী তালিকা</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ID বা ফোন দিয়ে খুঁজুন..."
            className="rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">নাম</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ফোন</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">কোর্স</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ভর্তি</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.course}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.enrolled}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      s.status === 'active' ? 'bg-green/10 text-green' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {s.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Question Bank Manager ─── */
function QuestionBankManager() {
  const [questions, setQuestions] = useState<Question[]>([...QUESTION_BANK])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)
  const [filterSubject, setFilterSubject] = useState('all')
  const [form, setForm] = useState({
    subject: 'বাংলা',
    question: '',
    options: ['', '', '', ''] as [string, string, string, string],
    correct: 0,
  })

  const filtered = filterSubject === 'all' ? questions : questions.filter((q) => q.subject === filterSubject)
  const subjectCounts = SUBJECTS.reduce((acc, s) => ({ ...acc, [s]: questions.filter((q) => q.subject === s).length }), {} as Record<string, number>)

  function handleSave() {
    if (!form.question.trim() || form.options.some((o) => !o.trim())) return
    if (editing) {
      setQuestions((prev) => prev.map((q) => q.id === editing.id ? { ...q, ...form } : q))
    } else {
      const newQ: Question = { id: Date.now(), ...form }
      setQuestions((prev) => [...prev, newQ])
    }
    setForm({ subject: 'বাংলা', question: '', options: ['', '', '', ''], correct: 0 })
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(q: Question) {
    setEditing(q)
    setForm({ subject: q.subject, question: q.question, options: [...q.options] as [string, string, string, string], correct: q.correct })
    setShowForm(true)
  }

  function handleDelete(id: number) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">প্রশ্নব্যাংক</h3>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ subject: 'বাংলা', question: '', options: ['', '', '', ''], correct: 0 }) }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন প্রশ্ন
        </button>
      </div>

      {/* Subject counts */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterSubject(filterSubject === s ? 'all' : s)}
            className={`rounded-xl border p-3 text-center transition-colors ${
              filterSubject === s ? 'border-brand bg-brand/5' : 'border-border bg-card hover:bg-secondary'
            }`}
          >
            <p className="text-lg font-bold text-foreground">{subjectCounts[s]}</p>
            <p className="text-xs text-muted-foreground">{s}</p>
          </button>
        ))}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? 'প্রশ্ন সম্পাদনা' : 'নতুন প্রশ্ন যোগ করুন'}
            </h4>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground">বিষয়</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">প্রশ্ন</label>
              <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
                rows={2} placeholder="প্রশ্ন লিখুন..."
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {form.options.map((opt, i) => (
                <div key={i}>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <input type="radio" name="correct" checked={form.correct === i}
                      onChange={() => setForm({ ...form, correct: i })}
                      className="size-4" />
                    উত্তর {String.fromCharCode(65 + i)} {i === form.correct && <span className="text-green text-xs">(সঠিক)</span>}
                  </label>
                  <input type="text" value={opt} onChange={(e) => {
                    const newOpts = [...form.options] as [string, string, string, string]
                    newOpts[i] = e.target.value
                    setForm({ ...form, options: newOpts })
                  }} placeholder={`উত্তর ${String.fromCharCode(65 + i)}`}
                    className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90">
              <Save className="size-4" />
              {editing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-center font-semibold text-foreground w-10">#</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">বিষয়</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">প্রশ্ন</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">সঠিক</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, i) => (
                <tr key={q.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-center text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-brand">{q.subject}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground max-w-xs truncate">{q.question}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-green/10 text-xs font-bold text-green">
                      {String.fromCharCode(65 + q.correct)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(q)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
