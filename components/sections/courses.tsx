import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { COURSES } from '@/lib/site-data'

export function Courses() {
  return (
    <section id="courses" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="আমাদের কোর্সসমূহ"
          title="প্রতিটি লক্ষ্যের জন্য আলাদা কোর্স"
          description="ভর্তি থেকে চাকরি — নার্সিং ক্যারিয়ারের প্রতিটি ধাপে সঠিক প্রস্তুতি।"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <article
              key={course.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-16/10 overflow-hidden">
                <Image
                  src={course.image || '/placeholder.svg'}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-brand shadow">
                  <Clock className="size-3.5" />
                  {course.duration}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {course.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {course.desc}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-heading text-lg font-bold text-green">{course.fee}</span>
                  <Button
                    render={<Link href={`/admission?course=${course.slug}`} />}
                    variant="ghost"
                    size="sm"
                    className="text-brand hover:bg-secondary"
                  >
                    বিস্তারিত
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
