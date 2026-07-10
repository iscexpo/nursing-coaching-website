import { Trophy, BookOpen, FileText, Target, type LucideIcon } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { WHY_CORNIA } from '@/lib/site-data'

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  book: BookOpen,
  file: FileText,
  target: Target,
}

export function WhyCornia() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="কেন কর্নিয়া?"
          title="আপনার সাফল্যই আমাদের অঙ্গীকার"
          description="যে কারণে খুলনার শিক্ষার্থীরা নার্সিং প্রস্তুতির জন্য কর্নিয়াকে বেছে নেয়।"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CORNIA.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
