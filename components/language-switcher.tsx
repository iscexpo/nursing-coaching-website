'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { routing } from '@/i18n/routing'

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Globe className="size-4 text-muted-foreground" />
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={cn(
            'rounded-md px-2 py-1 text-xs font-medium transition-colors',
            locale === loc
              ? 'bg-brand text-brand-foreground'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          )}
          aria-label={loc === 'bn' ? t('bangla') : t('english')}
        >
          {loc === 'bn' ? 'বাং' : 'EN'}
        </button>
      ))}
    </div>
  )
}
