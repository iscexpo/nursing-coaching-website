import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="font-heading text-7xl font-bold text-brand">404</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
          পৃষ্ঠা পাওয়া যায়নি
        </h1>
        <p className="mt-2 text-muted-foreground">
          আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা সরিয়ে ফেলা হয়েছে।
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          হোমপেজে ফিরুন
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
