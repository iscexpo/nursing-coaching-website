import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function Courses() {
  let data: { id: string; slug: string; title: string; description: string; shortDescription: string | null; duration: string; fee: number; discountFee: number | null; image: string | null }[] = []
  try {
    data = await db.select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      shortDescription: courses.shortDescription,
      duration: courses.duration,
      fee: courses.fee,
      discountFee: courses.discountFee,
      image: courses.image,
    }).from(courses)
      .where(eq(courses.isActive, true))
      .limit(6)
  } catch {
    // fallback to empty
  }

  if (data.length === 0) return null

  return (
    <section id="courses" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="আমাদের কোর্সসমূহ"
          title="প্রতিটি লক্ষ্যের জন্য আলাদা কোর্স"
          description="ভর্তি থেকে চাকরি — নার্সিং ক্যারিয়ারের প্রতিটি ধাপে সঠিক প্রস্তুতি।"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((course) => (
            <article
              key={course.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-16/10 overflow-hidden">
                {course.image ? (
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-secondary text-muted-foreground">কোনো ছবি নেই</div>
                )}
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
                  {course.shortDescription || course.description?.slice(0, 100)}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-heading text-lg font-bold text-green">৳{course.fee.toLocaleString()}</span>
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
