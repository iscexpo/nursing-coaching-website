import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Home, ChevronRight } from 'lucide-react'
import { JsonLd, breadcrumbJsonLd } from '@/components/json-ld'
import { SITE } from '@/lib/site-data'
import { cn } from '@/lib/utils'

export type Crumb = { label: string; href?: string }

export async function Breadcrumb({ items, className = '' }: { items: Crumb[]; className?: string }) {
  const t = await getTranslations('breadcrumb')
  const full: Crumb[] = [{ label: t('home'), href: '/' }, ...items]

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          full.map((i) => ({ name: i.label, url: `${SITE.url}${i.href ?? ''}` }))
        )}
      />
      <nav aria-label="Breadcrumb" className={cn('mb-6', className)}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          {full.map((c, i) => {
            const isLast = i === full.length - 1
            return (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
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
                  <span className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5',
                    isLast ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}>
                    {i === 0 && <Home className="size-3.5" />}
                    <span>{c.label}</span>
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
