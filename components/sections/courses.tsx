import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
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
      className="relative bg-gradient-to-b from-background via-background to-purple-50/20 dark:to-purple-950/10 py-20 md:py-28 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

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
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl transition-all duration-300 hover:border-white/40 dark:hover:border-white/20 hover:bg-white/60 dark:hover:bg-slate-900/60 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
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
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-foreground border border-white/30 dark:border-white/10">
                    ⏱️ {course.duration}
                  </span>
                  {/* Discount badge */}
                  {course.discountFee && course.discountFee < course.fee && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
                      🔥 Sale
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {course.shortDescription ||
                      course.description?.slice(0, 100)}
                  </p>

                  {/* Price and CTA */}
                  <div className="mt-6 flex items-center justify-between border-t border-white/20 dark:border-white/10 pt-4">
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
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2"
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
