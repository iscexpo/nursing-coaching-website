'use client'

import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { useSiteData } from '@/hooks/use-site-data'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'
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
  LineChart,
} from 'lucide-react'

import { PanelLayout } from '@/components/ui/panel-layout'
import { OverviewPanel } from './components/overview-tab'
import type {
  Course,
  Enrollment,
  Payment,
  Invoice,
  Notice,
  Exam,
  ContactInquiry,
  NotificationRecord,
  ExamSubmission,
  AttendanceRecord,
  AdmitCard,
  Student,
  Teacher,
  MediaFile,
  Subject,
  Admission,
  ModelTestApplicant,
  CourseCategory,
} from './components/types'

const CoursesPanel = lazy(() =>
  import('./components/courses-tab').then((m) => ({ default: m.CoursesPanel })),
)
const EnrollmentsPanel = lazy(() =>
  import('./components/enrollments-tab').then((m) => ({
    default: m.EnrollmentsPanel,
  })),
)
const PaymentsPanel = lazy(() =>
  import('./components/payments-tab').then((m) => ({
    default: m.PaymentsPanel,
  })),
)
const InvoicesPanel = lazy(() =>
  import('./components/invoices-tab').then((m) => ({
    default: m.InvoicesPanel,
  })),
)
const NoticesPanel = lazy(() =>
  import('./components/notices-tab').then((m) => ({ default: m.NoticesPanel })),
)
const MediaPanel = lazy(() =>
  import('./components/media-tab').then((m) => ({ default: m.MediaPanel })),
)
const ExamsPanel = lazy(() =>
  import('./components/exams-tab').then((m) => ({ default: m.ExamsPanel })),
)
const QuestionsPanel = lazy(() =>
  import('./components/questions-tab').then((m) => ({
    default: m.QuestionsPanel,
  })),
)
const ResultsPanel = lazy(() =>
  import('./components/results-tab').then((m) => ({ default: m.ResultsPanel })),
)
const StudentsPanel = lazy(() =>
  import('./components/students-tab').then((m) => ({
    default: m.StudentsPanel,
  })),
)
const TeachersPanel = lazy(() =>
  import('./components/teachers-tab').then((m) => ({
    default: m.TeachersPanel,
  })),
)
const AttendancePanel = lazy(() =>
  import('./components/attendance-tab').then((m) => ({
    default: m.AttendancePanel,
  })),
)
const AdmitCardsPanel = lazy(() =>
  import('./components/admit-cards-tab').then((m) => ({
    default: m.AdmitCardsPanel,
  })),
)
const ContactsPanel = lazy(() =>
  import('./components/contacts-tab').then((m) => ({
    default: m.ContactsPanel,
  })),
)
const AdmissionsPanel = lazy(() =>
  import('./components/admissions-tab').then((m) => ({
    default: m.AdmissionsPanel,
  })),
)
const ModelTestApplicantsPanel = lazy(() =>
  import('./components/model-test-applicants-tab').then((m) => ({
    default: m.ModelTestApplicantsPanel,
  })),
)
const NotificationsPanel = lazy(() =>
  import('./components/notifications-tab').then((m) => ({
    default: m.NotificationsPanel,
  })),
)
const SettingsPanel = lazy(() =>
  import('./components/settings-tab').then((m) => ({
    default: m.SettingsPanel,
  })),
)
const ReportsPanel = lazy(() =>
  import('./components/reports-tab').then((m) => ({
    default: m.ReportsPanel,
  })),
)
const SubjectsPanel = lazy(() =>
  import('./components/subjects-tab').then((m) => ({
    default: m.SubjectsPanel,
  })),
)
const CourseCategoriesPanel = lazy(() =>
  import('./components/course-categories-tab').then((m) => ({
    default: m.CourseCategoriesPanel,
  })),
)
const SmsPanel = lazy(() =>
  import('./components/sms-tab').then((m) => ({ default: m.SmsPanel })),
)

