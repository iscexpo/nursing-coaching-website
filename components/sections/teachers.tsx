import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { getCmsContent } from '@/lib/cms/server'

export async function Teachers() {
  const t = await getTranslations('teachersSection')
  const content = await getCmsContent()
  const teachers = content.teachers

  return (
    <section id="teachers" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />
        </FadeIn>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teachers.map((teacher, i) => (
            <FadeIn key={teacher.name} delay={i * 80}>
              <div className="overflow-hidden rounded-lg border border-border text-center transition-colors duration-200 hover:border-neutral-300 dark:hover:border-neutral-700">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={teacher.image || '/placeholder.svg'}
                    alt={teacher.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {teacher.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {teacher.subject}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {teacher.qualification}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {teacher.experience}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
