import Link from 'next/link'
import Image from 'next/image'
import { Check, PlayCircle, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { getCmsContent } from '@/lib/content-server'

export async function Hero() {
  const t = await getTranslations('hero')
  const content = await getCmsContent()
  const hero = content.hero

  return (
    <section className="relative overflow-hidden bg-brand">
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/images/classroom.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-brand/80 via-brand/60 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20 lg:px-8">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="mt-8 lg:mt-0 animate-fade-in-up" style={{ animationDuration: '700ms' }}>
            <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border-4 border-brand-foreground/20 shadow-2xl lg:aspect-square">
              <Image
                src="/images/hero.jpeg"
                alt="ISC Expo - Icon Skill & Career Expo student"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="text-brand-foreground animate-fade-in-up" style={{ animationDuration: '700ms' }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-foreground/15 px-4 py-1.5 text-xs font-medium backdrop-blur-sm sm:text-sm">
              <span className="size-2 rounded-full bg-gold animate-pulse" />
              {hero.eyebrow || t('eyebrow')}
            </span>

            <h1 className="mt-4 font-heading text-2xl font-extrabold leading-tight text-balance sm:text-3xl md:text-4xl lg:text-5xl">
              <span className="inline-block">
                {hero.title.split(' ').length > 3 ? (
                  <>
                    {hero.title.split(' ').slice(0, -3).join(' ')}{' '}
                    <span className="mt-1 block text-gold">
                      {hero.title.split(' ').slice(-3).join(' ')}
                    </span>
                  </>
                ) : (
                  <span className="text-gold">{hero.title}</span>
                )}
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-foreground/85 text-pretty">
              {hero.subtitle}
            </p>

            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {[
                t('features.coaching'),
                t('features.council'),
                t('features.bsc'),
                t('features.postBasic'),
                t('features.jobPrep'),
                t('features.modelTest'),
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm md:text-base text-brand-foreground/90 animate-fade-in-up"
                >
                  <Check className="size-4 shrink-0 text-gold" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                render={<Link href="/admission" />}
                size="lg"
                className="h-12 w-full touch-target bg-gold px-8 text-base font-semibold text-gold-foreground shadow-lg shadow-gold/25 transition-all hover:bg-gold/90 hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5 sm:w-auto"
              >
                {hero.primaryCta || t('primaryCta')}
                <ArrowRight className="size-4" />
              </Button>
              <Button
                render={<Link href="/#free-class" />}
                size="lg"
                className="h-12 w-full touch-target border border-brand-foreground/30 bg-brand-foreground/10 px-8 text-base font-semibold text-brand-foreground backdrop-blur-sm transition-all hover:bg-brand-foreground/20 hover:-translate-y-0.5 sm:w-auto"
              >
                <PlayCircle className="size-4" />
                {hero.secondaryCta || t('secondaryCta')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
