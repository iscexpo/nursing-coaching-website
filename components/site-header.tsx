'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Menu, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NAV_LINKS } from '@/lib/site-data'
import { useSiteData } from '@/hooks/use-site-data'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const site = useSiteData()
  const t = useTranslations('common')
  const th = useTranslations('header')
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="hidden bg-brand text-brand-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <p>{th('welcome')} {site.nameBn}, {site.city} — {site.tagline}</p>
          <div className="flex items-center gap-4">
            <a href={site.phoneHref} className="flex items-center gap-1.5 hover:underline">
              <Phone className="size-3.5" />
              {site.phone}
            </a>
            <span className="rounded-full bg-gold px-2.5 py-0.5 font-semibold text-gold-foreground">
              {th('enrollingNow')}
            </span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <img src={site.logo || '/logo.png'} alt={site.nameBn} width={40} height={25} className="object-contain" />
            <span className="flex flex-col leading-tight">
              <span className="font-heading text-base font-bold text-foreground sm:text-lg">
                {site.nameBn}
              </span>
              <span className="text-xs text-muted-foreground">{site.city} · {th('established')}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitcher className="hidden sm:flex" />
            <DarkModeToggle />
            <Button
              render={<Link href="/auth/sign-in" />}
              variant="outline"
              size="lg"
              className="hidden sm:inline-flex"
            >
              {t('login')}
            </Button>
            <Button render={<Link href="/admission" />} size="lg" className="hidden sm:inline-flex">
              {t('enroll')}
            </Button>
            <Button
              ref={triggerRef}
              variant="ghost"
              size="icon-lg"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={t('openMenu')}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu - slide in panel */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
        <div
          className={cn(
            'fixed inset-y-0 right-0 z-[60] w-72 border-l border-border bg-card p-4 shadow-2xl transition-transform duration-300 ease-out lg:hidden',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="font-heading text-sm font-bold text-foreground">{t('menu')}</span>
            <button
              onClick={() => setOpen(false)}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <LanguageSwitcher className="justify-center" />
              <Button render={<Link href="/auth/sign-in" onClick={() => setOpen(false)} />} variant="outline" className="w-full" size="lg">
                {t('login')}
              </Button>
              <Button render={<Link href="/admission" onClick={() => setOpen(false)} />} className="w-full" size="lg">
                {t('enroll')}
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
