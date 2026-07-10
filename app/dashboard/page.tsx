'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { SITE } from '@/lib/site-data'
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  CalendarCheck,
  LogOut,
  Download,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  Receipt,
  Wallet,
  UserCog,
  Search,
  Send,
  Copy,
  Check,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
  { id: 'courses', label: 'আমার কোর্স', icon: GraduationCap },
  { id: 'billing', label: 'বিলিং ও পেমেন্ট', icon: Receipt },
  { id: 'account', label: 'অ্যাকাউন্ট', icon: UserCog },
  { id: 'admit-card', label: 'এডমিট কার্ড', icon: CreditCard },
  { id: 'results', label: 'ফলাফল', icon: BarChart3 },
  { id: 'attendance', label: 'উপস্থিতি', icon: CalendarCheck },
] as const

type TabId = (typeof TABS)[number]['id']

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
  courseTitle: string | null
  courseDuration: string | null
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

interface UserProfile {
  id: string
  name: string
  email: string | null
  phoneNumber: string | null
  role: string
  studentId: string | null
  address: string | null
  dateOfBirth: string | null
  guardianName: string | null
  guardianPhone: string | null
  institution: string | null
}

const MOCK_RESULTS = [
  { exam: 'মডেল টেস্ট #১', date: '১২ জুলাই ২০২৬', score: 78, total: 100, rank: 12 },
  { exam: 'মডেল টেস্ট #২', date: '১৯ জুলাই ২০২৬', score: 85, total: 100, rank: 8 },
  { exam: 'মডেল টেস্ট #৩', date: '২৬ জুলাই ২০২৬', score: 72, total: 100, rank: 18 },
  { exam: 'সাপ্তাহিক পরীক্ষা', date: '০২ আগস্ট ২০২৬', score: 91, total: 100, rank: 3 },
]

const MOCK_ATTENDANCE = [
  { date: '১০ জুলাই', status: 'present' as const, time: 'সকাল ১০:০০' },
  { date: '১১ জুলাই', status: 'present' as const, time: 'সকাল ১০:০০' },
  { date: '১২ জুলাই', status: 'absent' as const, time: '—' },
  { date: '১৩ জুলাই', status: 'present' as const, time: 'সকাল ১০:০০' },
  { date: '১৪ জুলাই', status: 'present' as const, time: 'সকাল ১০:০০' },
  { date: '১৫ জুলাই', status: 'late' as const, time: 'সকাল ১০:১৫' },
  { date: '১৬ জুলাই', status: 'present' as const, time: 'সকাল ১০:০০' },
  { date: '১৭ জুলাই', status: 'present' as const, time: 'সকাল ১০:০০' },
  { date: '১৮ জুলাই', status: 'absent' as const, time: '—' },
  { date: '১৯ জুলাই', status: 'present' as const, time: 'সকাল ১০:০০' },
]

function StatusBadge({ status }: { status: 'present' | 'absent' | 'late' }) {
  const map = {
    present: { label: 'উপস্থিত', icon: CheckCircle2, cls: 'bg-green/10 text-green' },
    absent: { label: 'অনুপস্থিত', icon: XCircle, cls: 'bg-destructive/10 text-destructive' },
    late: { label: 'বিলম্বিত', icon: AlertCircle, cls: 'bg-gold/10 text-gold' },
  }
  const s = map[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      <s.icon className="size-3" />
      {s.label}
    </span>
  )
}

