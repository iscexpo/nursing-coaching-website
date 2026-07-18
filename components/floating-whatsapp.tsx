'use client'

import { MessageCircle } from 'lucide-react'
import { useSiteData } from '@/hooks/use-site-data'

export function FloatingWhatsApp() {
  const site = useSiteData()
  return (
    <a
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="হোয়াটসঅ্যাপে চ্যাট করুন"
      className="fixed bottom-5 right-5 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-green opacity-40 animate-pulse-ring" />
      <span className="relative flex items-center gap-2 rounded-full bg-green px-4 py-3 text-green-foreground shadow-lg shadow-green/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green/30">
        <MessageCircle className="size-5" />
        <span className="hidden text-sm font-semibold sm:inline">
          চ্যাট করুন
        </span>
      </span>
    </a>
  )
}
