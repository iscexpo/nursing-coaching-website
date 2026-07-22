'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  CheckCircle2,
  XCircle,
  Phone,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import {
  EnrollmentStatusBadge,
  PaymentStatusBadge,
  MethodBadge,
} from '@/components/ui/status-badge'
import type { Enrollment, Payment, Invoice } from './types'

export function BillingSection({
  enrollments,
  payments,
  invoices,
  onRefresh,
}: {
  enrollments: Enrollment[]
  payments: Payment[]
  invoices: Invoice[]
  onRefresh: () => void
}) {
  const t = useTranslations('dashboard.billing')
  const tc = useTranslations('common')
  const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(
    null,
  )
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [senderNumber, setSenderNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const activeEnrollment = enrollments.find((e) => e.id === selectedEnrollment)

  const PAYMENT_NUMBERS = {
    bkash: '01784-176442',
    nagad: '01784-176442',
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(PAYMENT_NUMBERS[paymentMethod])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handlePayment() {
    if (
      !selectedEnrollment ||
      !paymentAmount ||
      !transactionId ||
      !senderNumber
    )
      return
    setSubmitting(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: selectedEnrollment,
          amount: parseInt(paymentAmount),
          method: paymentMethod,
          transactionId,
          senderNumber,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setShowPaymentModal(false)
        setPaymentAmount('')
        setTransactionId('')
        setSenderNumber('')
        onRefresh()
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="rounded-xl border border-green/30 bg-green/5 p-4 text-sm text-green flex items-center gap-2">
          <CheckCircle2 className="size-5" />
          {t('paymentSuccess')}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-3">
          {t('selectEnrollment')}
        </h3>
        <div className="space-y-2">
          {enrollments.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEnrollment(e.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                selectedEnrollment === e.id
                  ? 'border-brand bg-brand/5'
                  : 'border-border hover:border-brand/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{e.courseTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.courseDuration}
                  </p>
                </div>
                <EnrollmentStatusBadge status={e.status} />
              </div>
              <div className="mt-2 flex gap-4 text-sm">
                <span>{tc('total')}: ৳{e.totalFee.toLocaleString()}</span>
                <span className="text-green">
                  {t('amountPaid')}: ৳{e.paidAmount.toLocaleString()}
                </span>
                <span
                  className={
                    e.dueAmount > 0 ? 'text-gold font-medium' : 'text-green'
                  }
                >
                  {t('dueAmount')}: ৳{e.dueAmount.toLocaleString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeEnrollment && activeEnrollment.dueAmount > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-3">
            {t('submitPayment')}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => {
                setPaymentMethod('bkash')
                setShowPaymentModal(true)
              }}
              className="flex items-center gap-3 rounded-xl border border-[#E2136E]/30 bg-[#E2136E]/5 p-4 transition-colors hover:bg-[#E2136E]/10"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#E2136E]/10 text-[#E2136E]">
                <Phone className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  bKash
                </p>
                <p className="text-xs text-muted-foreground">{t('sendTo')}</p>
              </div>
            </button>
            <button
              onClick={() => {
                setPaymentMethod('nagad')
                setShowPaymentModal(true)
              }}
              className="flex items-center gap-3 rounded-xl border border-[#F6921E]/30 bg-[#F6921E]/5 p-4 transition-colors hover:bg-[#F6921E]/10"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#F6921E]/10 text-[#F6921E]">
                <Phone className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  Nagad
                </p>
                <p className="text-xs text-muted-foreground">{t('sendTo')}</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {payments.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-secondary/30 px-5 py-3">
            <h3 className="font-heading text-base font-bold text-foreground">
              {t('paymentHistory')}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {tc('date')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {tc('amount')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('methodLabel')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('transactionIdLabel')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    {tc('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {new Date(p.paidAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      ৳{p.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <MethodBadge method={p.method} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {p.transactionId}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {invoices.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-secondary/30 px-5 py-3">
            <h3 className="font-heading text-base font-bold text-foreground">
              {t('invoiceLabel')}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('invoiceLabel')} #
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {tc('amount')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('amountPaid')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('amountDue')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    {tc('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border last:border-0"
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
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          inv.status === 'paid'
                            ? 'bg-green/10 text-green'
                            : inv.status === 'partial'
                              ? 'bg-gold/10 text-gold'
                              : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {inv.status === 'paid'
                          ? t('paid')
                          : inv.status === 'partial'
                            ? t('partial')
                            : t('unpaid')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPaymentModal && activeEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-foreground">
                {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} {t('submitPayment')}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="size-5" />
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-dashed border-border bg-secondary/30 p-4">
              <p className="text-sm font-medium text-foreground mb-2">
                {t('sendTo')}:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-card px-3 py-2 font-mono text-lg font-bold text-foreground">
                  {PAYMENT_NUMBERS[paymentMethod]}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg bg-brand/10 px-3 py-2 text-sm font-medium text-brand hover:bg-brand/20"
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? tc('copied') : tc('copyNumber')}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} অ্যাপ থেকে এই
                নম্বরে সেন্ড মানি করুন
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t('amountLabel')}
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="যেমন: ৫০০০"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t('transactionIdLabel')}
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="যেমন: 8A3B4C5D6E"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t('senderNumberLabel')}
                </label>
                <input
                  type="tel"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="যেমন: 01XXXXXXXXX"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={handlePayment}
                disabled={
                  !paymentAmount ||
                  !transactionId ||
                  !senderNumber ||
                  submitting
                }
                className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="mx-auto size-5 animate-spin" />
                ) : (
                  t('submitPaymentBtn')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
