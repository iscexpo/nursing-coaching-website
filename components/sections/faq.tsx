'use client'

import { useEffect, useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { FadeIn } from '@/components/ui/fade-in'
import { cn } from '@/lib/utils'

type FaqItem = { question: string; answer: string }

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const [faqs, setFaqs] = useState<FaqItem[]>([])

  useEffect(() => {
    void fetch('/api/content')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data?.cmsContent?.faqs) {
          setFaqs(data.cmsContent.faqs)
        }
      })
      .catch(() => {
        // ignore load failures
      })
  }, [])

  return (
    <section className="bg-secondary/50 py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <FadeIn>
          <SectionHeading eyebrow="সাধারণ জিজ্ঞাসা" title="আপনার প্রশ্ন, আমাদের উত্তর" />
        </FadeIn>
        <div className="mt-10 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <FadeIn key={`${faq.question}-${i}`} delay={i * 60}>
                <div
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-card transition-all duration-300',
                    isOpen ? 'border-brand/30 shadow-md shadow-brand/5' : 'border-border',
                  )}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-heading text-base font-semibold text-foreground">
                      {faq.question}
                    </span>
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-300',
                        isOpen ? 'bg-brand text-brand-foreground scale-110' : 'bg-secondary text-brand',
                      )}
                    >
                      {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                    </span>
                  </button>
                  <div
                    className={cn(
                      'grid transition-all duration-300',
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
