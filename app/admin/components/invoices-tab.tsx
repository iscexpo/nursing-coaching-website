'use client'

import { InvoiceStatusBadge } from '@/components/ui/badges'
import type { Invoice, Enrollment } from './types'

export function InvoicesPanel({
  invoices,
  enrollments,
  onRefresh,
}: {
  invoices: Invoice[]
  enrollments: Enrollment[]
  onRefresh: () => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-foreground">
        ইনভয়েস ব্যবস্থাপনা
      </h3>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  ইনভয়েস নম্বর
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  মোট
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  পরিশোধিত
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  বকেয়
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  স্ট্যাটাস
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  তৈরি
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-foreground">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    ৳{inv.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-green">
                    ৳{inv.paidAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-gold">
                    ৳{inv.dueAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString('bn-BD')}
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