function EnrollmentStatusBadge({ status }: { status: string }) {
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

export default function DashboardPage() {
  const router = useRouter()
  const session = authClient.useSession()
  const [tab, setTab] = useState<TabId>('overview')
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, enrollmentsRes, paymentsRes, invoicesRes, profileRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/enrollments'),
        fetch('/api/payments'),
        fetch('/api/invoices'),
        fetch('/api/account/profile'),
      ])

      if (coursesRes.ok) setCourses(await coursesRes.json())
      if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json())
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
      if (invoicesRes.ok) setInvoices(await invoicesRes.json())
      if (profileRes.ok) setProfile(await profileRes.json())
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

  const user = session.data.user
  const presentDays = MOCK_ATTENDANCE.filter((a) => a.status === 'present').length
  const totalDays = MOCK_ATTENDANCE.length
  const avgScore = Math.round(MOCK_RESULTS.reduce((s, r) => s + r.score, 0) / MOCK_RESULTS.length)
  const totalDue = enrollments.reduce((s, e) => s + e.dueAmount, 0)
  const totalPaid = enrollments.reduce((s, e) => s + e.paidAmount, 0)

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-lg font-bold text-foreground">
              {SITE.nameBn}
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">|</span>
            <span className="hidden text-sm font-medium text-brand sm:inline">শিক্ষার্থী প্যানেল</span>
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
        {/* Welcome */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-foreground">
            স্বাগতম, {user.name}!
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span>ফোন: {user.phoneNumber}</span>
            {user.studentId && <span>ID: {user.studentId}</span>}
            {totalDue > 0 && <span className="text-gold">বকেয়: ৳{totalDue.toLocaleString()}</span>}
          </div>
        </div>

        {/* Tab Navigation */}
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

        {/* Tab Content */}
        {tab === 'overview' && (
          <OverviewTab
            results={MOCK_RESULTS}
            attendance={MOCK_ATTENDANCE}
            enrollments={enrollments}
            totalDue={totalDue}
            totalPaid={totalPaid}
          />
        )}

        {tab === 'courses' && (
          <CoursesTab
            courses={courses}
            enrollments={enrollments}
            onRefresh={fetchData}
          />
        )}

        {tab === 'billing' && (
          <BillingTab
            enrollments={enrollments}
            payments={payments}
            invoices={invoices}
            onRefresh={fetchData}
          />
        )}

        {tab === 'account' && (
          <AccountTab
            profile={profile}
            onRefresh={fetchData}
          />
        )}

        {tab === 'admit-card' && (
          <AdmitCard user={user} enrollments={enrollments} />
        )}

        {tab === 'results' && <ResultsTable />}

        {tab === 'attendance' && <AttendanceView />}
      </div>
    </div>
  )
}

