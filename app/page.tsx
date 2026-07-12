export const dynamic = 'force-dynamic'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { Hero } from '@/components/sections/hero'
import { WhyCornia } from '@/components/sections/why-cornia'
import { Courses } from '@/components/sections/courses'
import { Counters } from '@/components/sections/counters'
import { SuccessStories } from '@/components/sections/success-stories'
import { Director } from '@/components/sections/director'
import { Teachers } from '@/components/sections/teachers'
import { FreeClass } from '@/components/sections/free-class'
import { ModelTestAndNotice } from '@/components/sections/model-test-notice'
import { Gallery } from '@/components/sections/gallery'
import { Faq } from '@/components/sections/faq'
import { Contact } from '@/components/sections/contact'
import { JsonLd } from '@/components/json-ld'
import { defaultCmsContent } from '@/lib/content-cms'

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: defaultCmsContent.faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <SiteHeader />
      <main>
        <Hero />
        <WhyCornia />
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
    </>
  )
}
