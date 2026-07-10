import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { COURSES } from '@/lib/site-data'

export const metadata = {
  title: 'কোর্স সমূহ | কর্নিয়া নার্সিং কোচিং',
  description: 'কর্নিয়া নার্সিং কোচিং-এর সকল কোর্স — নার্সিং ভর্তি, কাউন্সিল, B.Sc Nursing, Post Basic, চাকরি প্রস্তুতি ও অনলাইন ব্যাচ।',
}

export default function CoursesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              eyebrow="আমাদের কোর্স"
              title="সকল কোর্স সমূহ"
              description="BNMC ভর্তি পরীক্ষা থেকে চাকরি প্রস্তুতি — প্রতিটি কোর্সে অভিজ্ঞ শিক্ষক ও আধুনিক পাঠদান পদ্ধতি।"
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {COURSES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/admission?course=${c.slug}`}
                  className="group rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-lg font-bold text-foreground">
                        {c.title}
                      </h3>
                      <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                        {c.duration}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {c.desc}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-green">{c.fee}</span>
                      <span className="text-sm font-medium text-brand group-hover:underline">
                        ভর্তি হোন →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  )
}