function OverviewTab({
  results,
  attendance,
  enrollments,
  totalDue,
  totalPaid,
}: {
  results: typeof MOCK_RESULTS
  attendance: typeof MOCK_ATTENDANCE
  enrollments: Enrollment[]
  totalDue: number
  totalPaid: number
}) {
  const presentDays = attendance.filter((a) => a.status === 'present').length
  const totalDays = attendance.length
  const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
  const activeEnrollments = enrollments.filter((e) => e.status === 'active' || e.status === 'approved')

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="সক্রিয় কোর্স" value={`${activeEnrollments.length}টি`} icon={GraduationCap} color="brand" />
        <StatCard label="গড় স্কোর" value={`${avgScore}%`} icon={BarChart3} color="green" />
        <StatCard label="মোট পেমেন্ট" value={`৳${totalPaid.toLocaleString()}`} icon={Wallet} color="green" />
        <StatCard label="বকেয়" value={totalDue > 0 ? `৳${totalDue.toLocaleString()}` : '০'} icon={Receipt} color={totalDue > 0 ? 'gold' : 'green'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">সর্বশেষ ফলাফল</h3>
          <div className="mt-3 space-y-2">
            {results.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{r.exam}</span>
                <span className="font-semibold text-brand">{r.score}/{r.total}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">সাম্প্রতিক উপস্থিতি</h3>
          <div className="mt-3 space-y-2">
            {attendance.slice(-5).reverse().map((a, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{a.date}</span>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {enrollments.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground">আমার এনরোলমেন্ট</h3>
          <div className="mt-3 space-y-3">
            {enrollments.slice(0, 3).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-foreground">{e.courseTitle || 'কোর্স'}</span>
                  <span className="ml-2 text-muted-foreground">({e.courseDuration || ''})</span>
                </div>
                <EnrollmentStatusBadge status={e.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CoursesTab({
  courses,
  enrollments,
  onRefresh,
}: {
  courses: Course[]
  enrollments: Enrollment[]
  onRefresh: () => void
}) {
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const enrolledCourseIds = enrollments.map((e) => e.courseId)

  async function handleEnroll(courseId: string) {
    setEnrolling(courseId)
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      if (res.ok) {
        setSuccess(courseId)
        onRefresh()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (error) {
      console.error('Enrollment failed:', error)
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Enrolled Courses */}
      {enrollments.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground mb-4">আমার কোর্সসমূহ</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <h4 className="font-heading font-bold text-foreground">{enrollment.courseTitle}</h4>
                  <EnrollmentStatusBadge status={enrollment.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{enrollment.courseDuration}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">মোট ফি:</span>
                    <span className="font-medium">৳{enrollment.totalFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">পরিশোধিত:</span>
                    <span className="font-medium text-green">৳{enrollment.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">বকেয়:</span>
                    <span className={`font-medium ${enrollment.dueAmount > 0 ? 'text-gold' : 'text-green'}`}>
                      ৳{enrollment.dueAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
                {enrollment.dueAmount > 0 && (
                  <Link
                    href="/dashboard?tab=billing"
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20"
                  >
                    <Wallet className="size-4" />
                    পেমেন্ট করুন
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      <div>
        <h3 className="font-heading text-lg font-bold text-foreground mb-4">উপলব্ধ কোর্সসমূহ</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.filter((c) => c.isActive).map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id)
            const isEnrolling = enrolling === course.id
            const justEnrolled = success === course.id

            return (
              <div key={course.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h4 className="font-heading font-bold text-foreground">{course.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{course.shortDescription || course.description}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">সময়কাল:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ফি:</span>
                    <span className="font-medium">৳{course.fee.toLocaleString()}</span>
                  </div>
                  {course.discountFee && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ছাড়ের পর:</span>
                      <span className="font-bold text-green">৳{course.discountFee.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                {isEnrolled ? (
                  <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green/10 px-3 py-2 text-sm font-medium text-green">
                    <CheckCircle2 className="size-4" />
                    এনরোলড
                  </div>
                ) : justEnrolled ? (
                  <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green/10 px-3 py-2 text-sm font-medium text-green">
                    <Check className="size-4" />
                    সফলভাবে এনরোল হয়েছে!
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={isEnrolling}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
                  >
                    {isEnrolling ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <GraduationCap className="size-4" />
                        এনরোল হন
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BillingTab({
  enrollments,
  payments,
  invoices,
  onRefresh,
}: {
  enrollments: Enrollment[]
  payments: Payment[]
  invoices: Invoice[]
  onRefresh: () => void
}) {
  const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [senderNumber, setSenderNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const activeEnrollment = enrollments.find((e) => e.id === selectedEnrollment)
  const enrollmentPayments = payments.filter((p) => p.enrollmentId === selectedEnrollment)

  const PAYMENT_NUMBERS = {
    bkash: '01784-176442',
    nagad: '01784-176442',
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBERS[paymentMethod])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handlePayment() {
    if (!selectedEnrollment || !paymentAmount || !transactionId || !senderNumber) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: selectedEnrollment,
          amount: parseInt(paymentAmount),
          method: paymentMethod,
          transactionId,
          senderNumber,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setShowPaymentModal(false)
        setPaymentAmount('')
        setTransactionId('')
        setSenderNumber('')
        onRefresh()
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="rounded-xl border border-green/30 bg-green/5 p-4 text-sm text-green flex items-center gap-2">
          <CheckCircle2 className="size-5" />
          পেমেন্ট রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে! যাচাইকরণের জন্য অপেক্ষা করুন।
        </div>
      )}

      {/* Enrollment Selector */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-3">কোর্স নির্বাচন করুন</h3>
        <div className="space-y-2">
          {enrollments.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEnrollment(e.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                selectedEnrollment === e.id
                  ? 'border-brand bg-brand/5'
                  : 'border-border hover:border-brand/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{e.courseTitle}</p>
                  <p className="text-sm text-muted-foreground">{e.courseDuration}</p>
                </div>
                <EnrollmentStatusBadge status={e.status} />
              </div>
              <div className="mt-2 flex gap-4 text-sm">
                <span>ফি: ৳{e.totalFee.toLocaleString()}</span>
                <span className="text-green">পরিশোধ: ৳{e.paidAmount.toLocaleString()}</span>
                <span className={e.dueAmount > 0 ? 'text-gold font-medium' : 'text-green'}>বকেয়: ৳{e.dueAmount.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Actions */}
      {activeEnrollment && activeEnrollment.dueAmount > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-3">পেমেন্ট করুন</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => { setPaymentMethod('bkash'); setShowPaymentModal(true) }}
              className="flex items-center gap-3 rounded-xl border border-[#E2136E]/30 bg-[#E2136E]/5 p-4 transition-colors hover:bg-[#E2136E]/10"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#E2136E]/10 text-[#E2136E]">
                <Phone className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">bKash দিয়ে পেমেন্ট</p>
                <p className="text-xs text-muted-foreground">সেন্ড মানি করুন</p>
              </div>
            </button>
            <button
              onClick={() => { setPaymentMethod('nagad'); setShowPaymentModal(true) }}
              className="flex items-center gap-3 rounded-xl border border-[#F6921E]/30 bg-[#F6921E]/5 p-4 transition-colors hover:bg-[#F6921E]/10"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#F6921E]/10 text-[#F6921E]">
                <Phone className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Nagad দিয়ে পেমেন্ট</p>
                <p className="text-xs text-muted-foreground">সেন্ড মানি করুন</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-secondary/30 px-5 py-3">
            <h3 className="font-heading text-base font-bold text-foreground">পেমেন্ট ইতিহাস</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">তারিখ</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">পরিমাণ</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">মাধ্যম</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">ট্রানজেকশন ID</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">
                      {new Date(p.paidAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">৳{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3"><MethodBadge method={p.method} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.transactionId}</td>
                    <td className="px-4 py-3 text-center"><PaymentStatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice History */}
      {invoices.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-secondary/30 px-5 py-3">
            <h3 className="font-heading text-base font-bold text-foreground">ইনভয়েস</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">ইনভয়েস নম্বর</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">পরিমাণ</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">পরিশোধিত</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">বকেয়</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">স্ট্যাটাস</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && activeEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-foreground">
                {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} পেমেন্ট
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="size-5" />
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-dashed border-border bg-secondary/30 p-4">
              <p className="text-sm font-medium text-foreground mb-2">পেমেন্ট নম্বর:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-card px-3 py-2 font-mono text-lg font-bold text-foreground">
                  {PAYMENT_NUMBERS[paymentMethod]}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg bg-brand/10 px-3 py-2 text-sm font-medium text-brand hover:bg-brand/20"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? 'কপি!' : 'কপি'}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} অ্যাপ থেকে এই নম্বরে সেন্ড মানি করুন
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">পরিমাণ (৳)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="যেমন: ৫০০০"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">ট্রানজেকশন ID</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="যেমন: 8A3B4C5D6E"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">প্রেরক নম্বর</label>
                <input
                  type="tel"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="যেমন: 01XXXXXXXXX"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                বাতিল
              </button>
              <button
                onClick={handlePayment}
                disabled={!paymentAmount || !transactionId || !senderNumber || submitting}
                className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="mx-auto size-5 animate-spin" /> : 'পেমেন্ট জমা দিন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AccountTab({
  profile,
  onRefresh,
}: {
  profile: UserProfile | null
  onRefresh: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    address: profile?.address || '',
    dateOfBirth: profile?.dateOfBirth || '',
    guardianName: profile?.guardianName || '',
    guardianPhone: profile?.guardianPhone || '',
    institution: profile?.institution || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  async function handleSaveProfile() {
    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setEditing(false)
        setSuccess('প্রোফাইল আপডেট হয়েছে!')
        onRefresh()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('নতুন পাসওয়ার্ড মিলেনি!')
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে!')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      if (res.ok) {
        setChangingPassword(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setSuccess('পাসওয়ার্ড পরিবর্তন হয়েছে!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        alert('বর্তমান পাসওয়ার্ড ভুল!')
      }
    } catch (error) {
      console.error('Failed to change password:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="rounded-xl border border-green/30 bg-green/5 p-4 text-sm text-green flex items-center gap-2">
          <CheckCircle2 className="size-5" />
          {success}
        </div>
      )}

      {/* Profile Info */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base font-bold text-foreground">প্রোফাইল তথ্য</h3>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm font-medium text-brand hover:text-brand/80"
          >
            {editing ? 'বাতিল' : 'সম্পাদনা'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">নাম</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">ইমেইল</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">ঠিকানা</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">জন্ম তারিখ</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">প্রতিষ্ঠান</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">অভিভাবকের নাম</label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">অভিভাবকের ফোন</label>
                <input
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="mx-auto size-5 animate-spin" /> : 'সংরক্ষণ করুন'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow icon={UserCog} label="নাম" value={profile?.name || '—'} />
            <InfoRow icon={Phone} label="ফোন" value={profile?.phoneNumber || '—'} />
            <InfoRow icon={Mail} label="ইমেইল" value={profile?.email || '—'} />
            <InfoRow icon={BookOpen} label="শিক্ষার্থী ID" value={profile?.studentId || '—'} />
            <InfoRow icon={MapPin} label="ঠিকানা" value={profile?.address || '—'} />
            <InfoRow icon={Calendar} label="জন্ম তারিখ" value={profile?.dateOfBirth || '—'} />
            <InfoRow icon={GraduationCap} label="প্রতিষ্ঠান" value={profile?.institution || '—'} />
            <InfoRow icon={UserCog} label="অভিভাবক" value={profile?.guardianName || '—'} />
            <InfoRow icon={Phone} label="অভিভাবকের ফোন" value={profile?.guardianPhone || '—'} />
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base font-bold text-foreground">পাসওয়ার্ড পরিবর্তন</h3>
          <button
            onClick={() => setChangingPassword(!changingPassword)}
            className="text-sm font-medium text-brand hover:text-brand/80"
          >
            {changingPassword ? 'বাতিল' : 'পরিবর্তন'}
          </button>
        </div>

        {changingPassword ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">বর্তমান পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-10 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">নতুন পাসওয়ার্ড</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 pr-10 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">পাসওয়ার্ড নিশ্চিত করুন</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-xs text-destructive">পাসওয়ার্ড মিলেনি</p>
            )}
            <button
              onClick={handleChangePassword}
              disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="mx-auto size-5 animate-spin" /> : 'পাসওয়ার্ড আপডেট করুন'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">পাসওয়ার্ড পরিবর্তন করতে উপরের বোতামে ক্লিক করুন।</p>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function AdmitCard({ user, enrollments }: { user: { name: string; phoneNumber?: string | null; studentId?: string | null }; enrollments: Enrollment[] }) {
  const activeEnrollment = enrollments.find((e) => e.status === 'active' || e.status === 'approved')

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="bg-brand p-4 text-center text-brand-foreground">
          <h3 className="font-heading text-lg font-bold">{SITE.nameBn}</h3>
          <p className="text-xs opacity-80">নার্সিং ভর্তি কোচিং, {SITE.city}</p>
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
              <span className="font-semibold text-foreground">{user.studentId || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ফোন</span>
              <span className="font-semibold text-foreground">{user.phoneNumber || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">কোর্স</span>
              <span className="font-semibold text-foreground">{activeEnrollment?.courseTitle || 'নার্সিং অ্যাডমিশন কোচিং'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">পরীক্ষা</span>
              <span className="font-semibold text-foreground">মডেল টেস্ট #৪</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">তারিখ</span>
              <span className="font-semibold text-foreground">৯ আগস্ট ২০২৬</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">সময়</span>
              <span className="font-semibold text-foreground">সকাল ১০:০০ — ১১:০০</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">কেন্দ্র</span>
              <span className="font-semibold text-foreground">কর্নিয়া নার্সিং কোচিং, খুলনা</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            <AlertCircle className="mx-auto mb-1 size-4" />
            পরীক্ষার দিন এডমিট কার্ড ও জাতীয় পরিচয়পত্র সাথে আনতে হবে।
          </div>
        </div>

        <div className="border-t border-border bg-secondary/20 px-6 py-3 text-center text-xs text-muted-foreground">
          {SITE.nameBn} · {SITE.phone}
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

function ResultsTable() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">পরীক্ষা</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">তারিখ</th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">স্কোর</th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">র‍্যাঙ্ক</th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">পারফরম্যান্স</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_RESULTS.map((r, i) => {
              const pct = Math.round((r.score / r.total) * 100)
              return (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{r.exam}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-3 text-center font-bold text-foreground">{r.score}/{r.total}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.rank <= 5 ? 'bg-green/10 text-green' : r.rank <= 15 ? 'bg-brand/10 text-brand' : 'bg-secondary text-muted-foreground'
                    }`}>
                      #{r.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="mx-auto flex w-full max-w-[100px] items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 80 ? 'bg-green' : pct >= 60 ? 'bg-brand' : 'bg-gold'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AttendanceView() {
  const presentDays = MOCK_ATTENDANCE.filter((a) => a.status === 'present').length
  const lateDays = MOCK_ATTENDANCE.filter((a) => a.status === 'late').length
  const absentDays = MOCK_ATTENDANCE.filter((a) => a.status === 'absent').length
  const totalDays = MOCK_ATTENDANCE.length
  const pct = Math.round(((presentDays + lateDays) / totalDays) * 100)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-green">{presentDays}</p>
          <p className="text-xs text-muted-foreground">উপস্থিত</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-gold">{lateDays}</p>
          <p className="text-xs text-muted-foreground">বিলম্বিত</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-destructive">{absentDays}</p>
          <p className="text-xs text-muted-foreground">অনুপস্থিত</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-bold text-foreground">সর্বমোট উপস্থিতি</h3>
          <span className="text-2xl font-bold text-brand">{pct}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {totalDays} দিনের মধ্যে {presentDays + lateDays} দিন উপস্থিত
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">তারিখ</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">সময়</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ATTENDANCE.map((a, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{a.date}</td>
                  <td className="px-4 py-3 text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {a.time}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={a.status} />
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

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
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
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}