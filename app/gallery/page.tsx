import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { Breadcrumb } from '@/components/breadcrumb'

export const dynamic = 'force-dynamic'

interface GalleryImage {
  id: string
  url: string
  altText: string | null
  description: string | null
}

async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${origin}/api/media/public?category=gallery`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

export default async function GalleryPage() {
  const images = await getGalleryImages()

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
              description="Photos from various events, seminars and classes."
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4">
            {images.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
                No gallery images available yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || img.description || ''}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    {(img.altText || img.description) && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-sm font-semibold text-white">
                          {img.altText || img.description}
                        </span>
                      </div>
                    )}
                  </div>
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
