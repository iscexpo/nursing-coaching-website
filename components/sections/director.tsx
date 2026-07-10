import Image from 'next/image'
import { Quote } from 'lucide-react'

export function Director() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-[280px_1fr]">
          <div className="mx-auto w-full max-w-[280px]">
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Image src="/md.jpeg" alt="মোঃ মিরাজ ইসলাম" fill className="object-cover" />
            </div>
            <div className="mt-4 text-center">
              <p className="font-heading text-lg font-bold text-foreground">মোঃ মিরাজ ইসলাম</p>
              <p className="text-sm text-brand">প্রতিষ্ঠাতা ও পরিচালক</p>
            </div>
          </div>
          <div>
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-brand">
              পরিচালকের বার্তা
            </span>
            <Quote className="mt-4 size-9 text-gold" />
            <p className="mt-3 text-base leading-relaxed text-foreground text-pretty sm:text-lg">
              প্রিয় শিক্ষার্থী, নার্সিং একটি মহান পেশা — সেবা ও সম্মানের। কর্নিয়া নার্সিং কোচিং
              প্রতিষ্ঠার পেছনে আমাদের একটাই স্বপ্ন: খুলনার প্রতিটি মেধাবী শিক্ষার্থী যেন সঠিক দিকনির্দেশনা
              পেয়ে তার কাঙ্ক্ষিত প্রতিষ্ঠানে ভর্তি হতে পারে। অভিজ্ঞ শিক্ষকমণ্ডলী, আধুনিক পাঠদান পদ্ধতি
              ও আন্তরিক পরিবেশে আমরা আপনার পাশে আছি।
            </p>
            <p className="mt-4 text-sm text-muted-foreground">— আপনাদের শুভাকাঙ্ক্ষী</p>
          </div>
        </div>
      </div>
    </section>
  )
}
