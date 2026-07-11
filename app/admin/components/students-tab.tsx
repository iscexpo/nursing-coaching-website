'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { EnrollmentStatusBadge } from '@/components/ui/badges'
import type { Enrollment } from './types'

export function StudentsPanel({ enrollments }: { enrollments: Enrollment[] }) {
  const [search, setSearch] = useState('')
  const filtered = enrollments.filter(
    (e) => (e.userName || '').includes(search) || (e.userPhone || '').includes(search)
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">শিক্ষার্থী তালিকা</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
            className="rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">নাম</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ফোন</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">কোর্স</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">মোট ফি</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">বকেয়</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{e.userName || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.userPhone || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.courseTitle || '—'}</td>
                  <td className="px-4 py-3 text-center text-foreground">৳{e.totalFee.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-gold font-medium">৳{e.dueAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <EnrollmentStatusBadge status={e.status} />
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
