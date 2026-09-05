'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
        কিছু ভুল হয়েছে
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {error.message || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।'}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand/90"
        >
          আবার চেষ্টা করুন
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
        >
          <ArrowLeft className="size-4" />
          হোমপেজে ফিরুন
        </Link>
      </div>
    </div>
  )
}
