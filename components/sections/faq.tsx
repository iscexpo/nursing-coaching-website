import { getTranslations } from 'next-intl/server'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { getCmsContent } from '@/lib/content-server'
import { FaqAccordion } from './faq-accordion'

export async function Faq() {
  const t = await getTranslations('faqSection')
  const content = await getCmsContent()
  const faqs = content.faqs

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
          />
        </FadeIn>
        {faqs.length > 0 ? (
          <FaqAccordion faqs={faqs} />
        ) : (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            {t('noFaq')}
          </div>
        )}
      </div>
    </section>
  )
}
