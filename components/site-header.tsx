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
    const originalStyle = document.body.style.overflow
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <header className="sticky top-0 z-50 w-full bg-card backdrop-blur-md supports-[backdrop-filter]:bg-card/95 border-b border-border/50 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src={site.logo || '/logo.png'}
            alt={site.nameBn}
            width={200}
            className="h-auto object-contain"
          />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-all duration-200 hover:bg-secondary/50 hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

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
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon-lg"
            className="lg:hidden touch-target p-2"
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-[50] h-full w-full max-w-sm transform border-l border-border/50 bg-card shadow-xl transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
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
              render={<Link href="/admission" onClick={() => setOpen(false)} />}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {t('enroll')}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