const TABS = [
  { id: 'overview', icon: LayoutDashboard },
  { id: 'courses', icon: GraduationCap },
  { id: 'enrollments', icon: BookOpen },
  { id: 'payments', icon: Wallet },
  { id: 'invoices', icon: Receipt },
  { id: 'notices', icon: Megaphone },
  { id: 'sms', icon: MessageSquare },
  { id: 'media', icon: Image },
  { id: 'exams', icon: FileText },
  { id: 'subjects', icon: BookOpen },
  { id: 'course-categories', icon: BookOpen },
  { id: 'questions', icon: HelpCircle },
  { id: 'results', icon: BarChart3 },
  { id: 'teachers', icon: Presentation },
  { id: 'students', icon: Users },
  { id: 'attendance', icon: CalendarCheck },
  { id: 'admit-cards', icon: CreditCard },
  { id: 'contacts', icon: Users },
  { id: 'admissions', icon: FileText },
  { id: 'model-test', icon: FileText },
  { id: 'notifications', icon: Bell },
  { id: 'reports', icon: LineChart },
  { id: 'settings', icon: BarChart3 },
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
  admissions: ['admissions'],
  'model-test': ['modelTestApplicants'],
  notifications: ['notifications'],
  settings: [],
  subjects: ['subjects'],
  'course-categories': ['courseCategories'],
  reports: [
    'courses',
    'enrollments',
    'payments',
    'students',
    'attendance',
    'exams',
    'submissions',
  ],
}

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 rounded-lg bg-secondary" />
        <div className="h-8 w-32 rounded-lg bg-secondary" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-64 rounded-lg bg-secondary" />
        <div className="h-10 w-32 rounded-lg bg-secondary" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-1">
        <div className="space-y-2 p-4">
          <div className="h-4 w-full rounded bg-secondary" />
          <div className="h-4 w-3/4 rounded bg-secondary" />
          <div className="h-4 w-1/2 rounded bg-secondary" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-secondary/50" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const session = authClient.useSession()
  const site = useSiteData()
  const t = useTranslations('admin')
  const tc = useTranslations('admin.common')
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
  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([])
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [modelTestApplicants, setModelTestApplicants] = useState<
    ModelTestApplicant[]
  >([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchData = useCallback(
    async (tabId?: string) => {
      try {
        setFetchError(null)
        const activeTab = tabId || tab

        const fetches: Promise<Response>[] = []
        const fetchKeys: string[] = []

        const needed = TAB_FETCH_MAP[activeTab] || ['overview']

        if (needed.includes('courses')) {
          fetches.push(fetch('/api/courses'))
          fetchKeys.push('courses')
        }
        if (needed.includes('enrollments')) {
          fetches.push(fetch('/api/enrollments'))
          fetchKeys.push('enrollments')
        }
        if (needed.includes('payments')) {
          fetches.push(fetch('/api/payments'))
          fetchKeys.push('payments')
        }
        if (needed.includes('invoices')) {
          fetches.push(fetch('/api/invoices'))
          fetchKeys.push('invoices')
        }
        if (needed.includes('notices')) {
          fetches.push(fetch('/api/notices'))
          fetchKeys.push('notices')
        }
        if (needed.includes('media')) {
          fetches.push(fetch('/api/media'))
          fetchKeys.push('media')
        }
        if (needed.includes('exams')) {
          fetches.push(fetch('/api/exams'))
          fetchKeys.push('exams')
        }
        if (needed.includes('contacts')) {
          fetches.push(fetch('/api/contact'))
          fetchKeys.push('contacts')
        }
        if (needed.includes('notifications')) {
          fetches.push(fetch('/api/notifications'))
          fetchKeys.push('notifications')
        }
        if (needed.includes('submissions')) {
          fetches.push(fetch('/api/exam-submissions'))
          fetchKeys.push('submissions')
        }
        if (needed.includes('attendance')) {
          fetches.push(fetch('/api/attendance'))
          fetchKeys.push('attendance')
        }
        if (needed.includes('admitCards')) {
          fetches.push(fetch('/api/admit-cards'))
          fetchKeys.push('admitCards')
        }
        if (needed.includes('students')) {
          fetches.push(fetch('/api/students'))
          fetchKeys.push('students')
        }
        if (needed.includes('teachers')) {
          fetches.push(fetch('/api/teachers'))
          fetchKeys.push('teachers')
        }
        if (needed.includes('subjects')) {
          fetches.push(fetch('/api/subjects'))
          fetchKeys.push('subjects')
        }
        if (needed.includes('courseCategories')) {
          fetches.push(fetch('/api/course-categories'))
          fetchKeys.push('courseCategories')
        }
        if (needed.includes('admissions')) {
          fetches.push(fetch('/api/admissions'))
          fetchKeys.push('admissions')
        }
        if (needed.includes('modelTestApplicants')) {
          fetches.push(fetch('/api/model-test-applicants'))
          fetchKeys.push('modelTestApplicants')
        }

        const responses = await Promise.all(fetches)

        for (let i = 0; i < responses.length; i++) {
          const res = responses[i]
          const key = fetchKeys[i]
          if (res.ok) {
            const d = await res.json()
            const data = d.data || d
            switch (key) {
              case 'courses':
                setCourses(data)
                break
              case 'enrollments':
                setEnrollments(data)
                break
              case 'payments':
                setPayments(data)
                break
              case 'invoices':
                setInvoices(data)
                break
              case 'notices':
                setNotices(data)
                break
              case 'media':
                setMediaFiles(data)
                break
              case 'exams':
                setExams(data)
                break
              case 'contacts':
                setContacts(data)
                break
              case 'notifications':
                setNotifications(data)
                break
              case 'submissions':
                setExamSubmissions(data)
                break
              case 'attendance':
                setAttendance(data)
                break
              case 'admitCards':
                setAdmitCards(data)
                break
              case 'students':
                setStudents(data)
                break
              case 'teachers':
                setTeachers(data)
                break
              case 'subjects':
                setSubjectsList(data)
                break
              case 'courseCategories':
                setCourseCategories(data)
                break
              case 'admissions':
                setAdmissions(data)
                break
              case 'modelTestApplicants':
                setModelTestApplicants(data)
                break
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setFetchError(t('dataLoadError'))
      } finally {
        setLoading(false)
      }
    },
    [tab],
  )

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
      <div className="min-h-screen p-6">
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 rounded-lg bg-secondary" />
            <div className="h-8 w-24 rounded-lg bg-secondary" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-secondary/50" />
            ))}
          </div>
          <div className="h-96 rounded-2xl bg-secondary/50" />
        </div>
      </div>
    )
  }

  if (fetchError && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <AlertTriangle className="size-10 text-destructive" />
          <p className="text-center text-foreground">{fetchError}</p>
          <button
            onClick={() => fetchData(tab)}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90"
          >
            <RefreshCw className="size-4" />
            {tc('retry')}
          </button>
        </div>
      </div>
    )
  }

  if (!session.data) {
    router.push('/auth/sign-in')
    return null
  }

  if (
    (session.data.user as Record<string, unknown>).role !== 'admin' &&
    (session.data.user as Record<string, unknown>).role !== 'super-admin'
  ) {
    router.push('/dashboard')
    return null
  }

  const pendingEnrollments = enrollments.filter(
    (e) => e.status === 'pending',
  ).length
  const pendingPayments = payments.filter((p) => p.status === 'pending').length
  const pendingAdmissions = admissions.filter(
    (a) => a.status === 'pending',
  ).length
  const pendingModelTest = modelTestApplicants.filter(
    (a) => a.status === 'pending',
  ).length

  const tabsWithBadges = TABS.map((tabItem) => ({
    ...tabItem,
    label: t(`tabs.${tabItem.id}`),
    badge:
      tabItem.id === 'enrollments'
        ? pendingEnrollments
        : tabItem.id === 'payments'
          ? pendingPayments
          : tabItem.id === 'admissions'
            ? pendingAdmissions
            : tabItem.id === 'model-test'
              ? pendingModelTest
              : undefined,
  }))

  return (
    <PanelLayout
      siteName={site.nameBn}
      panelTitle={t('panelTitle')}
      userName={session.data.user.name}
      welcomeMessage={t('welcomeMessage')}
      tabs={tabsWithBadges}
      activeTab={tab}
      onTabChange={(id) => setTab(id as TabId)}
      onSignOut={handleSignOut}
    >
      {tab === 'overview' && (
        <OverviewPanel
          courses={courses}
          enrollments={enrollments}
          payments={payments}
        />
      )}
      <Suspense fallback={<TabSkeleton />}>
        <ErrorBoundary>
          {tab === 'courses' && (
            <CoursesPanel courses={courses} onRefresh={fetchData} />
          )}
          {tab === 'enrollments' && (
            <EnrollmentsPanel
              enrollments={enrollments}
              courses={courses}
              students={students}
              onRefresh={fetchData}
            />
          )}
          {tab === 'payments' && (
            <PaymentsPanel
              payments={payments}
              enrollments={enrollments}
              students={students}
              onRefresh={fetchData}
            />
          )}
          {tab === 'invoices' && (
            <InvoicesPanel
              invoices={invoices}
              enrollments={enrollments}
              onRefresh={fetchData}
            />
          )}
          {tab === 'notices' && (
            <NoticesPanel notices={notices} onRefresh={fetchData} />
          )}
        </ErrorBoundary>
        {tab === 'sms' && <SmsPanel />}
        {tab === 'media' && (
          <MediaPanel mediaFiles={mediaFiles} onRefresh={fetchData} />
        )}
        {tab === 'exams' && (
          <ExamsPanel
            exams={exams}
            submissions={examSubmissions}
            onRefresh={fetchData}
          />
        )}
        {tab === 'questions' && <QuestionsPanel exams={exams} />}
        {tab === 'subjects' && (
          <SubjectsPanel subjects={subjectsList} onRefresh={fetchData} />
        )}
        {tab === 'course-categories' && (
          <CourseCategoriesPanel
            categories={courseCategories}
            onRefresh={fetchData}
          />
        )}
        {tab === 'results' && (
          <ResultsPanel exams={exams} submissions={examSubmissions} />
        )}
        {tab === 'students' && (
          <StudentsPanel students={students} onRefresh={fetchData} />
        )}
        {tab === 'teachers' && (
          <TeachersPanel teachers={teachers} onRefresh={fetchData} />
        )}
        {tab === 'attendance' && (
          <AttendancePanel
            enrollments={enrollments}
            attendance={attendance}
            onRefresh={fetchData}
          />
        )}
        {tab === 'admit-cards' && (
          <AdmitCardsPanel
            enrollments={enrollments}
            exams={exams}
            admitCards={admitCards}
            onRefresh={fetchData}
          />
        )}
        {tab === 'contacts' && (
          <ContactsPanel contacts={contacts} onRefresh={fetchData} />
        )}
        {tab === 'admissions' && (
          <AdmissionsPanel admissions={admissions} onRefresh={fetchData} />
        )}
        {tab === 'model-test' && (
          <ModelTestApplicantsPanel
            applicants={modelTestApplicants}
            onRefresh={fetchData}
          />
        )}
        {tab === 'notifications' && (
          <NotificationsPanel
            notifications={notifications}
            onRefresh={fetchData}
          />
        )}
        {tab === 'reports' && (
          <ReportsPanel
            enrollments={enrollments}
            payments={payments}
            courses={courses}
            students={students}
            attendance={attendance}
            examSubmissions={examSubmissions}
            exams={exams}
          />
        )}
        {tab === 'settings' && <SettingsPanel onRefresh={fetchData} />}
      </Suspense>
    </PanelLayout>
  )
}
