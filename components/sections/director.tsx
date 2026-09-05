import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { FadeIn } from '@/components/ui/fade-in'

export async function Director() {
  const t = await getTranslations('director')
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <FadeIn>
          <div className="grid items-center gap-8 rounded-lg border border-border p-6 sm:p-10 lg:grid-cols-[280px_1fr]">
            <div className="mx-auto w-full max-w-[280px]">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src="/images/md.jpeg"
                  alt={t('name')}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-base font-semibold text-foreground">
                  {t('name')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('designation')}
                </p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {t('messageLabel')}
              </span>
              <p className="mt-4 text-base leading-relaxed text-foreground sm:text-lg">
                {t('message')}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {t('signOff')}
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
