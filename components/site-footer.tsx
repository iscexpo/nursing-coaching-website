import Link from 'next/link'
import Image from 'next/image'
import { Share2, Video, MessageCircle, Phone, MapPin } from 'lucide-react'
import { SITE } from '@/lib/site-data'

const QUICK = [
  { label: 'কোর্স', href: '/courses' },
  { label: 'নোটিশ', href: '/notice' },
  { label: 'গ্যালারি', href: '/gallery' },
  { label: 'মডেল টেস্ট', href: '/model-test' },
]

const POLICIES = [
  { label: 'প্রাইভেসি পলিসি', href: '/privacy' },
  { label: 'রিফান্ড পলিসি', href: '/refund' },
  { label: 'শর্তাবলী', href: '/terms' },
]

const SOCIALS = [
  { icon: Share2, href: SITE.facebook, label: 'Facebook' },
  { icon: Video, href: SITE.youtube, label: 'YouTube' },
  { icon: MessageCircle, href: SITE.whatsapp, label: 'WhatsApp' },
]

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="কর্নিয়া নার্সিং কোচিং" width={36} height={22} className="object-contain" />
            <span className="font-heading text-base font-bold">{SITE.nameBn}</span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-background/70">
            খুলনার অন্যতম বিশ্বস্ত নার্সিং ভর্তি কোচিং। মানসম্মত শিক্ষায় গড়ছি আগামীর নার্স।
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex size-9 items-center justify-center rounded-lg bg-background/10 transition-colors hover:bg-brand"
              >
                <s.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-background/60">
            কুইক লিংক
          </h3>
          <ul className="mt-4 space-y-2.5">
            {QUICK.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-background/80 hover:text-background">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-background/60">
            পলিসি
          </h3>
          <ul className="mt-4 space-y-2.5">
            {POLICIES.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-background/80 hover:text-background">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-background/60">
            যোগাযোগ
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-background/80">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              {SITE.addressBn}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-brand" />
              <a href={SITE.phoneHref} className="hover:text-background">
                {SITE.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-background/60">
          © {new Date().getFullYear()} {SITE.nameBn}, {SITE.city}. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  )
}
