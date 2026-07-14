import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { Lightbox } from '@/components/ui/lightbox'
import { GALLERY } from '@/lib/site-data'
import { cn } from '@/lib/utils'

export function Gallery() {
  const lightboxImages = GALLERY.map((g) => ({
    src: g.image || '/placeholder.svg',
    alt: g.caption,
  }))

  return (
    <section id="gallery" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow="গ্যালারি"
            title="আমাদের মুহূর্তগুলো"
            description="সেমিনার, পুরস্কার বিতরণী, ফ্রি ক্লাস ও নানা আয়োজনের ঝলক।"
          />
        </FadeIn>
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {GALLERY.map((g, i) => (
            <FadeIn key={g.caption} delay={i * 80}>
              <Lightbox
                images={lightboxImages}
                trigger={
                  <div className={cn(
                    'group relative overflow-hidden rounded-2xl',
                    i === 0 ? 'aspect-[4/5] lg:row-span-2' : 'aspect-4/3',
                  )}>
                    <Image
                      src={g.image || '/placeholder.svg'}
                      alt={g.caption}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="font-medium text-card">{g.caption}</span>
                    </div>
                  </div>
                }
              />
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={400}>
          <div className="mt-8 text-center">
            <Button render={<Link href="/gallery" />} variant="outline" size="lg">
              সম্পূর্ণ গ্যালারি দেখুন
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
