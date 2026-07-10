import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { SITE } from '@/lib/site-data'

const CONTACTS = [
  { icon: MapPin, label: 'ঠিকানা', value: SITE.addressBn, href: undefined },
  { icon: Phone, label: 'ফোন', value: SITE.phone, href: SITE.phoneHref },
  { icon: MessageCircle, label: 'হোয়াটসঅ্যাপ', value: SITE.phone, href: SITE.whatsapp },
  { icon: Mail, label: 'ইমেইল', value: SITE.email, href: `mailto:${SITE.email}` },
]

export function Contact() {
  return (
    <section id="contact" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="যোগাযোগ"
          title="আমাদের সাথে যুক্ত হোন"
          description="যেকোনো প্রশ্নে সরাসরি অফিসে আসুন অথবা কল করুন।"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {CONTACTS.map((c) => {
              const content = (
                <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand/30">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand">
                    <c.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="mt-0.5 font-medium leading-relaxed text-foreground">{c.value}</p>
                  </div>
                </div>
              )
              return c.href ? (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                <div key={c.label}>{content}</div>
              )
            })}
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              title="কর্নিয়া নার্সিং কোচিং ম্যাপ"
              src="https://www.google.com/maps?q=Khulna+Medical+College+Hospital&output=embed"
              className="h-full min-h-[300px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
