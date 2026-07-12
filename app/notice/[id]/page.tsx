import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { notices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { Breadcrumb } from '@/components/breadcrumb'
import { JsonLd } from '@/components/json-ld'
import { SITE } from '@/lib/site-data'

type Props = { params: Promise<{ id: string }> }

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  let notice: typeof notices.$inferSelect | null = null
  try {
    const rows = await db.select().from(notices).where(eq(notices.id, id)).limit(1)
    notice = rows[0] ?? null
  } catch {
    notice = null
  }

  if (!notice) {
    return { title: 'নোটিশ পাওয়া যায়নি | কর্নিয়া নার্সিং কোচিং', robots: { index: false } }
  }

  const title = `${notice.title} | কর্নিয়া নার্সিং কোচিং`
  const description = (notice.content || '').slice(0, 160)
  return {
    title,
    description,
    alternates: { canonical: `/notice/${id}` },
    openGraph: { type: 'article', title, description, url: `${SITE.url}/notice/${id}` },
  }
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params
  let notice: typeof notices.$inferSelect | null = null
  try {
    const rows = await db.select().from(notices).where(eq(notices.id, id)).limit(1)
    notice = rows[0] ?? null
  } catch {
    notice = null
  }

  if (!notice) notFound()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: notice.title,
    articleBody: notice.content || '',
    datePublished: new Date(notice.createdAt).toISOString(),
    dateModified: new Date(notice.updatedAt).toISOString(),
    publisher: { '@type': 'Organization', name: SITE.nameBn, sameAs: SITE.url },
  }

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-10 md:py-14">
          <div className="mx-auto max-w-3xl px-4">
            <Breadcrumb items={[{ label: 'নোটিশ', href: '/notice' }, { label: notice.title }]} />
            <SectionHeading eyebrow="নোটিশ" title={notice.title} />
            <p className="mt-2 text-sm text-muted-foreground">{formatDate(notice.createdAt)}</p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-3xl px-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
              <p className="whitespace-pre-line leading-relaxed text-foreground">{notice.content}</p>
            </div>
          </div>
        </section>
      </main>
      <FloatingWhatsApp />
      <SiteFooter />
    </>
  )
}
