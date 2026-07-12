import { getCmsContent } from '@/lib/content-server'

export async function Counters() {
  const content = await getCmsContent()

  return (
    <section className="bg-brand py-14 md:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-3 lg:grid-cols-4">
        {content.counters.map((c) => (
          <div key={c.label} className="text-center">
            <p className="font-heading text-3xl font-extrabold text-brand-foreground sm:text-4xl md:text-5xl">
              {c.value}
            </p>
            <p className="mt-1.5 text-sm text-brand-foreground/80">{c.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
