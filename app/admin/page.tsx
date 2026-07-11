'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { SITE } from '@/lib/site-data'
import { Loader2 } from 'lucide-react'
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Wallet,
  Receipt,
  Megaphone,
  FileText,
  HelpCircle,
  BarChart3,
  Users,
} from 'lucide-react'

import { PanelLayout } from '@/components/ui/panel-layout'
import { OverviewPanel } from './components/overview-tab'
import { StudentsPanel } from './components/students-tab'
import { EnrollmentsPanel } from './components/enrollments-tab'
import { PaymentsPanel } from './components/payments-tab'
import { InvoicesPanel } from './components/invoices-tab'
import { CoursesPanel } from './components/courses-tab'
import { NoticesPanel } from './components/notices-tab'
import { ExamsPanel } from './components/exams-tab'
import { QuestionsPanel } from './components/questions-tab'
import { ContactsPanel } from './components/contacts-tab'
import type { Course, Enrollment, Payment, Invoice } from './components/types'

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
  { id: 'contacts', label: 'যোগাযোগ', icon: Users },
] as const

type TabId = (typeof TABS)[number]['id']

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

  const tabsWithBadges = TABS.map((t) => ({
    ...t,
    badge: t.id === 'enrollments' ? pendingEnrollments : t.id === 'payments' ? pendingPayments : undefined,
  }))

  return (
    <PanelLayout
      siteName={SITE.nameBn}
      panelTitle="অ্যাডমিন প্যানেল"
      userName={session.data.user.name}
      welcomeMessage="অ্যাডমিন হিসেবে লগইন করেছেন"
      tabs={tabsWithBadges}
      activeTab={tab}
      onTabChange={(id) => setTab(id as TabId)}
      onSignOut={handleSignOut}
    >
      {tab === 'overview' && (
        <OverviewPanel courses={courses} enrollments={enrollments} payments={payments} />
      )}
      {tab === 'courses' && <CoursesPanel courses={courses} onRefresh={fetchData} />}
      {tab === 'enrollments' && <EnrollmentsPanel enrollments={enrollments} onRefresh={fetchData} />}
      {tab === 'payments' && <PaymentsPanel payments={payments} onRefresh={fetchData} />}
      {tab === 'invoices' && <InvoicesPanel invoices={invoices} enrollments={enrollments} onRefresh={fetchData} />}
      {tab === 'notices' && <NoticesPanel />}
      {tab === 'exams' && <ExamsPanel />}
      {tab === 'questions' && <QuestionsPanel />}
      {tab === 'results' && <ExamsPanel />}
      {tab === 'students' && <StudentsPanel enrollments={enrollments} />}
      {tab === 'contacts' && <ContactsPanel />}
    </PanelLayout>
  )
}
