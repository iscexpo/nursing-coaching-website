'use client'

import { useMobileMenu } from '@/hooks/useMobileMenu'
import { Button } from '@/components/ui/button'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useSiteData } from '@/hooks/use-site-data'

import { DesktopNav } from '@/components/navigation/DesktopNav'
import { MobileNavToggle } from '@/components/navigation/MobileNavToggle'
import { MobileDrawer } from '@/components/navigation/MobileDrawer'

export function SiteHeader() {
  const t = useTranslations('common')
  const th = useTranslations('header')
  const site = useSiteData()
  const { open, setOpen, panelRef, triggerRef } = useMobileMenu()

  return (
    <header className="sticky top-0 z-50 w-full bg-card backdrop-blur-md supports-[backdrop-filter]:bg-card/95 border-b border-border/50 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src={site.logo || '/logo.png'}
            alt={site.nameBn}
            width={40}
            height={25}
            className="object-contain"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-base font-bold text-foreground sm:text-lg">
              {site.nameBn}
            </span>
            <span className="text-xs text-muted-foreground">
              {site.city} · {th('established')}
            </span>
          </span>
        </Link>

        <DesktopNav t={t} th={th} />

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:flex" />
          <DarkModeToggle />
          <Button
            render={<Link href="/auth/sign-in" />}
            variant="outline"
            size="lg"
            className="hidden sm:inline-flex px-5"
          >
            {t('login')}
          </Button>
          <Button
            render={<Link href="/admission" />}
            size="lg"
            className="hidden sm:inline-flex px-6"
          >
            {t('enroll')}
          </Button>
          <MobileNavToggle
            onClick={() => setOpen(!open)}
            aria-label={t('openMenu')}
            isOpen={open}
          />
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <MobileDrawer />
    </header>
  )
}
