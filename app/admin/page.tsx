'use client'

import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { useSiteData } from '@/hooks/use-site-data'
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
  Presentation,
  Image,
  MessageSquare,
} from 'lucide-react'

import { PanelLayout } from '@/components/ui/panel-layout'
import { OverviewPanel } from './components/overview-tab'
import type { Course, Enrollment, Payment, Invoice, Notice, Exam, ContactInquiry, NotificationRecord, ExamSubmission, AttendanceRecord, AdmitCard, Student, Teacher, MediaFile, Subject } from './components/types'

const CoursesPanel = lazy(() => import('./components/courses-tab').then((m) => ({ default: m.CoursesPanel })))
const EnrollmentsPanel = lazy(() => import('./components/enrollments-tab').then((m) => ({ default: m.EnrollmentsPanel })))
const PaymentsPanel = lazy(() => import('./components/payments-tab').then((m) => ({ default: m.PaymentsPanel })))
const InvoicesPanel = lazy(() => import('./components/invoices-tab').then((m) => ({ default: m.InvoicesPanel })))
const NoticesPanel = lazy(() => import('./components/notices-tab').then((m) => ({ default: m.NoticesPanel })))
const MediaPanel = lazy(() => import('./components/media-tab').then((m) => ({ default: m.MediaPanel })))
const ExamsPanel = lazy(() => import('./components/exams-tab').then((m) => ({ default: m.ExamsPanel })))
const QuestionsPanel = lazy(() => import('./components/questions-tab').then((m) => ({ default: m.QuestionsPanel })))
const ResultsPanel = lazy(() => import('./components/results-tab').then((m) => ({ default: m.ResultsPanel })))
const StudentsPanel = lazy(() => import('./components/students-tab').then((m) => ({ default: m.StudentsPanel })))
const TeachersPanel = lazy(() => import('./components/teachers-tab').then((m) => ({ default: m.TeachersPanel })))
const AttendancePanel = lazy(() => import('./components/attendance-tab').then((m) => ({ default: m.AttendancePanel })))
const AdmitCardsPanel = lazy(() => import('./components/admit-cards-tab').then((m) => ({ default: m.AdmitCardsPanel })))
const ContactsPanel = lazy(() => import('./components/contacts-tab').then((m) => ({ default: m.ContactsPanel })))
const NotificationsPanel = lazy(() => import('./components/notifications-tab').then((m) => ({ default: m.NotificationsPanel })))
const SettingsPanel = lazy(() => import('./components/settings-tab').then((m) => ({ default: m.SettingsPanel })))
const SubjectsPanel = lazy(() => import('./components/subjects-tab').then((m) => ({ default: m.SubjectsPanel })))
const SmsPanel = lazy(() => import('./components/sms-tab').then((m) => ({ default: m.SmsPanel })))

const TABS = [
  { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
  { id: 'courses', label: 'কোর্স', icon: GraduationCap },
  { id: 'enrollments', label: 'এনরোলমেন্ট', icon: BookOpen },
  { id: 'payments', label: 'পেমেন্ট', icon: Wallet },
  { id: 'invoices', label: 'ইনভয়েস', icon: Receipt },
  { id: 'notices', label: 'নোটিশ', icon: Megaphone },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'media', label: 'মিডিয়া', icon: Image },
  { id: 'exams', label: 'পরীক্ষা', icon: FileText },
  { id: 'subjects', label: 'বিষয়', icon: BookOpen },
  { id: 'questions', label: 'প্রশ্নব্যাংক', icon: HelpCircle },
  { id: 'results', label: 'ফলাফল', icon: BarChart3 },
  { id: 'teachers', label: 'শিক্ষক', icon: Presentation },
  { id: 'students', label: 'শিক্ষার্থী', icon: Users },
  { id: 'attendance', label: 'উপস্থিতি', icon: CalendarCheck },
  { id: 'admit-cards', label: 'এডমিট কার্ড', icon: CreditCard },
  { id: 'contacts', label: 'যোগাযোগ', icon: Users },
  { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell },
  { id: 'settings', label: 'সেটিংস', icon: BarChart3 },
] as const

type TabId = (typeof TABS)[number]['id']

