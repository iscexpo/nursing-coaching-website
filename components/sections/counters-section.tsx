import { getCmsContent } from '@/lib/content-server'
import { AnimatedCounter } from './counters'

export async function Counters() {
  const content = await getCmsContent()

  return (
    <section className="relative overflow-hidden bg-brand py-14 md:py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/90 to-brand opacity-50" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-3 lg:grid-cols-4">
        {content.counters.map((c, i) => (
          <AnimatedCounter
            key={c.label}
            value={c.value}
            label={c.label}
            delay={i * 120}
          />
        ))}
      </div>
    </section>
  )
}
