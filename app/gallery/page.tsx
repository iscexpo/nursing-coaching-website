import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { GALLERY, SITE } from '@/lib/site-data'
import { Breadcrumb } from '@/components/breadcrumb'

const CAPTION_FALLBACKS: Record<string, string> = {
  seminar: 'Seminar',
  prizeGiving: 'Prize Giving',
  batchPhoto: 'Batch Photo',
  freeClass: 'Free Class',
}

export const metadata = {
  title: `Gallery | ${SITE.name}`,
  description:
    `Photo gallery of ${SITE.name} — seminars, batch photos, prize giving ceremonies and classes.`,
  alternates: { canonical: '/gallery' },
}

export default function GalleryPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Breadcrumb items={[{ label: 'Gallery' }]} />
            <SectionHeading
              eyebrow="Gallery"
              title="Our Photos"
              description={`Photos from various events, seminars and classes at ${SITE.name}.`}
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GALLERY.map((g, i) => {
                const caption = CAPTION_FALLBACKS[g.captionKey] || g.captionKey
                return (
                  <div
                    key={i}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                  >
                    <Image
                      src={g.image}
                      alt={caption}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-sm font-semibold text-white">
                        {caption}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  )
}
