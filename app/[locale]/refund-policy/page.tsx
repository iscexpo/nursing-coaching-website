import { setRequestLocale, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { Breadcrumb } from '@/components/breadcrumb'
import { SITE } from '@/lib/site-data'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RefundPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('refundPolicyPage')
  const tc = await getTranslations('common')

  const sections = [
    { title: t('cancellationTitle'), body: t('cancellation') },
    { title: t('partialTitle'), body: t('partial') },
    { title: t('processingTitle'), body: t('processing') },
    { title: t('exceptionsTitle'), body: t('exceptions') },
  ]

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <Breadcrumb items={[{ label: tc('refundPolicy') }]} />
            <SectionHeading
              eyebrow={tc('refundPolicy')}
              title={t('title')}
              description={t('lastUpdated')}
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('intro')}
              </p>
              {sections.map((s, i) => (
                <div key={i} className="mt-10">
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    {i + 1}. {s.title}
                  </h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {s.body}
                  </p>
                </div>
              ))}
              <div className="mt-10">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {sections.length + 1}. {t('contactTitle')}
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {t('contact', {
                    email: SITE.email,
                    phone: SITE.phone,
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  )
}
