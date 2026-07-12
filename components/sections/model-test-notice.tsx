import Link from 'next/link'
import { FileText, ArrowRight, Bell, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { notices } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function ModelTestAndNotice() {
  let data: { id: string; title: string; tag: string; isUrgent: boolean; createdAt: Date }[] = []
  try {
    data = await db.select({
      id: notices.id,
      title: notices.title,
      tag: notices.tag,
      isUrgent: notices.isUrgent,
      createdAt: notices.createdAt,
    }).from(notices)
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
        <div className="flex flex-col justify-between rounded-3xl bg-brand p-8 text-brand-foreground">
          <div>
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-foreground/15">
              <FileText className="size-6" />
            </span>
            <h2 className="mt-5 font-heading text-2xl font-bold sm:text-3xl">অনলাইন মডেল টেস্ট</h2>
            <p className="mt-3 max-w-md leading-relaxed text-brand-foreground/85">
              সর্বশেষ সিলেবাস অনুযায়ী তৈরি ফ্রি মডেল টেস্ট দিয়ে নিজেকে যাচাই করুন। তাৎক্ষণিক ফলাফল ও
              বিস্তারিত সমাধান।
            </p>
            <ul className="mt-5 flex flex-wrap gap-2 text-sm">
              {['MCQ ব্যাংক', 'তাৎক্ষণিক রেজাল্ট', 'র‍্যাংকিং', 'সমাধান'].map((t) => (
                <li key={t} className="rounded-full bg-brand-foreground/10 px-3 py-1">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <Button
            render={<Link href="/exam" />}
            size="lg"
            className="mt-8 h-11 w-fit bg-gold px-6 text-base font-semibold text-gold-foreground hover:bg-gold/90"
          >
            ফ্রি টেস্ট শুরু করুন
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Notice Board */}
        <div className="rounded-3xl border border-border bg-card p-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
              <Megaphone className="size-6 text-brand" />
              নোটিশ বোর্ড
            </h2>
            <Button render={<Link href="/notice" />} variant="ghost" size="sm" className="text-brand">
              সব দেখুন
            </Button>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {data.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">কোনো নোটিশ নেই</li>
            ) : (
              data.map((n) => (
                <li key={n.id} className="flex items-start gap-3 py-3.5">
                  <span
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      n.isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-brand'
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
                      <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString('bn-BD')}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{n.title}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
