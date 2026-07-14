'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="উপরে যান"
      className="fixed bottom-5 left-5 z-50 flex size-10 items-center justify-center rounded-full border border-border bg-card/95 text-muted-foreground shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand hover:shadow-xl"
    >
      <ArrowUp className="size-5" />
    </button>
  )
}
