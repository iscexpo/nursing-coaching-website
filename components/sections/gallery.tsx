import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { Lightbox } from '@/components/ui/lightbox'
import { getCmsContent } from '@/lib/content-server'
import { cn } from '@/lib/utils'

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

export async function Gallery() {
  const t = await getTranslations('galleryPage')
  const tc = await getTranslations('common')
  const content = await getCmsContent()
  const mediaImages = await getGalleryImages()

  const gallery =
    mediaImages.length > 0
      ? mediaImages.map((img) => ({
          image: img.url,
          caption: img.altText || img.description || '',
        }))
      : content.gallery

  const lightboxImages = gallery.map((g) => ({
    src: g.image || '/placeholder.svg',
    alt: g.caption,
  }))

  return (
    <section id="gallery" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow={tc('gallery')}
            title={t('title')}
            description={t('description')}
          />
        </FadeIn>
        <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4 auto-rows-[200px]">
          {gallery.map((g, i) => (
            <FadeIn key={g.caption + i} delay={i * 60}>
              <Lightbox
                images={lightboxImages}
                trigger={
                  <div
                    className={cn(
                      'group relative overflow-hidden rounded-lg',
                      i === 0 ? 'lg:row-span-2' : '',
                    )}
                  >
                    <Image
                      src={g.image || '/placeholder.svg'}
                      alt={g.caption}
                      fill
                      className="object-cover transition-opacity duration-200 group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="text-sm font-medium text-white">
                        {g.caption}
                      </span>
                    </div>
                  </div>
                }
              />
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={300}>
          <div className="mt-8 text-center">
            <Button
              render={<Link href="/gallery" />}
              variant="outline"
              size="lg"
            >
              {tc('viewAll')}
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
