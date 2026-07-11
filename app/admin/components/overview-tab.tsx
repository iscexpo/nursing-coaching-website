'use client'

import { Users, BookOpen, GraduationCap, Wallet } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import type { Enrollment, Payment, Course } from './types'

export function OverviewPanel({
  courses,
  enrollments,
  payments,
}: {
  courses: Course[]
  enrollments: Enrollment[]
  payments: Payment[]
}) {
  const pendingEnrollments = enrollments.filter((e) => e.status === 'pending').length
  const pendingPayments = payments.filter((p) => p.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="শিক্ষার্থী" value={`${enrollments.length}`} sub="মোট" icon={Users} color="brand" />
        <StatCard label="কোর্স" value={`${courses.length}`} sub="সক্রিয়" icon={BookOpen} color="green" />
        <StatCard label="এনরোলমেন্ট" value={`${pendingEnrollments}`} sub="অপেক্ষমান" icon={GraduationCap} color="gold" />
        <StatCard label="পেমেন্ট" value={`${pendingPayments}`} sub="যাচাইকরণ বাকি" icon={Wallet} color="gold" />
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
  )
}
