import Image from 'next/image'
import { GraduationCap } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { TEACHERS } from '@/lib/site-data'

export function Teachers() {
  return (
    <section id="teachers" className="bg-secondary/50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="আমাদের শিক্ষকমণ্ডলী"
          title="অভিজ্ঞ ও দক্ষ মেন্টর"
          description="প্রতিটি বিষয়ে বিশেষজ্ঞ শিক্ষকদের সরাসরি তত্ত্বাবধান।"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEACHERS.map((t) => (
            <div
              key={t.name}
              className="overflow-hidden rounded-2xl border border-border bg-card text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image src={t.image || '/placeholder.svg'} alt={t.name} fill className="object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-base font-semibold text-foreground">{t.name}</h3>
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-brand">
                  <GraduationCap className="size-3.5" />
                  {t.subject}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">{t.qualification}</p>
                <p className="text-xs text-green">{t.experience}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
