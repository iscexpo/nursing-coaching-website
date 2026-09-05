import Link from 'next/link'
import {
  ArrowUpRight,
  BookOpenCheck,
  ClipboardList,
  Headphones,
} from 'lucide-react'

const actions = [
  {
    icon: ClipboardList,
    eyebrow: 'শুরু করুন',
    title: 'ভর্তি সম্পর্কে জানুন',
    text: 'কোর্স, ফি ও ব্যাচের সময়সূচি এক নজরে দেখুন।',
    href: '/admission',
  },
  {
    icon: BookOpenCheck,
    eyebrow: 'নিজেকে যাচাই করুন',
    title: 'ফ্রি মডেল টেস্ট দিন',
    text: 'প্রস্তুতির মান বুঝতে আজই একটি পরীক্ষা দিন।',
    href: '/model-test',
  },
  {
    icon: Headphones,
    eyebrow: 'সহায়তা দরকার?',
    title: 'কাউন্সেলরের সাথে কথা বলুন',
    text: 'আপনার লক্ষ্য অনুযায়ী সঠিক কোর্স বেছে নিন।',
    href: '/contact',
  },
]

export function ActionStrip() {
  return (
    <section className="relative z-10 -mt-8 px-4 pb-4">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
        {actions.map(({ icon: Icon, eyebrow, title, text, href }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-wider text-brand">
                {eyebrow}
              </span>
              <span className="mt-1 flex items-center gap-1 font-heading text-base font-bold text-foreground">
                {title}
                <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                {text}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
