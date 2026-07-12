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
import type { Course, Enrollment, Payment, Invoice, UserProfile, ExamSubmission, AttendanceRecord, AdmitCard } from './components/types'

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

export default function DashboardPage() {
  const router = useRouter()
  const session = authClient.useSession()
  const [tab, setTab] = useState<TabId>('overview')
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, enrollmentsRes, paymentsRes, invoicesRes, profileRes, submissionsRes, attendanceRes, admitCardsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/enrollments'),
        fetch('/api/payments'),
        fetch('/api/invoices'),
        fetch('/api/account/profile'),
        fetch('/api/exam-submissions'),
        fetch('/api/attendance'),
        fetch('/api/admit-cards'),
      ])
      if (coursesRes.ok) setCourses(await coursesRes.json())
      if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json())
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
      if (invoicesRes.ok) setInvoices(await invoicesRes.json())
      if (profileRes.ok) setProfile(await profileRes.json())
      if (submissionsRes.ok) {
        const data = await submissionsRes.json()
        setExamSubmissions(data.data || data)
      }
      if (attendanceRes.ok) {
        const data = await attendanceRes.json()
        setAttendance(data.data || data)
      }
      if (admitCardsRes.ok) {
        const data = await admitCardsRes.json()
        setAdmitCards(data.data || data)
      }
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
        <OverviewTab examSubmissions={examSubmissions} attendance={attendance} enrollments={enrollments} totalDue={totalDue} totalPaid={totalPaid} />
      )}
      {tab === 'courses' && <CourseSection courses={courses} enrollments={enrollments} onRefresh={fetchData} />}
      {tab === 'billing' && <BillingSection enrollments={enrollments} payments={payments} invoices={invoices} onRefresh={fetchData} />}
      {tab === 'account' && <AccountSection profile={profile} onRefresh={fetchData} />}
      {tab === 'admit-card' && <AdmitCardSection user={user} enrollments={enrollments} admitCards={admitCards} />}
      {tab === 'results' && <ResultsTable examSubmissions={examSubmissions} />}
      {tab === 'attendance' && <AttendanceView attendance={attendance} />}
    </PanelLayout>
  )
}
