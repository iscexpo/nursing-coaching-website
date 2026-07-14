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
    { icon: MapPin, label: t('address'), value: site.addressBn, href: undefined },
    { icon: Phone, label: t('phone'), value: site.phone, href: site.phoneHref },
    { icon: MessageCircle, label: t('whatsapp'), value: site.phone, href: site.whatsapp },
    { icon: Mail, label: t('email'), value: site.email, href: `mailto:${site.email}` },
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
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {CONTACTS.map((c, i) => {
              const content = (
                <FadeIn key={c.label} delay={i * 100}>
                  <div className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5 hover:-translate-y-0.5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                      <c.icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="mt-0.5 font-medium leading-relaxed text-foreground">{c.value}</p>
                    </div>
                  </div>
                </FadeIn>
              )
              return c.href ? (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                content
              )
            })}
          </div>
          <FadeIn delay={200} direction="right">
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
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
