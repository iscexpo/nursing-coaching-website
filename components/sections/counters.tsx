'use client'

import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({
  value,
  label,
  delay = 0,
}: {
  value: string
  label: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center">
      <p
        className="font-heading text-3xl font-extrabold text-brand-foreground transition-all duration-700 sm:text-4xl md:text-5xl"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
          transitionDelay: `${delay}ms`,
        }}
      >
        {value}
      </p>
      <p className="mt-1.5 text-sm text-brand-foreground/80">{label}</p>
    </div>
  )
}
