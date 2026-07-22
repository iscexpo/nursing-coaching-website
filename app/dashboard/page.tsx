'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { useSiteData } from '@/hooks/use-site-data'
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
import type {
  Course,
  Enrollment,
  Payment,
  Invoice,
  UserProfile,
  ExamSubmission,
  AttendanceRecord,
  AdmitCard,
  LifecycleEvent,
} from './components/types'

const TABS = [
  { id: 'overview', icon: LayoutDashboard },
  { id: 'courses', icon: GraduationCap },
  { id: 'billing', icon: Receipt },
  { id: 'account', icon: UserCog },
  { id: 'admit-card', icon: CreditCard },
  { id: 'results', icon: BarChart3 },
  { id: 'attendance', icon: CalendarCheck },
] as const

type TabId = (typeof TABS)[number]['id']

export default function DashboardPage() {
  const router = useRouter()
  const session = authClient.useSession()
  const site = useSiteData()
  const t = useTranslations('dashboard')
  const tc = useTranslations('common')
  const [tab, setTab] = useState<TabId>('overview')
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([])
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [
        coursesRes,
        enrollmentsRes,
        paymentsRes,
        invoicesRes,
        profileRes,
        submissionsRes,
        attendanceRes,
        admitCardsRes,
        lifecycleRes,
      ] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/enrollments'),
        fetch('/api/payments'),
        fetch('/api/invoices'),
        fetch('/api/account/profile'),
        fetch('/api/exam-submissions'),
        fetch('/api/attendance'),
        fetch('/api/admit-cards'),
        fetch('/api/lifecycle-events'),
      ])
      if (coursesRes.ok) {
        const d = await coursesRes.json()
        setCourses(d.data || d)
      }
      if (enrollmentsRes.ok) {
        const d = await enrollmentsRes.json()
        setEnrollments(d.data || d)
      }
      if (paymentsRes.ok) {
        const d = await paymentsRes.json()
        setPayments(d.data || d)
      }
      if (invoicesRes.ok) {
        const d = await invoicesRes.json()
        setInvoices(d.data || d)
      }
      if (profileRes.ok) {
        const d = await profileRes.json()
        setProfile(d.data || d)
      }
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
      if (lifecycleRes.ok) {
        const data = await lifecycleRes.json()
        setLifecycleEvents(data.data || data)
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
          <p className="text-muted-foreground">{tc('loading')}</p>
        </div>
      </div>
    )
  }

  if (!session.data) {
    router.push('/auth/sign-in')
    return null
  }

  const user = session.data.user as Record<string, unknown> & { name: string; phoneNumber?: string | null }
  const totalDue = enrollments.reduce((s, e) => s + e.dueAmount, 0)
  const totalPaid = enrollments.reduce((s, e) => s + e.paidAmount, 0)

  const welcomeParts = user.phoneNumber ? [`${tc('phone')}: ${user.phoneNumber}`] : []
  if (user.studentId) welcomeParts.push(`ID: ${user.studentId}`)
  if (totalDue > 0) welcomeParts.push(`${t('overview.dueLabel')}: ৳${totalDue.toLocaleString()}`)

  return (
    <PanelLayout
      siteName={site.nameBn}
      panelTitle={t('panelTitle')}
      userName={user.name}
      welcomeMessage={welcomeParts.join(' | ')}
      tabs={
        TABS.map((tabItem) => ({
          ...tabItem,
          label: t(`tabs.${tabItem.id}`),
        })) as {
          id: string
          label: string
          icon: React.ElementType
        }[]
      }
      activeTab={tab}
      onTabChange={(id) => setTab(id as TabId)}
      onSignOut={handleSignOut}
    >
      {tab === 'overview' && (
        <OverviewTab
          examSubmissions={examSubmissions}
          attendance={attendance}
          enrollments={enrollments}
          lifecycleEvents={lifecycleEvents}
          totalDue={totalDue}
          totalPaid={totalPaid}
        />
      )}
      {tab === 'courses' && (
        <CourseSection
          courses={courses}
          enrollments={enrollments}
          onRefresh={fetchData}
        />
      )}
      {tab === 'billing' && (
        <BillingSection
          enrollments={enrollments}
          payments={payments}
          invoices={invoices}
          onRefresh={fetchData}
        />
      )}
      {tab === 'account' && (
        <AccountSection profile={profile} onRefresh={fetchData} />
      )}
      {tab === 'admit-card' && (
        <AdmitCardSection
          user={user}
          enrollments={enrollments}
          admitCards={admitCards}
        />
      )}
      {tab === 'results' && <ResultsTable examSubmissions={examSubmissions} />}
      {tab === 'attendance' && <AttendanceView attendance={attendance} />}
    </PanelLayout>
  )
}
