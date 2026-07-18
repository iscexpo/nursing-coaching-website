import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { getCmsContent } from '@/lib/content-server'
import { FaqAccordion } from './faq-accordion'

export async function Faq() {
  const content = await getCmsContent()
  const faqs = content.faqs

  return (
    <section className="bg-secondary/50 py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow="সাধারণ জিজ্ঞাসা"
            title="আপনার প্রশ্ন, আমাদের উত্তর"
          />
        </FadeIn>
        {faqs.length > 0 ? (
          <FaqAccordion faqs={faqs} />
        ) : (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            কোনো FAQ পাওয়া যায়নি।
          </div>
        )}
      </div>
    </section>
  )
}
