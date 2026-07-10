'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NAV_LINKS, SITE } from '@/lib/site-data'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="hidden bg-brand text-brand-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <p>স্বাগতম কর্নিয়া নার্সিং কোচিং, খুলনা — বিশ্বস্ত নার্সিং প্রস্তুতি</p>
          <div className="flex items-center gap-4">
            <a href={SITE.phoneHref} className="flex items-center gap-1.5 hover:underline">
              <Phone className="size-3.5" />
              {SITE.phone}
            </a>
            <span className="rounded-full bg-gold px-2.5 py-0.5 font-semibold text-gold-foreground">
              ভর্তি চলমান
            </span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="কর্নিয়া নার্সিং কোচিং" width={40} height={25} className="object-contain" />
            <span className="flex flex-col leading-tight">
              <span className="font-heading text-base font-bold text-foreground sm:text-lg">
                {SITE.nameBn}
              </span>
              <span className="text-xs text-muted-foreground">{SITE.city} · Est. 2016</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              render={<Link href="/auth/sign-in" />}
              variant="outline"
              size="lg"
              className="hidden sm:inline-flex"
            >
              লগইন
            </Button>
            <Button render={<Link href="/admission" />} size="lg" className="hidden sm:inline-flex">
              ভর্তি হোন
            </Button>
            <Button
              variant="ghost"
              size="icon-lg"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="মেনু খুলুন"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'overflow-hidden border-t border-border transition-all lg:hidden',
            open ? 'max-h-[32rem]' : 'max-h-0',
          )}
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Button render={<Link href="/auth/sign-in" />} variant="outline" className="flex-1" size="lg">
                লগইন
              </Button>
              <Button render={<Link href="/admission" />} className="flex-1" size="lg">
                ভর্তি হোন
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
