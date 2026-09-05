import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, PlayCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCmsContent } from '@/lib/content-server'

const features = ['ভর্তি কোচিং', 'B.Sc. Nursing', 'কাউন্সিল পরীক্ষা', 'চাকরি প্রস্তুতি']

export async function Hero() {
  const content = await getCmsContent()
  const hero = content.hero

  return (
    <section className="relative overflow-hidden bg-brand">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,193,7,0.22),transparent_30%),radial-gradient(circle_at_0%_100%,rgba(0,0,0,0.18),transparent_35%)]" />
      <div className="absolute right-0 top-0 h-full w-1/2 bg-white/[0.03] [clip-path:polygon(28%_0,100%_0,100%_100%,0%_100%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-14 sm:px-6 md:pb-28 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
        <div className="max-w-2xl text-brand-foreground animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-foreground/20 bg-brand-foreground/10 px-3 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="size-4 text-gold" />
            <span>{hero.eyebrow}</span>
          </div>
          <h1 className="mt-6 max-w-2xl font-heading text-4xl font-extrabold leading-[1.12] tracking-tight text-balance sm:text-5xl md:text-6xl">
            {hero.title.split(' ').slice(0, -3).join(' ')}{' '}
            <span className="text-gold">{hero.title.split(' ').slice(-3).join(' ')}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-brand-foreground/80 sm:text-lg">
            {hero.subtitle}
          </p>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
            {features.map((feature) => (
              <span key={feature} className="flex items-center gap-2 text-sm text-brand-foreground/90">
                <span className="flex size-5 items-center justify-center rounded-full bg-gold/20">
                  <Check className="size-3.5 text-gold" />
                </span>
                {feature}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              render={<Link href="/admission" />}
              size="lg"
              className="h-12 rounded-xl bg-gold px-7 text-base font-bold text-gold-foreground shadow-lg shadow-black/10 hover:bg-gold/90"
            >
              {hero.primaryCta}
              <ArrowRight className="size-4" />
            </Button>
            <Button
              render={<Link href="/#free-class" />}
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-brand-foreground/25 bg-transparent px-7 text-base font-semibold text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground"
            >
              <PlayCircle className="size-4" />
              {hero.secondaryCta}
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 border-t border-brand-foreground/15 pt-6">
            <div>
              <p className="font-heading text-2xl font-bold text-gold">৫,০০০+</p>
              <p className="text-xs text-brand-foreground/65">সফল শিক্ষার্থী</p>
            </div>
            <div className="h-9 w-px bg-brand-foreground/20" />
            <div>
              <p className="font-heading text-2xl font-bold text-gold">৯৫%</p>
              <p className="text-xs text-brand-foreground/65">সাফল্যের হার</p>
            </div>
            <div className="h-9 w-px bg-brand-foreground/20" />
            <div>
              <p className="font-heading text-2xl font-bold text-gold">১০+</p>
              <p className="text-xs text-brand-foreground/65">বছরের অভিজ্ঞতা</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg animate-slide-in-right">
          <div className="absolute -inset-4 rounded-[2rem] border border-gold/20" />
          <div className="relative aspect-[4/4.5] overflow-hidden rounded-[1.75rem] border-4 border-brand-foreground/15 bg-brand-foreground/10 shadow-2xl">
            <Image
              src="/images/hero.jpeg"
              alt="ISC Expo-এর একজন নার্সিং শিক্ষার্থী"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-brand-foreground">
              <div>
                <p className="text-sm text-brand-foreground/75">আপনার স্বপ্নের ক্যারিয়ার</p>
                <p className="mt-1 font-heading text-xl font-bold">নার্সিংয়ে সফলতার যাত্রা</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-lg">
                <ArrowRight className="size-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
