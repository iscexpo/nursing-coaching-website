'use client'

import { useState } from 'react'
import { Check, XCircle } from 'lucide-react'
import { EnrollmentStatusBadge } from '@/components/ui/badges'
import type { Enrollment } from './types'

export function EnrollmentsPanel({
  enrollments,
  onRefresh,
}: {
  enrollments: Enrollment[]
  onRefresh: () => void
}) {
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = filter === 'all' ? enrollments : enrollments.filter((e) => e.status === filter)

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id)
    try {
      await fetch(`/api/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to update enrollment:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">এনরোলমেন্ট ব্যবস্থাপনা</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="all">সকল</option>
          <option value="pending">অপেক্ষমান</option>
          <option value="approved">অনুমোদিত</option>
          <option value="active">সক্রিয়</option>
          <option value="rejected">প্রত্যাখ্যাত</option>
          <option value="completed">সম্পন্ন</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">শিক্ষার্থী</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ফোন</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">কোর্স</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">মোট ফি</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">পরিশোধ</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">বকেয়</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{e.userName || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.userPhone || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.courseTitle || '—'}</td>
                  <td className="px-4 py-3 text-center text-foreground">৳{e.totalFee.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-green">৳{e.paidAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-gold font-medium">৳{e.dueAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <EnrollmentStatusBadge status={e.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {e.status === 'pending' && (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStatusChange(e.id, 'approved')}
                          disabled={updating === e.id}
                          className="rounded-lg bg-green/10 p-1.5 text-green hover:bg-green/20"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(e.id, 'rejected')}
                          disabled={updating === e.id}
                          className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                        >
                          <XCircle className="size-4" />
                        </button>
                      </div>
                    )}
                    {e.status === 'approved' && (
                      <button
                        onClick={() => handleStatusChange(e.id, 'active')}
                        disabled={updating === e.id}
                        className="rounded-lg bg-brand/10 px-2 py-1 text-xs font-medium text-brand hover:bg-brand/20"
                      >
                        সক্রিয় করুন
                      </button>
                    )}
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
