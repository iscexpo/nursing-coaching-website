export const dynamic = 'force-dynamic'

import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumb } from '@/components/breadcrumb'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { db } from '@/lib/db'
import { courses } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const metadata = {
  title: 'Courses | ISC Expo - Icon Skill & Career Expo',
  description:
    'All courses at ISC Expo - Icon Skill & Career Expo — nursing admission, council, B.Sc Nursing, Post Basic, job preparation and online batches.',
  alternates: { canonical: '/courses' },
}

export default async function CoursesPage() {
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
  } catch {
    // fallback to empty
  }

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Breadcrumb items={[{ label: 'Courses' }]} />
            <SectionHeading
              eyebrow="Our Courses"
              title="All Courses"
              description="From BNMC admission exams to job preparation — experienced teachers and modern teaching methods in every course."
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4">
            {data.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No courses found
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/courses/${c.slug}`}
                    className="group rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
                      {c.image ? (
                        <Image
                          src={c.image}
                          alt={c.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-secondary text-muted-foreground">
                          No image
                        </div>
                      )}
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
                        {c.shortDescription || c.description?.slice(0, 100)}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-bold text-green">
                          ৳{c.fee.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-brand group-hover:underline">
                          Enroll →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  )
}
