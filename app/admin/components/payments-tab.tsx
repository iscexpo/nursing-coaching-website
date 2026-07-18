'use client'

import { useState, type FormEvent } from 'react'
import { Check, Loader2, Plus, XCircle } from 'lucide-react'
import { PaymentStatusBadge, MethodBadge } from '@/components/ui/badges'
import {
  getPaymentValidationErrors,
  type PaymentFormValues,
} from '@/lib/payment-utils'
import type { Enrollment, Payment, Student } from './types'

export function PaymentsPanel({
  payments,
  enrollments,
  students,
  onRefresh,
}: {
  payments: Payment[]
  enrollments: Enrollment[]
  students: Student[]
  onRefresh: () => void
}) {
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('')
  const [form, setForm] = useState<PaymentFormValues>({
    amount: '',
    method: 'bkash',
    transactionId: '',
    senderNumber: '',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof PaymentFormValues, string>>
  >({})

  const filtered =
    filter === 'all' ? payments : payments.filter((p) => p.status === filter)
  const payableEnrollments = enrollments.filter(
    (enrollment) => enrollment.dueAmount > 0,
  )
  const selectedEnrollment =
    enrollments.find((enrollment) => enrollment.id === selectedEnrollmentId) ??
    payableEnrollments[0] ??
    null

  async function handleVerify(id: string, status: string) {
    setUpdating(id)
    try {
      await fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setFeedback(
        status === 'verified'
          ? 'পেমেন্ট যাচাই করা হয়েছে'
          : 'পেমেন্ট প্রত্যাখ্যান করা হয়েছে',
      )
      onRefresh()
    } catch (error) {
      console.error('Failed to update payment:', error)
      setFeedback('পেমেন্ট আপডেট করা যায়নি')
    } finally {
      setUpdating(null)
    }
  }

  function openCreateModal() {
    setShowCreateModal(true)
    setFeedback(null)
    setFormErrors({})
    setSelectedEnrollmentId(
      payableEnrollments[0]?.id ?? enrollments[0]?.id ?? '',
    )
    setForm({
      amount: '',
      method: 'bkash',
      transactionId: '',
      senderNumber: '',
      notes: '',
    })
  }

  async function handleCreatePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedEnrollment) return

    const errors = getPaymentValidationErrors(
      {
        amount: form.amount,
        method: form.method,
        transactionId: form.transactionId,
        senderNumber: form.senderNumber,
      },
      selectedEnrollment.dueAmount,
    )

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: selectedEnrollment.id,
          amount: Number(form.amount),
          method: form.method,
          transactionId: form.transactionId.trim() || undefined,
          senderNumber: form.senderNumber.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'পেমেন্ট রেকর্ড করা যায়নি')
      }

      setShowCreateModal(false)
      setFeedback('পেমেন্ট রেকর্ড করা হয়েছে')
      onRefresh()
    } catch (error) {
      console.error('Failed to create payment:', error)
      setFeedback(
        error instanceof Error ? error.message : 'পেমেন্ট রেকর্ড করা যায়নি',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">
          পেমেন্ট ব্যবস্থাপনা
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <Plus className="size-4" /> নতুন পেমেন্ট
          </button>
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
      </div>

      {feedback && (
        <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          {feedback}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  তারিখ
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  শিক্ষার্থী
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  কোর্স
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  পরিমাণ
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  মাধ্যম
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  ট্রানজেকশন ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  প্রেরক
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  স্ট্যাটাস
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  কার্যক্রম
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const enrollment = enrollments.find(
                  (item) => item.id === p.enrollmentId,
                )
                const student = students.find(
                  (item) => item.id === enrollment?.userId,
                )

                return (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {new Date(p.paidAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {student?.name || enrollment?.userName || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {enrollment?.courseTitle || '—'}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">
                      ৳{p.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <MethodBadge method={p.method} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {p.transactionId || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.senderNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PaymentStatusBadge status={p.status} />
                    </td>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-foreground">
                নতুন পেমেন্ট রেকর্ড করুন
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  শিক্ষার্থী/এনরোলমেন্ট
                </label>
                <select
                  value={selectedEnrollmentId}
                  onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  {payableEnrollments.length === 0 && (
                    <option value="">কোনো বকেয়া নেই</option>
                  )}
                  {enrollments.map((enrollment) => (
                    <option key={enrollment.id} value={enrollment.id}>
                      {students.find(
                        (student) => student.id === enrollment.userId,
                      )?.name ||
                        enrollment.userName ||
                        'শিক্ষার্থী'}{' '}
                      — {enrollment.courseTitle || 'কোর্স'} (বকেয়া: ৳
                      {enrollment.dueAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
                {selectedEnrollment && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    নির্বাচিত এনরোলমেন্টের বকেয়া: ৳
                    {selectedEnrollment.dueAmount.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        amount:
                          e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="যেমন: 5000"
                  />
                  {formErrors.amount && (
                    <p className="mt-1 text-xs text-destructive">
                      {formErrors.amount}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    পেমেন্ট মাধ্যম
                  </label>
                  <select
                    value={form.method}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        method: e.target.value as PaymentFormValues['method'],
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    ট্রানজেকশন ID
                  </label>
                  <input
                    type="text"
                    value={form.transactionId}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        transactionId: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="যেমন: TX123"
                  />
                  {formErrors.transactionId && (
                    <p className="mt-1 text-xs text-destructive">
                      {formErrors.transactionId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    প্রেরক নম্বর
                  </label>
                  <input
                    type="tel"
                    value={form.senderNumber}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        senderNumber: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="যেমন: 01XXXXXXXXX"
                  />
                  {formErrors.senderNumber && (
                    <p className="mt-1 text-xs text-destructive">
                      {formErrors.senderNumber}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  নোট
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="অতিরিক্ত তথ্য"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedEnrollment}
                  className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  ) : (
                    'রেকর্ড করুন'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
