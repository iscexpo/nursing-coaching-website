'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Story = {
  name: string
  college: string
  rank: string
  image: string
  quote: string
}

export function StoryCarousel({ stories }: { stories: Story[] }) {
  const [index, setIndex] = useState(0)
  const story = stories[index]
  const touchStart = useRef<number | null>(null)
  const t = useTranslations('common')

  const go = (dir: number) => {
    setIndex((i) => (i + dir + stories.length) % stories.length)
  }

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      go(diff > 0 ? 1 : -1)
    }
    touchStart.current = null
  }, [])

  return (
    <div
      className="mt-12 rounded-lg border border-border p-6 sm:p-10"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg sm:size-28">
          <Image
            src={story.image || '/placeholder.svg'}
            alt={story.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <Quote className="mx-auto size-7 text-muted-foreground sm:mx-0" />
          <p className="mt-3 text-lg leading-relaxed text-foreground text-pretty">
            &ldquo;{story.quote}&rdquo;
          </p>
          <p className="mt-4 text-base font-semibold text-foreground">
            {story.name}
          </p>
          <p className="text-sm text-muted-foreground">{story.college}</p>
          <span className="mt-2 inline-block rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {story.rank}
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => go(-1)}
          aria-label={t('previous')}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="flex gap-1.5">
          {stories.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`${t('story')} ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === index
                  ? 'w-6 bg-foreground'
                  : 'w-1.5 bg-border hover:bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => go(1)}
          aria-label={t('next')}
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  )
}
