import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { getCmsContent } from '@/lib/content-server'

export async function Hero() {
  const t = await getTranslations('hero')
  const content = await getCmsContent()
  const hero = content.hero

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5 min-h-[90vh] flex items-center">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient orb */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-32 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/30 dark:border-blue-800/30 bg-blue-50/40 dark:bg-blue-950/20 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                {hero.eyebrow || t('eyebrow')}
              </span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-balance leading-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent mb-6">
              {hero.title}
            </h1>

            {/* Supporting text */}
            <p className="text-lg md:text-xl text-muted-foreground/90 leading-relaxed mb-8 max-w-lg text-balance">
              {hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                render={<Link href="/admission" />}
                size="lg"
                className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
              >
                {hero.primaryCta || t('primaryCta')}
                <ArrowRight className="size-5" />
              </Button>
              <Button
                render={<Link href="/#courses" />}
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-xl border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50/40 dark:hover:bg-blue-950/40 transition-all duration-300"
              >
                {hero.secondaryCta || t('secondaryCta')}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">50,000+</p>
                  <p className="text-sm text-muted-foreground">Happy Students</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-foreground">98%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Floating cards illustration */}
          <div className="hidden lg:flex items-center justify-center relative h-[500px]">
            <div className="relative w-full h-full">
              {/* Floating card 1 */}
              <div className="absolute top-0 right-0 w-64 h-40 rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl p-6 animate-float">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">📚</div>
                  <h3 className="font-semibold text-foreground">Live Classes</h3>
                </div>
                <p className="text-sm text-muted-foreground">Expert instructors teaching live</p>
              </div>

              {/* Floating card 2 */}
              <div className="absolute bottom-20 left-0 w-64 h-40 rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl p-6 animate-float animation-delay-2000">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold">✓</div>
                  <h3 className="font-semibold text-foreground">Certificates</h3>
                </div>
                <p className="text-sm text-muted-foreground">Recognized by institutions</p>
              </div>

              {/* Floating card 3 */}
              <div className="absolute top-1/2 right-12 w-64 h-40 rounded-2xl bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl p-6 animate-float animation-delay-4000">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">🎯</div>
                  <h3 className="font-semibold text-foreground">Career Path</h3>
                </div>
                <p className="text-sm text-muted-foreground">Personalized guidance included</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
