'use client'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center animate-fade-in">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 animate-scale-in">
          <AlertTriangle className="size-8 text-destructive" />
        </div>
        <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
          কিছু ভুল হয়েছে
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          দুঃখিত, একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/20 hover:-translate-y-0.5"
        >
          <RefreshCw className="size-4" />
          আবার চেষ্টা করুন
        </button>
      </main>
      <SiteFooter />
    </>
  )
}
