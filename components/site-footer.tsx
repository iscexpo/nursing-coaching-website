'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ExternalLink, Video, MessageCircle, Phone, MapPin } from 'lucide-react'
import { useSiteData } from '@/hooks/use-site-data'

export function SiteFooter() {
  const site = useSiteData()
  const t = useTranslations('common')
  const tf = useTranslations('footer')

  const QUICK = [
    { label: t('courses'), href: '/courses' },
    { label: t('notice'), href: '/notice' },
    { label: t('gallery'), href: '/gallery' },
    { label: t('modelTest'), href: '/model-test' },
  ]

  const POLICIES = [
    { label: t('privacyPolicy'), href: '/privacy' },
    { label: t('refundPolicy'), href: '/refund' },
    { label: t('terms'), href: '/terms' },
  ]

  const socials = [
    { icon: ExternalLink, href: site.facebook, label: t('facebook') },
    { icon: Video, href: site.youtube, label: t('youtube') },
    { icon: MessageCircle, href: site.whatsapp, label: t('whatsapp') },
  ]
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src={site.logo || '/logo.png'}
              alt={site.nameBn}
              width={36}
              height={22}
              className="object-contain"
            />
            <span className="font-heading text-base font-bold">
              {site.nameBn}
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-background/70">
            {tf('description')}
          </p>
          <div className="mt-5 flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex size-9 items-center justify-center rounded-lg bg-background/10 transition-colors hover:bg-brand"
              >
                <s.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-background/60">
            {t('quickLinks')}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {QUICK.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-background/80 hover:text-background"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-background/60">
            {t('policies')}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {POLICIES.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-background/80 hover:text-background"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-background/60">
            {t('contact')}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-background/80">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              {site.addressBn}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-brand" />
              <a href={site.phoneHref} className="hover:text-background">
                {site.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-background/60">
          © {new Date().getFullYear()} {site.nameBn}, {site.city}.{' '}
          {t('allRightsReserved')}.
        </div>
      </div>
    </footer>
  )
}
