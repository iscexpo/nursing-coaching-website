import Link from 'next/link'
import Image from 'next/image'
import { Check, PlayCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCmsContent } from '@/lib/content-server'

export async function Hero() {
  const content = await getCmsContent()
  const hero = content.hero
  return (
    <section className="relative overflow-hidden bg-brand">
      <div className="absolute inset-0 opacity-10">
        <Image src="/images/classroom.png" alt="" fill className="object-cover" priority />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-brand/80 via-brand/60 to-transparent" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:py-20 lg:grid-cols-2">
        <div className="text-brand-foreground animate-fade-in-up" style={{ animationDuration: '700ms' }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-foreground/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <span className="size-2 rounded-full bg-gold animate-pulse" />
            {hero.eyebrow}
          </span>
          <h1 className="mt-5 font-heading text-3xl font-extrabold leading-tight text-balance sm:text-4xl md:text-5xl">
            {hero.title.split(' ').slice(0, -3).join(' ')}
            <span className="mt-1 block text-gold">{hero.title.split(' ').slice(-3).join(' ')}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-foreground/85 text-pretty">
            {hero.subtitle}
          </p>

          <ul className="mt-6 grid max-w-lg grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3 stagger-children">
            {['ভর্তি কোচিং', 'কাউন্সিল পরীক্ষা', 'B.Sc. Nursing', 'Post Basic B.Sc.', 'চাকরি প্রস্তুতি', 'মডেল টেস্ট'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-brand-foreground/90 animate-fade-in-up">
                <Check className="size-4 shrink-0 text-gold" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              render={<Link href="/admission" />}
              size="lg"
              className="h-12 bg-gold px-8 text-base font-semibold text-gold-foreground shadow-lg shadow-gold/25 transition-all hover:bg-gold/90 hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5"
            >
              {hero.primaryCta}
              <ArrowRight className="size-4" />
            </Button>
            <Button
              render={<Link href="/#free-class" />}
              size="lg"
              className="h-12 border border-brand-foreground/30 bg-brand-foreground/10 px-8 text-base font-semibold text-brand-foreground backdrop-blur-sm transition-all hover:bg-brand-foreground/20 hover:-translate-y-0.5"
            >
              <PlayCircle className="size-4" />
              {hero.secondaryCta}
            </Button>
          </div>
        </div>

        <div className="relative animate-slide-in-right" style={{ animationDuration: '800ms', animationDelay: '200ms' }}>
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl border-4 border-brand-foreground/20 shadow-2xl sm:aspect-square lg:aspect-4/5">
            <Image
              src="/images/hero.jpeg"
              alt="ISC Expo - Icon Skill & Career Expo-এর একজন শিক্ষার্থী"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-4 -left-4 hidden rounded-2xl bg-card p-4 shadow-xl animate-fade-in-up sm:block" style={{ animationDelay: '500ms' }}>
            <p className="font-heading text-2xl font-bold text-brand">৯৫%</p>
            <p className="text-xs text-muted-foreground">সাফল্যের হার</p>
          </div>
          <div className="absolute -right-3 top-6 hidden rounded-2xl bg-green px-4 py-3 text-green-foreground shadow-xl animate-fade-in-up sm:block" style={{ animationDelay: '700ms' }}>
            <p className="font-heading text-xl font-bold">৫০০০+</p>
            <p className="text-xs opacity-90">সফল শিক্ষার্থী</p>
          </div>
        </div>
      </div>
    </section>
  )
}
