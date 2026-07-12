import Link from 'next/link'
import { JsonLd, breadcrumbJsonLd } from '@/components/json-ld'
import { SITE } from '@/lib/site-data'

export type Crumb = { label: string; href?: string }

export function Breadcrumb({ items, className = '' }: { items: Crumb[]; className?: string }) {
  const full: Crumb[] = [{ label: 'হোম', href: '/' }, ...items]

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          full.map((i) => ({ name: i.label, url: `${SITE.url}${i.href ?? ''}` }))
        )}
      />
      <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {full.map((c, i) => (
            <li key={i} className="flex items-center gap-1">
              {c.href ? (
                <Link href={c.href} className="transition-colors hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{c.label}</span>
              )}
              {i < full.length - 1 && <span aria-hidden>›</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
