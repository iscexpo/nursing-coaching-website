'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { NAV_LINKS } from '@/lib/site-data'

interface DesktopNavProps {
  t: ReturnType<typeof useTranslations>
  th: ReturnType<typeof useTranslations>
}

export function DesktopNav({ t, th }: DesktopNavProps) {
  return (
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
  )
}