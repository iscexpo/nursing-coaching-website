import { Trophy, BookOpen, FileText, Target, type LucideIcon } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { getCmsContent } from '@/lib/content-server'

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  book: BookOpen,
  file: FileText,
  target: Target,
}

export async function WhyCornia() {
  const content = await getCmsContent()
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn>
          <SectionHeading
            eyebrow="কেন কর্নিয়া?"
            title="আপনার সাফল্যই আমাদের অঙ্গীকার"
            description="যে কারণে খুলনার শিক্ষার্থীরা নার্সিং প্রস্তুতির জন্য কর্নিয়াকে বেছে নেয়।"
          />
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.whyCornia.map((item, i) => {
            const Icon = ICONS.trophy
            return (
              <FadeIn key={item.title} delay={i * 100}>
                <div className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-brand-foreground group-hover:scale-110">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
