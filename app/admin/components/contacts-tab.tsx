'use client'

import { useState } from 'react'
import { Phone, Mail, CheckCircle2, Trash2, Loader2 } from 'lucide-react'
import type { ContactInquiry } from './types'

export function ContactsPanel({
  contacts,
  onRefresh,
}: {
  contacts: ContactInquiry[]
  onRefresh: () => void
}) {
  const [processing, setProcessing] = useState<string | null>(null)

  async function markResolved(id: string) {
    setProcessing(id)
    try {
      await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to mark resolved:', error)
    } finally {
      setProcessing(null)
    }
  }

  async function handleDelete(id: string) {
    setProcessing(id)
    try {
      await fetch(`/api/contact/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete inquiry:', error)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-foreground">
        যোগাযোগ অনুরোধ
      </h3>

      <div className="space-y-3">
        {contacts.map((c) => (
          <div
            key={c.id}
            className={`rounded-2xl border bg-card p-5 shadow-sm ${c.isResolved ? 'border-border' : 'border-brand/50'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">{c.name}</h4>
                  {!c.isResolved && (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                      নতুন
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(c.createdAt).toLocaleDateString('bn-BD')}
              </span>
            </div>
            <p className="mt-3 text-sm text-foreground">{c.message}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="size-3" />
                {c.phone}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {!c.isResolved && (
                <button
                  onClick={() => markResolved(c.id)}
                  disabled={processing === c.id}
                  className="flex items-center gap-1 rounded-lg bg-green/10 px-2.5 py-1 text-xs font-medium text-green hover:bg-green/20 disabled:opacity-50"
                >
                  {processing === c.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                  সমাধান হয়েছে
                </button>
              )}
              <button
                onClick={() => handleDelete(c.id)}
                disabled={processing === c.id}
                className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
              >
                {processing === c.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                মুছুন
              </button>
            </div>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
            কোনো যোগাযোগ অনুরোধ নেই
          </p>
        )}
      </div>
    </div>
  )
}