const TAB_FETCH_MAP: Record<string, string[]> = {
  overview: ['courses', 'enrollments', 'payments'],
  courses: ['courses'],
  enrollments: ['enrollments', 'courses', 'students'],
  payments: ['payments', 'enrollments', 'students'],
  invoices: ['invoices', 'enrollments'],
  notices: ['notices'],
  sms: [],
  media: ['media'],
  exams: ['exams', 'submissions'],
  questions: ['exams'],
  results: ['exams', 'submissions'],
  students: ['students'],
  teachers: ['teachers'],
  attendance: ['enrollments', 'attendance'],
  'admit-cards': ['enrollments', 'exams', 'admitCards'],
  contacts: ['contacts'],
  notifications: ['notifications'],
  settings: [],
  subjects: ['subjects'],
}

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-secondary" />
      <div className="h-64 rounded-2xl bg-secondary/50" />
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const session = authClient.useSession()
  const site = useSiteData()
  const [tab, setTab] = useState<TabId>('overview')
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [contacts, setContacts] = useState<ContactInquiry[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjectsList, setSubjectsList] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (tabId?: string) => {
    try {
      const activeTab = tabId || tab

      const fetches: Promise<Response>[] = []
      const fetchKeys: string[] = []

      const needed = TAB_FETCH_MAP[activeTab] || ['overview']

      if (needed.includes('courses')) { fetches.push(fetch('/api/courses')); fetchKeys.push('courses') }
      if (needed.includes('enrollments')) { fetches.push(fetch('/api/enrollments')); fetchKeys.push('enrollments') }
      if (needed.includes('payments')) { fetches.push(fetch('/api/payments')); fetchKeys.push('payments') }
      if (needed.includes('invoices')) { fetches.push(fetch('/api/invoices')); fetchKeys.push('invoices') }
      if (needed.includes('notices')) { fetches.push(fetch('/api/notices')); fetchKeys.push('notices') }
      if (needed.includes('media')) { fetches.push(fetch('/api/media')); fetchKeys.push('media') }
      if (needed.includes('exams')) { fetches.push(fetch('/api/exams')); fetchKeys.push('exams') }
      if (needed.includes('contacts')) { fetches.push(fetch('/api/contact')); fetchKeys.push('contacts') }
      if (needed.includes('notifications')) { fetches.push(fetch('/api/notifications')); fetchKeys.push('notifications') }
      if (needed.includes('submissions')) { fetches.push(fetch('/api/exam-submissions')); fetchKeys.push('submissions') }
      if (needed.includes('attendance')) { fetches.push(fetch('/api/attendance')); fetchKeys.push('attendance') }
      if (needed.includes('admitCards')) { fetches.push(fetch('/api/admit-cards')); fetchKeys.push('admitCards') }
      if (needed.includes('students')) { fetches.push(fetch('/api/students')); fetchKeys.push('students') }
      if (needed.includes('teachers')) { fetches.push(fetch('/api/teachers')); fetchKeys.push('teachers') }
      if (needed.includes('subjects')) { fetches.push(fetch('/api/subjects')); fetchKeys.push('subjects') }

      const responses = await Promise.all(fetches)

      for (let i = 0; i < responses.length; i++) {
        const res = responses[i]
        const key = fetchKeys[i]
        if (res.ok) {
          const d = await res.json()
          const data = d.data || d
          switch (key) {
            case 'courses': setCourses(data); break
            case 'enrollments': setEnrollments(data); break
            case 'payments': setPayments(data); break
            case 'invoices': setInvoices(data); break
            case 'notices': setNotices(data); break
            case 'media': setMediaFiles(data); break
            case 'exams': setExams(data); break
            case 'contacts': setContacts(data); break
            case 'notifications': setNotifications(data); break
            case 'submissions': setExamSubmissions(data); break
            case 'attendance': setAttendance(data); break
            case 'admitCards': setAdmitCards(data); break
            case 'students': setStudents(data); break
            case 'teachers': setTeachers(data); break
            case 'subjects': setSubjectsList(data); break
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    if (session.data) fetchData(tab)
  }, [session.data, fetchData, tab])

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
      siteName={site.nameBn}
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
      <Suspense fallback={<TabSkeleton />}>
        {tab === 'courses' && <CoursesPanel courses={courses} onRefresh={fetchData} />}
        {tab === 'enrollments' && <EnrollmentsPanel enrollments={enrollments} onRefresh={fetchData} />}
        {tab === 'payments' && <PaymentsPanel payments={payments} enrollments={enrollments} students={students} onRefresh={fetchData} />}
        {tab === 'invoices' && <InvoicesPanel invoices={invoices} enrollments={enrollments} onRefresh={fetchData} />}
        {tab === 'notices' && <NoticesPanel notices={notices} onRefresh={fetchData} />}
        {tab === 'sms' && <SmsPanel />}
        {tab === 'media' && <MediaPanel mediaFiles={mediaFiles} onRefresh={fetchData} />}
        {tab === 'exams' && <ExamsPanel exams={exams} submissions={examSubmissions} onRefresh={fetchData} />}
        {tab === 'questions' && <QuestionsPanel exams={exams} />}
        {tab === 'subjects' && <SubjectsPanel subjects={subjectsList} onRefresh={fetchData} />}
        {tab === 'results' && <ResultsPanel exams={exams} submissions={examSubmissions} />}
        {tab === 'students' && <StudentsPanel students={students} onRefresh={fetchData} />}
        {tab === 'teachers' && <TeachersPanel teachers={teachers} onRefresh={fetchData} />}
        {tab === 'attendance' && <AttendancePanel enrollments={enrollments} attendance={attendance} onRefresh={fetchData} />}
        {tab === 'admit-cards' && <AdmitCardsPanel enrollments={enrollments} exams={exams} admitCards={admitCards} onRefresh={fetchData} />}
        {tab === 'contacts' && <ContactsPanel contacts={contacts} onRefresh={fetchData} />}
        {tab === 'notifications' && <NotificationsPanel notifications={notifications} onRefresh={fetchData} />}
        {tab === 'settings' && <SettingsPanel onRefresh={fetchData} />}
      </Suspense>
    </PanelLayout>
  )
}
