'use client'

import { useEffect, useRef, useState } from 'react'
import { COUNTERS } from '@/lib/site-data'

function toBn(num: number) {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(num).replace(/\d/g, (d) => bn[Number(d)])
}

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true
            const duration = 1500
            const start = performance.now()
            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setDisplay(Math.round(value * eased))
              if (progress < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-center">
      <p className="font-heading text-3xl font-extrabold text-brand-foreground sm:text-4xl md:text-5xl">
        {toBn(display)}
        {suffix}
      </p>
      <p className="mt-1.5 text-sm text-brand-foreground/80">{label}</p>
    </div>
  )
}

export function Counters() {
  return (
    <section className="bg-brand py-14 md:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-3 lg:grid-cols-5">
        {COUNTERS.map((c) => (
          <Counter key={c.label} {...c} />
        ))}
      </div>
    </section>
  )
}
