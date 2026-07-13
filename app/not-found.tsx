import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center animate-fade-in">
        <div className="relative">
          <p className="font-heading text-8xl font-bold text-brand/10">404</p>
          <p className="absolute inset-0 flex items-center justify-center font-heading text-6xl font-bold text-brand">
            404
          </p>
        </div>
        <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
          পৃষ্ঠা পাওয়া যায়নি
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা সরিয়ে ফেলা হয়েছে।
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/20 hover:-translate-y-0.5"
        >
          <Home className="size-4" />
          হোমপেজে ফিরুন
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
