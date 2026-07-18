'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
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
        'fixed inset-y-0 right-0 z-[50] h-full w-full max-w-sm transform border-l border-border/50 bg-card shadow-xl transition-transform duration-300 ease-in-out lg:hidden',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
      ref={panelRef}
    >
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <h2 className="font-heading text-xl font-bold text-foreground">
          {t('menu')}
        </h2>
        <button
          onClick={() => setOpen(false)}
          className="flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
          aria-label={t('closeMenu')}
        >
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex flex-col gap-1.5 p-4">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="flex items-center rounded-lg px-5 py-4 text-base font-medium text-foreground/80 transition-all duration-200 hover:bg-secondary/50 hover:text-brand"
          >
            {link.label}
          </Link>
        ))}
        <div className="mt-8 flex flex-col gap-4 border-t border-border/50 pt-6">
          <LanguageSwitcher className="justify-center" />
          <Button
            render={
              <Link href="/auth/sign-in" onClick={() => setOpen(false)} />
            }
            variant="outline"
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {t('login')}
          </Button>
          <Button
            render={
              <Link href="/admission" onClick={() => setOpen(false)} />
            }
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {t('enroll')}
          </Button>
        </div>
      </nav>
    </div>
  )
}