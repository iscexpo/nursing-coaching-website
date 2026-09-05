import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function Courses() {
  const t = await getTranslations('courses')
  let data: {
    id: string
    slug: string
    title: string
    description: string
    shortDescription: string | null
    duration: string
    fee: number
    discountFee: number | null
    image: string | null
  }[] = []
  try {
    data = await db
      .select({
        id: courses.id,
        slug: courses.slug,
        title: courses.title,
        description: courses.description,
        shortDescription: courses.shortDescription,
        duration: courses.duration,
        fee: courses.fee,
        discountFee: courses.discountFee,
        image: courses.image,
      })
      .from(courses)
      .where(eq(courses.isActive, true))
      .limit(6)
  } catch {
    // fallback to empty
  }

  if (data.length === 0) return null

  return (
    <section
      id="courses"
      className="relative overflow-hidden bg-background py-20 md:py-28"
    >
      <div className="relative mx-auto max-w-7xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />
        </FadeIn>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((course, i) => (
            <FadeIn key={course.slug} delay={i * 80}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
                {/* Image container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-200/20 to-purple-200/20">
                  {course.image ? (
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/20 text-muted-foreground">
                      {t('noImage')}
                    </div>
                  )}
                  {/* Duration badge */}
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-card/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                    <Clock3
                      className="size-3.5 text-primary"
                      aria-hidden="true"
                    />
                    {course.duration}
                  </span>
                  {/* Discount badge */}
                  {course.discountFee && course.discountFee < course.fee && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-sm">
                      অফার
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {course.shortDescription ||
                      course.description?.slice(0, 100)}
                  </p>

                  {/* Price and CTA */}
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex flex-col">
                      {course.discountFee != null &&
                      course.discountFee < course.fee ? (
                        <>
                          <span className="text-xl font-bold text-foreground">
                            ৳{course.discountFee.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            ৳{course.fee.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-foreground">
                          ৳{course.fee.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button
                      render={
                        <Link href={`/admission?course=${course.slug}`} />
                      }
                      className="gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                      size="sm"
                    >
                      {t('readMore')}
                      <ArrowRight className="size-4" />
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
