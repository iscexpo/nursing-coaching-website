'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { NAV_LINKS } from '@/lib/cms/site-data'

interface DesktopNavProps {
  t: ReturnType<typeof useTranslations>
}

export function DesktopNav({ t: tRaw }: DesktopNavProps) {
  const t = tRaw as unknown as (key: string) => string
  return (
    <nav
      className="hidden items-center gap-0.5 lg:flex"
      aria-label="Main navigation"
    >
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-primary"
        >
          {t(link.labelKey)}
        </Link>
      ))}
    </nav>
  )
}
