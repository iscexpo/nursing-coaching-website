import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { Breadcrumb } from '@/components/breadcrumb'
import { JsonLd } from '@/components/json-ld'
import { SITE } from '@/lib/site-data'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let course: typeof courses.$inferSelect | null = null
  try {
    const rows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1)
    course = rows[0] ?? null
  } catch {
    course = null
  }

  if (!course) {
    return {
      title: 'কোর্স পাওয়া যায়নি | ISC Expo - Icon Skill & Career Expo',
      robots: { index: false },
    }
  }

  const title = `${course.title} | ISC Expo - Icon Skill & Career Expo`
  const description = course.shortDescription || course.description
  return {
    title,
    description,
    alternates: { canonical: `/courses/${slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE.url}/courses/${slug}`,
      images: course.image ? [{ url: course.image }] : undefined,
    },
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  let course: typeof courses.$inferSelect | null = null
  try {
    const rows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1)
    course = rows[0] ?? null
  } catch {
    course = null
  }

  if (!course) notFound()

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    inLanguage: 'bn',
    provider: {
      '@type': 'Organization',
      name: SITE.nameBn,
      sameAs: SITE.url,
    },
    hasCourseInstance: course.duration
      ? {
          '@type': 'CourseInstance',
          courseMode: 'on-site',
          courseWorkload: course.duration,
        }
      : undefined,
  }

  return (
    <>
      <JsonLd data={courseJsonLd} />
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-10 md:py-14">
          <div className="mx-auto max-w-4xl px-4">
            <Breadcrumb items={[{ label: 'কোর্স', href: '/courses' }, { label: course.title }]} />
            <SectionHeading eyebrow="কোর্স বিবরণ" title={course.title} description={course.shortDescription || ''} />
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-4xl px-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
              {course.image && (
                <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-xl">
                  <Image src={course.image} alt={course.title} fill className="object-cover" />
                </div>
              )}
              <p className="whitespace-pre-line leading-relaxed text-foreground">{course.description}</p>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {course.duration && (
                  <div className="rounded-lg bg-secondary/40 p-4">
                    <dt className="text-xs text-muted-foreground">সময়কাল</dt>
                    <dd className="mt-1 font-semibold text-foreground">{course.duration}</dd>
                  </div>
                )}
                <div className="rounded-lg bg-secondary/40 p-4">
                  <dt className="text-xs text-muted-foreground">ফি</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    ৳{course.fee.toLocaleString()}
                    {course.discountFee ? ` (ছাড়: ৳${course.discountFee.toLocaleString()})` : ''}
                  </dd>
                </div>
                {course.schedule && (
                  <div className="rounded-lg bg-secondary/40 p-4">
                    <dt className="text-xs text-muted-foreground">সময়সূচি</dt>
                    <dd className="mt-1 font-semibold text-foreground">{course.schedule}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-8">
                <Link
                  href={`/admission?course=${course.slug}`}
                  className="inline-flex rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
                >
                  এই কোর্সে ভর্তি নিন
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FloatingWhatsApp />
      <SiteFooter />
    </>
  )
}
