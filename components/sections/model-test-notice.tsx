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
    <section id="notice" className="bg-background py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 lg:grid-cols-2">
        {/* Model Test */}
        <FadeIn direction="left">
          <div className="flex h-full flex-col justify-between rounded-lg border border-border bg-muted/50 p-8 sm:px-10 md:py-12">
            <div>
              <span className="flex size-10 items-center justify-center rounded-md bg-foreground text-background">
                <FileText className="size-5" />
              </span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t('modelTest.title')}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
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
                    className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tagText}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              render={<Link href="/exam" />}
              size="lg"
              className="mt-8 h-11 w-fit px-7"
            >
              {t('modelTest.startFree')}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </FadeIn>

        {/* Notice Board */}
        <FadeIn direction="right">
          <div className="h-full rounded-lg border border-border p-8">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Megaphone className="size-5 text-muted-foreground" />
                {t('noticeBoard.title')}
              </h2>
              <Button
                render={<Link href="/notice" />}
                variant="ghost"
                size="sm"
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
                    className="flex items-start gap-3 py-3.5 transition-colors hover:bg-muted/50 rounded-md px-2 -mx-2"
                  >
                    <span
                      className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${
                        n.isUrgent
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted text-muted-foreground'
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
                              : 'bg-muted text-muted-foreground'
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
