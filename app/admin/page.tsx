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
  Bell,
  CalendarCheck,
  CreditCard,
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
import { NotificationsPanel } from './components/notifications-tab'
import { AttendancePanel } from './components/attendance-tab'
import { AdmitCardsPanel } from './components/admit-cards-tab'
import { SettingsPanel } from './components/settings-tab'
import type { Course, Enrollment, Payment, Invoice, Notice, Exam, ContactInquiry, NotificationRecord, ExamSubmission, AttendanceRecord, AdmitCard, Student } from './components/types'

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
  { id: 'attendance', label: 'উপস্থিতি', icon: CalendarCheck },
  { id: 'admit-cards', label: 'এডমিট কার্ড', icon: CreditCard },
  { id: 'contacts', label: 'যোগাযোগ', icon: Users },
  { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell },
  { id: 'settings', label: 'সেটিংস', icon: BarChart3 },
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
  const [notices, setNotices] = useState<Notice[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [contacts, setContacts] = useState<ContactInquiry[]>([])
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, enrollmentsRes, paymentsRes, invoicesRes, noticesRes, examsRes, contactsRes, notificationsRes, submissionsRes, attendanceRes, admitCardsRes, studentsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/enrollments'),
        fetch('/api/payments'),
        fetch('/api/invoices'),
        fetch('/api/notices'),
        fetch('/api/exams'),
        fetch('/api/contact'),
        fetch('/api/notifications'),
        fetch('/api/exam-submissions'),
        fetch('/api/attendance'),
        fetch('/api/admit-cards'),
        fetch('/api/students'),
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
      if (noticesRes.ok) {
        const d = await noticesRes.json()
        setNotices(d.data || d)
      }
      if (examsRes.ok) {
        const d = await examsRes.json()
        setExams(d.data || d)
      }
      if (contactsRes.ok) {
        const d = await contactsRes.json()
        setContacts(d.data || d)
      }
      if (notificationsRes.ok) {
        const d = await notificationsRes.json()
        setNotifications(d.data || d)
      }
      if (submissionsRes.ok) {
        const d = await submissionsRes.json()
        setExamSubmissions(d.data || d)
      }
      if (attendanceRes.ok) {
        const d = await attendanceRes.json()
        setAttendance(d.data || d)
      }
      if (admitCardsRes.ok) {
        const d = await admitCardsRes.json()
        setAdmitCards(d.data || d)
      }
      if (studentsRes.ok) {
        const d = await studentsRes.json()
        setStudents(d.data || d)
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

  if (session.data.user.role !== 'admin' && session.data.user.role !== 'super-admin') {
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
      {tab === 'payments' && <PaymentsPanel payments={payments} enrollments={enrollments} students={students} onRefresh={fetchData} />}
      {tab === 'invoices' && <InvoicesPanel invoices={invoices} enrollments={enrollments} onRefresh={fetchData} />}
      {tab === 'notices' && <NoticesPanel notices={notices} onRefresh={fetchData} />}
      {tab === 'exams' && <ExamsPanel exams={exams} submissions={examSubmissions} onRefresh={fetchData} />}
      {tab === 'questions' && <QuestionsPanel exams={exams} />}
      {tab === 'results' && <ExamsPanel exams={exams} submissions={examSubmissions} onRefresh={fetchData} />}
      {tab === 'students' && <StudentsPanel students={students} onRefresh={fetchData} />}
      {tab === 'attendance' && <AttendancePanel enrollments={enrollments} attendance={attendance} onRefresh={fetchData} />}
      {tab === 'admit-cards' && <AdmitCardsPanel enrollments={enrollments} exams={exams} admitCards={admitCards} onRefresh={fetchData} />}
      {tab === 'contacts' && <ContactsPanel contacts={contacts} onRefresh={fetchData} />}
      {tab === 'notifications' && <NotificationsPanel notifications={notifications} onRefresh={fetchData} />}
      {tab === 'settings' && <SettingsPanel onRefresh={fetchData} />}
    </PanelLayout>
  )
}
