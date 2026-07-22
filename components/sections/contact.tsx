'use client'

import { useTranslations } from 'next-intl'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { useSiteData } from '@/hooks/use-site-data'

export function Contact() {
  const site = useSiteData()
  const t = useTranslations('common')
  const tc = useTranslations('contact')

  const CONTACTS = [
    {
      icon: MapPin,
      label: t('address'),
      value: site.addressBn,
      href: undefined,
    },
    { icon: Phone, label: t('phone'), value: site.phone, href: site.phoneHref },
    {
      icon: MessageCircle,
      label: t('whatsapp'),
      value: site.phone,
      href: site.whatsapp,
    },
    {
      icon: Mail,
      label: t('email'),
      value: site.email,
      href: `mailto:${site.email}`,
    },
  ]

  return (
    <section id="contact" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow={tc('eyebrow')}
            title={tc('title')}
            description={tc('description')}
          />
        </FadeIn>
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {CONTACTS.map((c, i) => {
              const content = (
                <FadeIn key={c.label} delay={i * 80}>
                  <div className="flex h-full items-start gap-3 rounded-lg border border-border p-4 transition-colors duration-200 hover:border-neutral-300 dark:hover:border-neutral-700">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                      <c.icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="mt-0.5 text-sm font-medium leading-relaxed text-foreground">
                        {c.value}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              )
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              ) : (
                content
              )
            })}
          </div>
          <FadeIn delay={200}>
            <div className="overflow-hidden rounded-lg border border-border">
              <iframe
                title={tc('mapTitle')}
                src="https://www.google.com/maps?q=Khulna+Medical+College+Hospital&output=embed"
                className="h-full min-h-[300px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
