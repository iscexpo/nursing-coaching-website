'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LightboxItem {
  src: string
  alt: string
}

export function Lightbox({
  images,
  trigger,
}: {
  images: LightboxItem[]
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const close = useCallback(() => setOpen(false), [])
  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, close, prev, next])

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center lightbox-backdrop animate-fade-in"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="বন্ধ করুন"
          >
            <X className="size-5" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="আগের ছবি"
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-16"
            aria-label="পরের ছবি"
          >
            <ChevronRight className="size-5" />
          </button>

          <div
            className="relative max-h-[85vh] max-w-[90vw] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index].src}
              alt={images[index].alt}
              width={1200}
              height={800}
              className="max-h-[85vh] rounded-2xl object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-6 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIndex(i) }}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === index ? 'w-6 bg-white' : 'w-2 bg-white/40',
                )}
                aria-label={`ছবি ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
