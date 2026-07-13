'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { STORIES } from '@/lib/site-data'

export function SuccessStories() {
  const [index, setIndex] = useState(0)
  const story = STORIES[index]

  const go = (dir: number) => {
    setIndex((i) => (i + dir + STORIES.length) % STORIES.length)
  }

  return (
    <section id="success" className="bg-secondary/50 py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow="সাফল্যের গল্প"
            title="আমাদের গর্বিত শিক্ষার্থীরা"
            description="যাদের স্বপ্নপূরণে কর্নিয়া পাশে ছিল।"
          />
        </FadeIn>

        <FadeIn delay={200}>
          <div className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-10">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border-4 border-secondary shadow-lg sm:size-28">
                <Image src={story.image || '/placeholder.svg'} alt={story.name} fill className="object-cover" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <Quote className="mx-auto size-8 text-gold sm:mx-0" />
                <p className="mt-3 text-lg leading-relaxed text-foreground text-pretty">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <div className="mt-4 flex justify-center gap-1 sm:justify-start">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-4 font-heading text-lg font-bold text-foreground">{story.name}</p>
                <p className="text-sm text-muted-foreground">{story.college}</p>
                <span className="mt-2 inline-block rounded-full bg-green/10 px-3 py-1 text-xs font-semibold text-green">
                  {story.rank}
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Button variant="outline" size="icon-lg" onClick={() => go(-1)} aria-label="আগের">
                <ChevronLeft className="size-5" />
              </Button>
              <div className="flex gap-1.5">
                {STORIES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`গল্প ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === index ? 'w-6 bg-brand' : 'w-2 bg-border hover:bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <Button variant="outline" size="icon-lg" onClick={() => go(1)} aria-label="পরের">
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
