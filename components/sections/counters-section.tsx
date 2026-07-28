import { getCmsContent } from '@/lib/content-server'
import { AnimatedCounter } from './counters'

export async function Counters() {
  const content = await getCmsContent()

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-900 dark:via-blue-950 dark:to-slate-900 py-16 md:py-20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.counters.map((c, i) => (
            <div 
              key={c.label}
              className="group rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-6 text-center transition-all duration-300 hover:bg-white/20 hover:border-white/40"
            >
              <AnimatedCounter
                value={c.value}
                label={c.label}
                delay={i * 120}
              />
              <div className="mt-3 h-1 w-0 mx-auto bg-white/50 rounded-full group-hover:w-1/3 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
