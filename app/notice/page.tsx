import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { SectionHeading } from '@/components/section-heading'
import { NOTICES } from '@/lib/site-data'

export const metadata = {
  title: 'নোটিশ | কর্নিয়া নার্সিং কোচিং',
  description: 'কর্নিয়া নার্সিং কোচিং-এর সর্বশেষ নোটিশ ও আপডেট।',
}

export default function NoticePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-b from-brand/5 to-background py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              eyebrow="নোটিশ বোর্ড"
              title="সকল নোটিশ"
              description="কর্নিয়া নার্সিং কোচিং-এর সর্বশেষ নোটিশ, আপডেট ও গুরুত্বপূর্ণ তথ্য।"
            />
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <div className="space-y-4">
              {NOTICES.map((n, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 ${
                    n.urgent ? 'border-gold/50' : 'border-border'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        n.urgent
                          ? 'bg-gold/10 text-gold'
                          : 'bg-secondary text-brand'
                      }`}
                    >
                      {n.tag}
                    </span>
                    {n.urgent && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                        জরুরি
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {n.date}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-base font-semibold text-foreground sm:text-lg">
                    {n.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </>
  )
}
