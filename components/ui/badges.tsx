'use client'

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export function AttendanceStatusBadge({
  status,
}: {
  status: 'present' | 'absent' | 'late'
}) {
  const map = {
    present: {
      label: 'উপস্থিত',
      icon: CheckCircle2,
      cls: 'bg-green/10 text-green',
    },
    absent: {
      label: 'অনুপস্থিত',
      icon: XCircle,
      cls: 'bg-destructive/10 text-destructive',
    },
    late: { label: 'বিলম্বিত', icon: AlertCircle, cls: 'bg-gold/10 text-gold' },
  }
  const s = map[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      <s.icon className="size-3" />
      {s.label}
    </span>
  )
}

export function EnrollmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'অপেক্ষমান', cls: 'bg-gold/10 text-gold' },
    approved: { label: 'অনুমোদিত', cls: 'bg-green/10 text-green' },
    rejected: {
      label: 'প্রত্যাখ্যাত',
      cls: 'bg-destructive/10 text-destructive',
    },
    active: { label: 'সক্রিয়', cls: 'bg-brand/10 text-brand' },
    completed: { label: 'সম্পন্ন', cls: 'bg-green/10 text-green' },
    cancelled: { label: 'বাতিল', cls: 'bg-muted text-muted-foreground' },
  }
  const s = map[status] || {
    label: status,
    cls: 'bg-secondary text-muted-foreground',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'অপেক্ষমান', cls: 'bg-gold/10 text-gold' },
    verified: { label: 'যাচাইকৃত', cls: 'bg-green/10 text-green' },
    rejected: {
      label: 'প্রত্যাখ্যাত',
      cls: 'bg-destructive/10 text-destructive',
    },
  }
  const s = map[status] || {
    label: status,
    cls: 'bg-secondary text-muted-foreground',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  )
}

export function MethodBadge({ method }: { method: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    bkash: { label: 'bKash', cls: 'bg-[#E2136E]/10 text-[#E2136E]' },
    nagad: { label: 'Nagad', cls: 'bg-[#F6921E]/10 text-[#F6921E]' },
    cash: { label: 'নগদ', cls: 'bg-green/10 text-green' },
    bank: { label: 'ব্যাংক', cls: 'bg-brand/10 text-brand' },
  }
  const s = map[method] || {
    label: method,
    cls: 'bg-secondary text-muted-foreground',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  )
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: 'পরিশোধিত', cls: 'bg-green/10 text-green' },
    partial: { label: 'আংশিক', cls: 'bg-gold/10 text-gold' },
    unpaid: { label: 'অপরিশোধিত', cls: 'bg-destructive/10 text-destructive' },
    overdue: { label: 'বিলম্বিত', cls: 'bg-destructive/10 text-destructive' },
  }
  const s = map[status] || {
    label: status,
    cls: 'bg-secondary text-muted-foreground',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  )
}
