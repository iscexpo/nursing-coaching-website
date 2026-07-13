'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

export function FadeIn({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 600,
  once = true,
}: {
  children: ReactNode
  className?: string
  direction?: Direction
  delay?: number
  duration?: number
  once?: boolean
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
          if (once) observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  const directionClass: Record<Direction, string> = {
    up: 'animate-fade-in-up',
    down: 'animate-fade-in-up',
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right',
    none: 'animate-fade-in',
  }

  return (
    <div
      ref={ref}
      className={cn(
        visible ? directionClass[direction] : 'opacity-0',
        direction === 'down' && '[animation-direction:reverse]',
        className,
      )}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
