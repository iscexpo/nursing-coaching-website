import {
  Trophy,
  BookOpen,
  FileText,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { getCmsContent } from '@/lib/cms/server'

const ICON_LIST: LucideIcon[] = [Trophy, BookOpen, FileText, Target]

export async function WhyUs() {
  const t = await getTranslations('whyUs')
  const content = await getCmsContent()
  return (
    <section className="relative bg-gradient-to-b from-background to-blue-50/30 dark:to-blue-950/10 py-20 md:py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />
        </FadeIn>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.whyCornia.map((item, i) => {
            const Icon = ICON_LIST[i % ICON_LIST.length]
            const colors = [
              'bg-blue-600',
              'bg-purple-600',
              'bg-green-600',
              'bg-amber-600',
            ]
            const lightColors = [
              'bg-blue-100 dark:bg-blue-900/30',
              'bg-purple-100 dark:bg-purple-900/30',
              'bg-green-100 dark:bg-green-900/30',
              'bg-amber-100 dark:bg-amber-900/30',
            ]
            return (
              <FadeIn key={item.title} delay={i * 80}>
                <div className="group relative h-full rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/40 dark:hover:border-white/20 hover:bg-white/60 dark:hover:bg-slate-900/60 hover:shadow-xl hover:shadow-blue-500/10">
                  {/* Icon background */}
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl ${lightColors[i % 4]} transition-all duration-300 group-hover:scale-110`}
                  >
                    <Icon className={`size-6 ${colors[i % 4]} text-white`} />
                  </div>

                  {/* Content */}
                  <h3 className="mt-4 text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>

                  {/* Hover accent */}
                  <div className="absolute bottom-0 right-0 h-1 w-0 bg-gradient-to-r from-transparent to-blue-600 dark:to-blue-400 transition-all duration-300 group-hover:w-full rounded-full" />
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
