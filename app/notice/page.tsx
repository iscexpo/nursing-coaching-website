export const dynamic = 'force-dynamic'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import Link from 'next/link'
import { Breadcrumb } from '@/components/breadcrumb'
import { db } from '@/lib/db'
import { notices } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export const metadata = {
  title: 'নোটিশ | ISC Expo - Icon Skill & Career Expo',
  description: 'ISC Expo - Icon Skill & Career Expo-এর সর্বশেষ নোটিশ ও আপডেট।',
  alternates: { canonical: '/notice' },
}

async function getNotices() {
  try {
    return await db
      .select()
      .from(notices)
      .where(eq(notices.isPublished, true))
      .orderBy(desc(notices.isUrgent), desc(notices.createdAt))
      .limit(20)
  } catch {
    return []
  }
}

function formatDate(date: Date) {
  const d = new Date(date)
  return d.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function NoticePage() {
  const allNotices = await getNotices()

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Breadcrumb items={[{ label: 'নোটিশ' }]} />
            <SectionHeading
              eyebrow="নোটিশ বোর্ড"
              title="সকল নোটিশ"
              description="ISC Expo - Icon Skill & Career Expo-এর সর্বশেষ নোটিশ, আপডেট ও গুরুত্বপূর্ণ তথ্য।"
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-4">
            {allNotices.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  কোনো নোটিশ নেই
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  শীঘ্রই নোটিশ প্রকাশিত হবে।
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allNotices.map((n) => (
                  <Link
                    key={n.id}
                    href={`/notice/${n.id}`}
                    className={`block rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 ${
                      n.isUrgent ? 'border-gold/50' : 'border-border'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          n.isUrgent
                            ? 'bg-gold/10 text-gold'
                            : 'bg-secondary text-brand'
                        }`}
                      >
                        {n.tag}
                      </span>
                      {n.isUrgent && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                          জরুরি
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 font-heading text-base font-semibold text-foreground sm:text-lg">
                      {n.title}
                    </h3>
                    {n.content && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {n.content}
                      </p>
                    )}
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
