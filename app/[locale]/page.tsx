import { setRequestLocale } from 'next-intl/server'
import { SiteHeader } from '@/components/navigation'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { BackToTop } from '@/components/back-to-top'
import { Hero } from '@/components/sections/hero'
import { WhyUs } from '@/components/sections/why-us'
import { Courses } from '@/components/sections/courses'
import { Counters } from '@/components/sections/counters-section'
import { SuccessStories } from '@/components/sections/success-stories'
import { Director } from '@/components/sections/director'
import { Teachers } from '@/components/sections/teachers'
import { FreeClass } from '@/components/sections/free-class'
import { ModelTestAndNotice } from '@/components/sections/model-test-notice'
import { Gallery } from '@/components/sections/gallery'
import { Faq } from '@/components/sections/faq'
import { Contact } from '@/components/sections/contact'
import { JsonLd } from '@/components/json-ld'
import { getCmsContent } from '@/lib/content-server'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const content = await getCmsContent()

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <SiteHeader />
      <main>
        <Hero />
        <WhyUs />
        <Courses />
        <Counters />
        <SuccessStories />
        <Director />
        <Teachers />
        <FreeClass />
        <ModelTestAndNotice />
        <Gallery />
        <Faq />
        <Contact />
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
      <BackToTop />
    </>
  )
}
