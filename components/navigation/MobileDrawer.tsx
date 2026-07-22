'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/site-data'

import { useMobileMenu } from '@/hooks/useMobileMenu'

export function MobileDrawer() {
  const t = useTranslations('common')
  const { open, setOpen, panelRef } = useMobileMenu()

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-[50] h-full w-full max-w-sm transform border-l border-border bg-background transition-transform duration-200 ease-out lg:hidden',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
      ref={panelRef}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-foreground">{t('menu')}</span>
        <button
          onClick={() => setOpen(false)}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t('closeMenu')}
        >
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            {t(link.labelKey as any)}
          </Link>
        ))}
        <div className="mt-4 border-t border-border pt-4">
          <Link
            href="/auth/sign-in"
            onClick={() => setOpen(false)}
            className="block w-full rounded-md bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t('login')}
          </Link>
        </div>
      </nav>
    </div>
  )
}
