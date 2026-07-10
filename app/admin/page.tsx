'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { SITE, NOTICES, QUESTION_BANK, SUBJECTS, type Question } from '@/lib/site-data'
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
  Receipt,
  Wallet,
  Loader2,
  ExternalLink,
  Phone,
  Check,
  XCircle,
  EyeOff,
} from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
  { id: 'courses', label: 'কোর্স', icon: GraduationCap },
  { id: 'enrollments', label: 'এনরোলমেন্ট', icon: BookOpen },
  { id: 'payments', label: 'পেমেন্ট', icon: Wallet },
  { id: 'invoices', label: 'ইনভয়েস', icon: Receipt },
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

interface Course {
  id: string
  slug: string
  title: string
  description: string
  shortDescription: string | null
  duration: string
  fee: number
  discountFee: number | null
  image: string | null
  features: string[] | null
  isActive: boolean
  maxStudents: number | null
  currentStudents: number
  schedule: string | null
}

interface Enrollment {
  id: string
  userId: string
  courseId: string
  status: string
  enrolledAt: string
  totalFee: number
  paidAmount: number
  dueAmount: number
  notes: string | null
  userName: string | null
  userPhone: string | null
  courseTitle: string | null
}

interface Payment {
  id: string
  userId: string
  enrollmentId: string
  amount: number
  method: string
  transactionId: string | null
  senderNumber: string | null
  status: string
  notes: string | null
  verifiedBy: string | null
  verifiedAt: string | null
  paidAt: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  userId: string
  enrollmentId: string
  amount: number
  paidAmount: number
  dueAmount: number
  status: string
  dueDate: string | null
  description: string | null
  createdAt: string
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

export default function AdminPage() {
  const router = useRouter()
  const session = authClient.useSession()
  const [tab, setTab] = useState<TabId>('overview')
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, enrollmentsRes, paymentsRes, invoicesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/enrollments'),
        fetch('/api/payments'),
        fetch('/api/invoices'),
      ])

      if (coursesRes.ok) setCourses(await coursesRes.json())
      if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json())
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
      if (invoicesRes.ok) setInvoices(await invoicesRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session.data) fetchData()
  }, [session.data, fetchData])

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/auth/sign-in')
    router.refresh()
  }

  if (session.isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-brand" />
          <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
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

  const pendingEnrollments = enrollments.filter((e) => e.status === 'pending').length
  const pendingPayments = payments.filter((p) => p.status === 'pending').length

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
              {t.id === 'enrollments' && pendingEnrollments > 0 && (
                <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-xs font-bold text-gold">{pendingEnrollments}</span>
              )}
              {t.id === 'payments' && pendingPayments > 0 && (
                <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-xs font-bold text-gold">{pendingPayments}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <OverviewCard label="শিক্ষার্থী" value={`${enrollments.length}`} sub="মোট" icon={Users} color="brand" />
              <OverviewCard label="কোর্স" value={`${courses.length}`} sub="সক্রিয়" icon={BookOpen} color="green" />
              <OverviewCard label="এনরোলমেন্ট" value={`${pendingEnrollments}`} sub="অপেক্ষমান" icon={GraduationCap} color="gold" />
              <OverviewCard label="পেমেন্ট" value={`${pendingPayments}`} sub="যাচাইকরণ বাকি" icon={Wallet} color="gold" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-foreground">সর্বশেষ এনরোলমেন্ট</h3>
                <div className="mt-3 space-y-2">
                  {enrollments.slice(0, 3).map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{e.userName || 'শিক্ষার্থী'} — {e.courseTitle}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        e.status === 'active' ? 'bg-green/10 text-green' :
                        e.status === 'pending' ? 'bg-gold/10 text-gold' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {e.status === 'active' ? 'সক্রিয়' : e.status === 'pending' ? 'অপেক্ষমান' : e.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-foreground">অপেক্ষমান পেমেন্ট</h3>
                <div className="mt-3 space-y-2">
                  {payments.filter((p) => p.status === 'pending').slice(0, 3).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">৳{p.amount.toLocaleString()} — {p.method === 'bkash' ? 'bKash' : p.method === 'nagad' ? 'Nagad' : p.method}</span>
                      <span className="text-xs text-muted-foreground">{p.transactionId}</span>
                    </div>
                  ))}
                  {payments.filter((p) => p.status === 'pending').length === 0 && (
                    <p className="text-sm text-muted-foreground">কোনো অপেক্ষমান পেমেন্ট নেই</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'courses' && <CoursesManager courses={courses} onRefresh={fetchData} />}
        {tab === 'enrollments' && <EnrollmentsManager enrollments={enrollments} onRefresh={fetchData} />}
        {tab === 'payments' && <PaymentsManager payments={payments} onRefresh={fetchData} />}
        {tab === 'invoices' && <InvoicesManager invoices={invoices} enrollments={enrollments} onRefresh={fetchData} />}
        {tab === 'notices' && <NoticesManager />}
        {tab === 'exams' && <ExamsManager />}
        {tab === 'questions' && <QuestionBankManager />}
        {tab === 'results' && <ResultsManager />}
        {tab === 'students' && <StudentsManager enrollments={enrollments} />}
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

/* ─── Courses Manager ─── */
function CoursesManager({ courses, onRefresh }: { courses: Course[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    slug: '',
    title: '',
    description: '',
    shortDescription: '',
    duration: '',
    fee: 0,
    discountFee: 0,
    image: '',
    maxStudents: 0,
    schedule: '',
  })

  async function handleSave() {
    if (!form.title.trim() || !form.slug.trim()) return
    setSaving(true)
    try {
      const body = {
        ...form,
        fee: Number(form.fee),
        discountFee: form.discountFee ? Number(form.discountFee) : undefined,
        maxStudents: form.maxStudents ? Number(form.maxStudents) : undefined,
      }
      const url = editing ? `/api/courses/${editing.id}` : '/api/courses'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        onRefresh()
        setShowForm(false)
        setEditing(null)
        setForm({ slug: '', title: '', description: '', shortDescription: '', duration: '', fee: 0, discountFee: 0, image: '', maxStudents: 0, schedule: '' })
      }
    } catch (error) {
      console.error('Failed to save course:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('আপনি কি নিশ্চিত এই কোর্স মুছে ফেলতে চান?')) return
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  function handleEdit(course: Course) {
    setEditing(course)
    setForm({
      slug: course.slug,
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription || '',
      duration: course.duration,
      fee: course.fee,
      discountFee: course.discountFee || 0,
      image: course.image || '',
      maxStudents: course.maxStudents || 0,
      schedule: course.schedule || '',
    })
    setShowForm(true)
  }

  async function toggleActive(course: Course) {
    await fetch(`/api/courses/${course.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !course.isActive }),
    })
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">কোর্স ব্যবস্থাপনা</h3>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ slug: '', title: '', description: '', shortDescription: '', duration: '', fee: 0, discountFee: 0, image: '', maxStudents: 0, schedule: '' }) }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          নতুন কোর্স
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? 'কোর্স সম্পাদনা' : 'নতুন কোর্স যোগ'}
            </h4>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">কোর্সের নাম</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="যেমন: নার্সিং অ্যাডমিশন কোচিং"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">স্লাগ (URL)</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="যেমন: nursing-admission"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">সংক্ষিপ্ত বিবরণ</label>
              <input type="text" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="কোর্স সম্পর্কে সংক্ষিপ্ত"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">বিস্তারিত বিবরণ</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="কোর্সের বিস্তারিত বিবরণ"
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground">সময়কাল</label>
                <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="যেমন: ১ বছর"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">ফি (৳)</label>
                <input type="number" value={form.fee || ''} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">ছাড়ের ফি (৳)</label>
                <input type="number" value={form.discountFee || ''} onChange={(e) => setForm({ ...form, discountFee: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">সর্বোচ্চ আসন</label>
                <input type="number" value={form.maxStudents || ''} onChange={(e) => setForm({ ...form, maxStudents: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">সময়সূচি</label>
                <input type="text" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="যেমন: শনি-বৃহ ৬:০০-৮:০০"
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
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
                <th className="px-4 py-3 text-left font-semibold text-foreground">কোর্স</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">সময়কাল</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">ফি</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">ছাড়</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">শিক্ষার্থী</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{c.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.duration}</td>
                  <td className="px-4 py-3 text-center text-foreground">৳{c.fee.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-green">{c.discountFee ? `৳${c.discountFee.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-center text-foreground">{c.currentStudents}/{c.maxStudents || '∞'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(c)} className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${c.isActive ? 'bg-green/10 text-green' : 'bg-secondary text-muted-foreground'}`}>
                      {c.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(c)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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

/* ─── Enrollments Manager ─── */
function EnrollmentsManager({ enrollments, onRefresh }: { enrollments: Enrollment[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = filter === 'all' ? enrollments : enrollments.filter((e) => e.status === filter)

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id)
    try {
      await fetch(`/api/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to update enrollment:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">এনরোলমেন্ট ব্যবস্থাপনা</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="all">সকল</option>
          <option value="pending">অপেক্ষমান</option>
          <option value="approved">অনুমোদিত</option>
          <option value="active">সক্রিয়</option>
          <option value="rejected">প্রত্যাখ্যাত</option>
          <option value="completed">সম্পন্ন</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">শিক্ষার্থী</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ফোন</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">কোর্স</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">মোট ফি</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">পরিশোধ</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">বকেয়</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{e.userName || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.userPhone || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.courseTitle || '—'}</td>
                  <td className="px-4 py-3 text-center text-foreground">৳{e.totalFee.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-green">৳{e.paidAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-gold font-medium">৳{e.dueAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {e.status === 'pending' && (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStatusChange(e.id, 'approved')}
                          disabled={updating === e.id}
                          className="rounded-lg bg-green/10 p-1.5 text-green hover:bg-green/20"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(e.id, 'rejected')}
                          disabled={updating === e.id}
                          className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                        >
                          <XCircle className="size-4" />
                        </button>
                      </div>
                    )}
                    {e.status === 'approved' && (
                      <button
                        onClick={() => handleStatusChange(e.id, 'active')}
                        disabled={updating === e.id}
                        className="rounded-lg bg-brand/10 px-2 py-1 text-xs font-medium text-brand hover:bg-brand/20"
                      >
                        সক্রিয় করুন
                      </button>
                    )}
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

/* ─── Payments Manager ─── */
function PaymentsManager({ payments, onRefresh }: { payments: Payment[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = filter === 'all' ? payments : payments.filter((p) => p.status === filter)

  async function handleVerify(id: string, status: string) {
    setUpdating(id)
    try {
      await fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to update payment:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">পেমেন্ট ব্যবস্থাপনা</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="all">সকল</option>
          <option value="pending">অপেক্ষমান</option>
          <option value="verified">যাচাইকৃত</option>
          <option value="rejected">প্রত্যাখ্যাত</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">তারিখ</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">পরিমাণ</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">মাধ্যম</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ট্রানজেকশন ID</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">প্রেরক</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">
                    {new Date(p.paidAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-foreground">৳{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><MethodBadge method={p.method} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.transactionId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.senderNumber}</td>
                  <td className="px-4 py-3 text-center"><PaymentStatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-center">
                    {p.status === 'pending' && (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleVerify(p.id, 'verified')}
                          disabled={updating === p.id}
                          className="rounded-lg bg-green/10 p-1.5 text-green hover:bg-green/20"
                          title="যাচাই করুন"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          onClick={() => handleVerify(p.id, 'rejected')}
                          disabled={updating === p.id}
                          className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                          title="প্রত্যাখ্যান করুন"
                        >
                          <XCircle className="size-4" />
                        </button>
                      </div>
                    )}
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

/* ─── Invoices Manager ─── */
function InvoicesManager({ invoices, enrollments, onRefresh }: { invoices: Invoice[]; enrollments: Enrollment[]; onRefresh: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-foreground">ইনভয়েস ব্যবস্থাপনা</h3>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">ইনভয়েস নম্বর</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">মোট</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">পরিশোধিত</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">বকেয়</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">তৈরি</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 font-medium text-foreground">৳{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green">৳{inv.paidAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-gold">৳{inv.dueAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      inv.status === 'paid' ? 'bg-green/10 text-green' :
                      inv.status === 'partial' ? 'bg-gold/10 text-gold' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {inv.status === 'paid' ? 'পরিশোধিত' : inv.status === 'partial' ? 'আংশিক' : 'অপরিশোধিত'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString('bn-BD')}
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
function StudentsManager({ enrollments }: { enrollments: Enrollment[] }) {
  const [search, setSearch] = useState('')
  const filtered = enrollments.filter(
    (e) => (e.userName || '').includes(search) || (e.userPhone || '').includes(search)
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
            placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
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
                <th className="px-4 py-3 text-left font-semibold text-foreground">ফোন</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">কোর্স</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">মোট ফি</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">বকেয়</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{e.userName || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.userPhone || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.courseTitle || '—'}</td>
                  <td className="px-4 py-3 text-center text-foreground">৳{e.totalFee.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-gold font-medium">৳{e.dueAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={e.status} />
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

/* ─── Helper Badges ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'অপেক্ষমান', cls: 'bg-gold/10 text-gold' },
    approved: { label: 'অনুমোদিত', cls: 'bg-green/10 text-green' },
    rejected: { label: 'প্রত্যাখ্যাত', cls: 'bg-destructive/10 text-destructive' },
    active: { label: 'সক্রিয়', cls: 'bg-brand/10 text-brand' },
    completed: { label: 'সম্পন্ন', cls: 'bg-green/10 text-green' },
    cancelled: { label: 'বাতিল', cls: 'bg-muted text-muted-foreground' },
  }
  const s = map[status] || { label: status, cls: 'bg-secondary text-muted-foreground' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'অপেক্ষমান', cls: 'bg-gold/10 text-gold' },
    verified: { label: 'যাচাইকৃত', cls: 'bg-green/10 text-green' },
    rejected: { label: 'প্রত্যাখ্যাত', cls: 'bg-destructive/10 text-destructive' },
  }
  const s = map[status] || { label: status, cls: 'bg-secondary text-muted-foreground' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  )
}

function MethodBadge({ method }: { method: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    bkash: { label: 'bKash', cls: 'bg-[#E2136E]/10 text-[#E2136E]' },
    nagad: { label: 'Nagad', cls: 'bg-[#F6921E]/10 text-[#F6921E]' },
    cash: { label: 'নগদ', cls: 'bg-green/10 text-green' },
    bank: { label: 'ব্যাংক', cls: 'bg-brand/10 text-brand' },
  }
  const s = map[method] || { label: method, cls: 'bg-secondary text-muted-foreground' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  )
}