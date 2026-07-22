'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { NAV_LINKS } from '@/lib/site-data'

interface DesktopNavProps {
  t: ReturnType<typeof useTranslations>
}

export function DesktopNav({ t }: DesktopNavProps) {
  return (
    <nav
      className="hidden items-center gap-0.5 lg:flex"
      aria-label="Main navigation"
    >
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          {t(link.labelKey as any)}
        </Link>
      ))}
    </nav>
  )
}
