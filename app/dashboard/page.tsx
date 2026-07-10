'use client'

import { useState } from 'react'
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
  { id: 'admit-card', label: 'এডমিট কার্ড', icon: CreditCard },
  { id: 'results', label: 'ফলাফল', icon: BarChart3 },
  { id: 'attendance', label: 'উপস্থিতি', icon: CalendarCheck },
] as const

type TabId = (typeof TABS)[number]['id']

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

export default function DashboardPage() {
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

  const user = session.data.user
  const presentDays = MOCK_ATTENDANCE.filter((a) => a.status === 'present').length
  const totalDays = MOCK_ATTENDANCE.length
  const avgScore = Math.round(MOCK_RESULTS.reduce((s, r) => s + r.score, 0) / MOCK_RESULTS.length)

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
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="মোট পরীক্ষা" value={`${MOCK_RESULTS.length}টি`} icon={BookOpen} color="brand" />
              <StatCard label="গড় স্কোর" value={`${avgScore}%`} icon={BarChart3} color="green" />
              <StatCard label="উপস্থিতি" value={`${Math.round((presentDays / totalDays) * 100)}%`} icon={CalendarCheck} color="gold" />
              <StatCard label="সেরা র‍্যাঙ্ক" value={`#${Math.min(...MOCK_RESULTS.map((r) => r.rank))}`} icon={CheckCircle2} color="green" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-foreground">সর্বশেষ ফলাফল</h3>
                <div className="mt-3 space-y-2">
                  {MOCK_RESULTS.slice(0, 3).map((r, i) => (
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
                  {MOCK_ATTENDANCE.slice(-5).reverse().map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{a.date}</span>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'admit-card' && (
          <AdmitCard user={user} />
        )}

        {tab === 'results' && (
          <ResultsTable />
        )}

        {tab === 'attendance' && (
          <AttendanceView />
        )}
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

function AdmitCard({ user }: { user: { name: string; phoneNumber?: string | null; studentId?: string | null } }) {
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
              <span className="font-semibold text-foreground">নার্সিং অ্যাডমিশন কোচিং</span>
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
