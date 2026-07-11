'use client'

import { useState } from 'react'
import { Check, XCircle } from 'lucide-react'
import { PaymentStatusBadge, MethodBadge } from '@/components/ui/badges'
import type { Payment } from './types'

export function PaymentsPanel({
  payments,
  onRefresh,
}: {
  payments: Payment[]
  onRefresh: () => void
}) {
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = filter === 'all' ? payments : payments.filter((p) => p.status === filter)

  async function handleVerify(id: string, status: string) {
    setUpdating(id)
    try {
      await fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to update payment:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">পেমেন্ট ব্যবস্থাপনা</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="all">সকল</option>
          <option value="pending">অপেক্ষমান</option>
          <option value="verified">যাচাইকৃত</option>
          <option value="rejected">প্রত্যাখ্যাত</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">তারিখ</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">পরিমাণ</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">মাধ্যম</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">ট্রানজেকশন ID</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">প্রেরক</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">
                    {new Date(p.paidAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-foreground">৳{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><MethodBadge method={p.method} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.transactionId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.senderNumber}</td>
                  <td className="px-4 py-3 text-center"><PaymentStatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-center">
                    {p.status === 'pending' && (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleVerify(p.id, 'verified')}
                          disabled={updating === p.id}
                          className="rounded-lg bg-green/10 p-1.5 text-green hover:bg-green/20"
                          title="যাচাই করুন"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          onClick={() => handleVerify(p.id, 'rejected')}
                          disabled={updating === p.id}
                          className="rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20"
                          title="প্রত্যাখ্যান করুন"
                        >
                          <XCircle className="size-4" />
                        </button>
                      </div>
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
