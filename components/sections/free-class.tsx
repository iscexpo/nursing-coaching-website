import Link from 'next/link'
import { CalendarDays, Clock, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const INFO = [
  { icon: CalendarDays, label: 'তারিখ', value: '১৮ জুলাই, শুক্রবার' },
  { icon: Clock, label: 'সময়', value: 'সকাল ১০:০০টা' },
  { icon: Users, label: 'আসন বাকি', value: 'মাত্র ১৫টি' },
]

export function FreeClass() {
  return (
    <section id="free-class" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-3xl bg-green px-6 py-10 text-green-foreground sm:px-10 md:py-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-block rounded-full bg-green-foreground/15 px-3 py-1 text-xs font-semibold">
                সম্পূর্ণ ফ্রি
              </span>
              <h2 className="mt-3 font-heading text-2xl font-bold text-balance sm:text-3xl md:text-4xl">
                আগামী ফ্রি ক্লাসে অংশ নিন
              </h2>
              <p className="mt-2 max-w-xl text-green-foreground/85">
                কর্নিয়ার পাঠদান পদ্ধতি সরাসরি অনুভব করুন — কোনো ফি ছাড়াই।
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {INFO.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl bg-green-foreground/10 p-3"
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
              className="h-12 bg-card px-8 text-base font-semibold text-green hover:bg-card/90"
            >
              রেজিস্টার করুন
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
