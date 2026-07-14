import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { GALLERY } from '@/lib/site-data'
import { Breadcrumb } from '@/components/breadcrumb'

export const metadata = {
  title: 'গ্যালারি | ISC - Icon Skill & Career Expo',
  description: 'ISC - Icon Skill & Career Expo-এর ছবি গ্যালারি — সেমিনার, ব্যাচ ফটো, পুরস্কার বিতরণী ও ক্লাসের ছবি।',
  alternates: { canonical: '/gallery' },
}

export default function GalleryPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Breadcrumb items={[{ label: 'গ্যালারি' }]} />
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              eyebrow="গ্যালারি"
              title="আমাদের ছবি"
              description="ISC - Icon Skill & Career Expo-এর বিভিন্ন অনুষ্ঠান, সেমিনার ও ক্লাসের ছবি।"
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GALLERY.map((g, i) => (
                <div
                  key={i}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
                  <Image
                    src={g.image}
                    alt={g.caption}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-sm font-semibold text-white">
                      {g.caption}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  )
}
