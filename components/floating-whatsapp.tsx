'use client'

import { useTranslations } from 'next-intl'
import { MessageCircle } from 'lucide-react'
import { useSiteData } from '@/hooks/use-site-data'

export function FloatingWhatsApp() {
  const site = useSiteData()
  const t = useTranslations('common')
  return (
    <a
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsapp')}
      className="fixed bottom-5 right-5 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-green opacity-40 animate-pulse-ring" />
      <span className="relative flex items-center gap-2 rounded-full bg-green px-4 py-3 text-green-foreground shadow-lg shadow-green/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green/30">
        <MessageCircle className="size-5" />
        <span className="hidden text-sm font-semibold sm:inline">
          {t('whatsapp')}
        </span>
      </span>
    </a>
  )
}
