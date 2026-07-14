import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function Courses() {
  const t = await getTranslations('courses')
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
        <FadeIn>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />
        </FadeIn>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((course, i) => (
            <FadeIn key={course.slug} delay={i * 100}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand/5">
                <div className="relative aspect-16/10 overflow-hidden">
                  {course.image ? (
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-secondary text-muted-foreground">{t('noImage')}</div>
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-brand shadow backdrop-blur-sm">
                    <Clock className="size-3.5" />
                    {course.duration}
                  </span>
                  {course.discountFee != null && course.discountFee < course.fee && (
                    <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                      -{Math.round(((course.fee - course.discountFee) / course.fee) * 100)}%
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {course.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {course.shortDescription || course.description?.slice(0, 100)}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="flex items-center gap-2">
                      {course.discountFee != null && course.discountFee < course.fee ? (
                        <>
                          <span className="font-heading text-lg font-bold text-green">৳{course.discountFee.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground line-through">৳{course.fee.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="font-heading text-lg font-bold text-green">৳{course.fee.toLocaleString()}</span>
                      )}
                    </span>
                    <Button
                      render={<Link href={`/admission?course=${course.slug}`} />}
                      variant="ghost"
                      size="sm"
                      className="text-brand hover:bg-secondary"
                    >
                      {t('noImage') === 'No image available' ? 'Details' : 'বিস্তারিত'}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
