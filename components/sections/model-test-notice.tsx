import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { FileText, ArrowRight, Bell, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/fade-in'
import { db } from '@/lib/db'
import { notices } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function ModelTestAndNotice() {
  const t = await getTranslations('modelTestNotice')
  let data: {
    id: string
    title: string
    tag: string
    isUrgent: boolean
    createdAt: Date
  }[] = []
  try {
    data = await db
      .select({
        id: notices.id,
        title: notices.title,
        tag: notices.tag,
        isUrgent: notices.isUrgent,
        createdAt: notices.createdAt,
      })
      .from(notices)
      .where(eq(notices.isPublished, true))
      .orderBy(desc(notices.isUrgent), desc(notices.createdAt))
      .limit(5)
  } catch {
    // fallback to empty
  }

  return (
    <section id="notice" className="bg-secondary/50 py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-2">
        {/* Model Test */}
        <FadeIn direction="left">
          <div className="flex h-full flex-col justify-between rounded-3xl bg-brand p-8 text-brand-foreground shadow-xl shadow-brand/10 sm:px-10 md:py-12">
            <div>
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand-foreground/15 backdrop-blur-sm">
                <FileText className="size-6" />
              </span>
              <h2 className="mt-5 font-heading text-2xl font-bold sm:text-3xl">
                {t('modelTest.title')}
              </h2>
              <p className="mt-3 max-w-md leading-relaxed text-brand-foreground/85">
                {t('modelTest.description')}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2 text-sm">
                {[
                  t('modelTest.tags.mcq'),
                  t('modelTest.tags.instant'),
                  t('modelTest.tags.ranking'),
                  t('modelTest.tags.solution'),
                ].map((tagText) => (
                  <li
                    key={tagText}
                    className="rounded-full bg-brand-foreground/10 px-3 py-1 backdrop-blur-sm"
                  >
                    {tagText}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              render={<Link href="/exam" />}
              size="lg"
              className="mt-8 h-12 w-fit bg-gold px-8 text-base font-semibold text-gold-foreground shadow-lg shadow-gold/25 transition-all hover:bg-gold/90 hover:shadow-xl hover:-translate-y-0.5"
            >
              {t('modelTest.startFree')}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </FadeIn>

        {/* Notice Board */}
        <FadeIn direction="right">
          <div className="h-full rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
                <Megaphone className="size-6 text-brand" />
                {t('noticeBoard.title')}
              </h2>
              <Button
                render={<Link href="/notice" />}
                variant="ghost"
                size="sm"
                className="text-brand"
              >
                View All
              </Button>
            </div>
            <ul className="mt-5 divide-y divide-border">
              {data.length === 0 ? (
                <li className="py-8 text-center text-sm text-muted-foreground">
                  {t('noticeBoard.noNotice')}
                </li>
              ) : (
                data.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 py-3.5 transition-colors hover:bg-secondary/50 rounded-lg px-2 -mx-2"
                  >
                    <span
                      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        n.isUrgent
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-secondary text-brand'
                      }`}
                    >
                      <Bell className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                            n.isUrgent
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-green/10 text-green'
                          }`}
                        >
                          {n.tag}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(n.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {n.title}
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
