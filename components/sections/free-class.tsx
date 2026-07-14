import Link from 'next/link'
import { CalendarDays, Clock, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/fade-in'

function getNextFriday(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7
  const next = new Date(now)
  next.setDate(now.getDate() + daysUntilFriday)
  const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
  return `${next.getDate()} ${bnMonths[next.getMonth()]}, শুক্রবার`
}

const INFO = [
  { icon: CalendarDays, label: 'তারিখ', value: getNextFriday() },
  { icon: Clock, label: 'সময়', value: 'সকাল ১০:০০টা' },
  { icon: Users, label: 'আসন বাকি', value: 'মাত্র ১৫টি' },
]

export function FreeClass() {
  return (
    <section id="free-class" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn>
          <div className="overflow-hidden rounded-3xl bg-green px-6 py-10 text-green-foreground shadow-xl shadow-green/10 sm:px-10 md:py-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="inline-block rounded-full bg-green-foreground/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  সম্পূর্ণ ফ্রি
                </span>
                <h2 className="mt-3 font-heading text-2xl font-bold text-balance sm:text-3xl md:text-4xl">
                  আগামী ফ্রি ক্লাসে অংশ নিন
                </h2>
                <p className="mt-2 max-w-xl text-green-foreground/85">
                  ISC Expo-এর পাঠদান পদ্ধতি সরাসরি অনুভব করুন — কোনো ফি ছাড়াই।
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {INFO.map((item, i) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl bg-green-foreground/10 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-green-foreground/15"
                    >
                      <item.icon className="size-6 shrink-0" />
                      <div>
                        <p className="text-xs text-green-foreground/75">{item.label}</p>
                        <p className="font-semibold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                render={<Link href="/admission?type=free-class" />}
                size="lg"
                className="h-12 bg-card px-8 text-base font-semibold text-green shadow-lg transition-all hover:bg-card/90 hover:shadow-xl hover:-translate-y-0.5"
              >
                রেজিস্টার করুন
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
