'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { SITE } from '@/lib/site-data'
import {
  LayoutDashboard,
  GraduationCap,
  Receipt,
  UserCog,
  CreditCard,
  BarChart3,
  CalendarCheck,
  Loader2,
} from 'lucide-react'
import { PanelLayout } from '@/components/ui/panel-layout'
import { OverviewTab } from './components/overview-tab'
import { CourseSection } from './components/course-tab'
import { BillingSection } from './components/billing-tab'
import { AccountSection } from './components/account-tab'
import { AdmitCardSection } from './components/admit-card-tab'
import { ResultsTable } from './components/results-tab'
import { AttendanceView } from './components/attendance-tab'
import type { Course, Enrollment, Payment, Invoice, UserProfile, MockResult, MockAttendance } from './components/types'

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

const MOCK_RESULTS: MockResult[] = [
  { exam: 'মডেল টেস্ট #১', date: '১২ জুলাই ২০২৬', score: 78, total: 100, rank: 12 },
  { exam: 'মডেল টেস্ট #২', date: '১৯ জুলাই ২০২৬', score: 85, total: 100, rank: 8 },
  { exam: 'মডেল টেস্ট #৩', date: '২৬ জুলাই ২০২৬', score: 72, total: 100, rank: 18 },
  { exam: 'সাপ্তাহিক পরীক্ষা', date: '০২ আগস্ট ২০২৬', score: 91, total: 100, rank: 3 },
]

const MOCK_ATTENDANCE: MockAttendance[] = [
  { date: '১০ জুলাই', status: 'present', time: 'সকাল ১০:০০' },
  { date: '১১ জুলাই', status: 'present', time: 'সকাল ১০:০০' },
  { date: '১২ জুলাই', status: 'absent', time: '—' },
  { date: '১৩ জুলাই', status: 'present', time: 'সকাল ১০:০০' },
  { date: '১৪ জুলাই', status: 'present', time: 'সকাল ১০:০০' },
  { date: '১৫ জুলাই', status: 'late', time: 'সকাল ১০:১৫' },
  { date: '১৬ জুলাই', status: 'present', time: 'সকাল ১০:০০' },
  { date: '১৭ জুলাই', status: 'present', time: 'সকাল ১০:০০' },
  { date: '১৮ জুলাই', status: 'absent', time: '—' },
  { date: '১৯ জুলাই', status: 'present', time: 'সকাল ১০:০০' },
]

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
  const totalDue = enrollments.reduce((s, e) => s + e.dueAmount, 0)
  const totalPaid = enrollments.reduce((s, e) => s + e.paidAmount, 0)

  const welcomeParts = [`ফোন: ${user.phoneNumber}`]
  if (user.studentId) welcomeParts.push(`ID: ${user.studentId}`)
  if (totalDue > 0) welcomeParts.push(`বকেয়: ৳${totalDue.toLocaleString()}`)

  return (
    <PanelLayout
      siteName={SITE.nameBn}
      panelTitle="শিক্ষার্থী প্যানেল"
      userName={user.name}
      welcomeMessage={welcomeParts.join(' | ')}
      tabs={TABS as unknown as { id: string; label: string; icon: React.ElementType }[]}
      activeTab={tab}
      onTabChange={(id) => setTab(id as TabId)}
      onSignOut={handleSignOut}
    >
      {tab === 'overview' && (
        <OverviewTab results={MOCK_RESULTS} attendance={MOCK_ATTENDANCE} enrollments={enrollments} totalDue={totalDue} totalPaid={totalPaid} />
      )}
      {tab === 'courses' && <CourseSection courses={courses} enrollments={enrollments} onRefresh={fetchData} />}
      {tab === 'billing' && <BillingSection enrollments={enrollments} payments={payments} invoices={invoices} onRefresh={fetchData} />}
      {tab === 'account' && <AccountSection profile={profile} onRefresh={fetchData} />}
      {tab === 'admit-card' && <AdmitCardSection user={user} enrollments={enrollments} />}
      {tab === 'results' && <ResultsTable results={MOCK_RESULTS} />}
      {tab === 'attendance' && <AttendanceView attendance={MOCK_ATTENDANCE} />}
    </PanelLayout>
  )
}
