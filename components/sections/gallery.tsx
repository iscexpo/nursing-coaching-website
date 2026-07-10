import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { GALLERY } from '@/lib/site-data'

export function Gallery() {
  return (
    <section id="gallery" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="গ্যালারি"
          title="আমাদের মুহূর্তগুলো"
          description="সেমিনার, পুরস্কার বিতরণী, ফ্রি ক্লাস ও নানা আয়োজনের ঝলক।"
        />
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {GALLERY.map((g) => (
            <div
              key={g.caption}
              className="group relative aspect-4/3 overflow-hidden rounded-2xl"
            >
              <Image
                src={g.image || '/placeholder.svg'}
                alt={g.caption}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/70 to-transparent p-4">
                <span className="font-medium text-card">{g.caption}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button render={<Link href="/gallery" />} variant="outline" size="lg">
            সম্পূর্ণ গ্যালারি দেখুন
          </Button>
        </div>
      </div>
    </section>
  )
}
