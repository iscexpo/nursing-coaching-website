import { getTranslations } from 'next-intl/server'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { getCmsContent } from '@/lib/content-server'
import { StoryCarousel } from './story-carousel'

export async function SuccessStories() {
  const t = await getTranslations('successStories')
  const content = await getCmsContent()
  const stories = content.successStories

  return (
    <section id="success" className="bg-secondary/50 py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />
        </FadeIn>
        {stories.length > 0 && (
          <FadeIn delay={200}>
            <StoryCarousel stories={stories} />
          </FadeIn>
        )}
      </div>
    </section>
  )
}
