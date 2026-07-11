'use client'

import { useState } from 'react'
import { Phone, Mail, CheckCircle2, Trash2 } from 'lucide-react'

interface Contact {
  id: number
  name: string
  phone: string
  email: string | null
  subject: string
  message: string
  createdAt: string
  read: boolean
}

const MOCK_CONTACTS: Contact[] = [
  { id: 1, name: 'রাহুল আহমেদ', phone: '01712-345678', email: 'rahul@email.com', subject: 'কোর্স সম্পর্কে জিজ্ঞাসা', message: 'নার্সিং কোর্সের ফি কত?', createdAt: '১০ জুলাই ২০২৬', read: false },
  { id: 2, name: 'নাদিয়া খানম', phone: '01812-345678', email: null, subject: 'ভর্তি প্রক্রিয়া', message: 'ভর্তির শেষ তারিখ কবে?', createdAt: '৯ জুলাই ২০২৬', read: true },
]

export function ContactsPanel() {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS)

  function markRead(id: number) {
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, read: true } : c))
  }

  function handleDelete(id: number) {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-foreground">যোগাযোগ অনুরোধ</h3>

      <div className="space-y-3">
        {contacts.map((c) => (
          <div key={c.id} className={`rounded-2xl border bg-card p-5 shadow-sm ${c.read ? 'border-border' : 'border-brand/50'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">{c.name}</h4>
                  {!c.read && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">নতুন</span>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.subject}</p>
              </div>
              <span className="text-xs text-muted-foreground">{c.createdAt}</span>
            </div>
            <p className="mt-3 text-sm text-foreground">{c.message}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Phone className="size-3" />{c.phone}</span>
              {c.email && <span className="flex items-center gap-1"><Mail className="size-3" />{c.email}</span>}
            </div>
            <div className="mt-3 flex items-center gap-2">
              {!c.read && (
                <button
                  onClick={() => markRead(c.id)}
                  className="flex items-center gap-1 rounded-lg bg-green/10 px-2.5 py-1 text-xs font-medium text-green hover:bg-green/20"
                >
                  <CheckCircle2 className="size-3.5" />
                  পড়েছি
                </button>
              )}
              <button
                onClick={() => handleDelete(c.id)}
                className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="size-3.5" />
                মুছুন
              </button>
            </div>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            কোনো যোগাযোগ অনুরোধ নেই
          </p>
        )}
      </div>
    </div>
  )
}
