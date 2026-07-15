import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-2xl font-bold text-foreground">
        404 — পৃষ্ঠা পাওয়া যায়নি
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই।
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/20 hover:-translate-y-0.5"
      >
        <Home className="size-4" />
        হোম পেজে ফিরে যান
      </Link>
    </div>
  )
}
