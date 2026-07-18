'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Home, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Crumb = { label: string; href?: string }

export function Breadcrumb({
  items,
  className = '',
}: {
  items: Crumb[]
  className?: string
}) {
  const t = useTranslations('breadcrumb')
  const full: Crumb[] = [{ label: t('home'), href: '/' }, ...items]

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-6', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {full.map((c, i) => {
          const isLast = i === full.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground/50"
                  aria-hidden="true"
                />
              )}
              {c.href && !isLast ? (
                <Link
                  href={c.href}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {i === 0 && <Home className="size-3.5" />}
                  <span>{c.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5',
                    isLast
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {i === 0 && <Home className="size-3.5" />}
                  <span>{c.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
