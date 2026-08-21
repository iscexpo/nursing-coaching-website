'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { cn } from '@/lib/core/utils'

type FaqItem = { question: string; answer: string }

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="mt-10 space-y-2">
      {faqs.map((faq, i) => {
        const isOpen = open === i
        const panelId = `faq-panel-${i}`
        const buttonId = `faq-button-${i}`
        return (
          <FadeIn key={`${faq.question}-${i}`} delay={i * 60}>
            <div
              className={cn(
                'overflow-hidden rounded-lg border transition-colors duration-200',
                isOpen
                  ? 'border-neutral-300 dark:border-neutral-700'
                  : 'border-border',
              )}
            >
              <button
                id={buttonId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-foreground">
                  {faq.question}
                </span>
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-md transition-colors duration-200',
                    isOpen
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {isOpen ? (
                    <Minus className="size-3.5" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  'grid transition-all duration-200',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        )
      })}
    </div>
  )
}
