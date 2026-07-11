'use client'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

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
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="font-heading text-6xl font-bold text-destructive">!</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
          কিছু ভুল হয়েছে
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          দুঃখিত, একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          আবার চেষ্টা করুন
        </button>
      </main>
      <SiteFooter />
    </>
  )
}
