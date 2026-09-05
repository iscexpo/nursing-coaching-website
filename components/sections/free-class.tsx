import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { CalendarDays, Clock, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/fade-in'

async function getNextFriday(locale: string): Promise<string> {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7
  const next = new Date(now)
  next.setDate(now.getDate() + daysUntilFriday)
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'bn-BD', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(next)
}

export async function FreeClass() {
  const t = await getTranslations('freeClass')
  const locale = await getLocale()

  const INFO = [
    {
      icon: CalendarDays,
      label: t('date'),
      value: await getNextFriday(locale),
    },
    { icon: Clock, label: t('time'), value: t('timeValue') },
    { icon: Users, label: t('seatsLeft'), value: t('seatsCount') },
  ]

  return (
    <section id="free-class" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn>
          <div className="overflow-hidden rounded-lg border border-border bg-muted/50 px-6 py-10 sm:px-10 md:py-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {t('badge')}
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                  {t('title')}
                </h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  {t('description')}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {INFO.map((item, i) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
                    >
                      <item.icon className="size-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                render={<Link href="/admission?type=free-class" />}
                size="lg"
                className="h-11 px-7"
              >
                {t('register')}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
