'use client'

import { useState } from 'react'
import { Phone, Trash2, Loader2, FileText } from 'lucide-react'
import type { Admission, AdmissionStatus } from './types'

const STATUS_OPTIONS: AdmissionStatus[] = [
  'pending',
  'received',
  'processing',
  'approved',
  'rejected',
]

const STATUS_LABELS: Record<AdmissionStatus, string> = {
  pending: 'অপেক্ষমাণ',
  received: 'প্রাপ্ত',
  processing: 'প্রক্রিয়াধীন',
  approved: 'অনুমোদিত',
  rejected: 'বাতিল',
}

const STATUS_STYLES: Record<AdmissionStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  received: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export function AdmissionsPanel({
  admissions,
  onRefresh,
}: {
  admissions: Admission[]
  onRefresh: () => void
}) {
  const [processing, setProcessing] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function updateStatus(id: string, status: AdmissionStatus) {
    setProcessing(id)
    try {
      await fetch(`/api/admissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to update admission:', error)
    } finally {
      setProcessing(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('আবেদনটি মুছে ফেলতে চান?')) return
    setProcessing(id)
    try {
      await fetch(`/api/admissions/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete admission:', error)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-foreground">
        ভর্তি আবেদন
      </h3>

      <div className="space-y-3">
        {admissions.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">{a.name}</h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[a.status]}`}
                  >
                    {STATUS_LABELS[a.status]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.reference} · {a.courseTitle}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(a.createdAt).toLocaleDateString('bn-BD')}
              </span>
            </div>

            {a.message && (
              <p className="mt-3 text-sm text-foreground">{a.message}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="size-3" />
                {a.phone}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                value={a.status}
                disabled={processing === a.id}
                onChange={(e) =>
                  updateStatus(a.id, e.target.value as AdmissionStatus)
                }
                className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-brand focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary/70"
              >
                <FileText className="size-3.5" />
                বিস্তারিত
              </button>

              <button
                onClick={() => handleDelete(a.id)}
                disabled={processing === a.id}
                className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50"
              >
                {processing === a.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                মুছুন
              </button>
            </div>

            {expanded === a.id && (
              <div className="mt-4 space-y-3 rounded-xl bg-secondary/50 p-4 text-sm">
                {(['ssc', 'hsc', 'honors'] as const).map((level) => {
                  const edu = a[level]
                  if (!edu) return null
                  const label =
                    level === 'ssc'
                      ? 'এসএসসি'
                      : level === 'hsc'
                        ? 'এইচএসসি'
                        : 'অনার্স'
                  return (
                    <div key={level}>
                      <p className="font-medium text-foreground">
                        {label}: {edu.result}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {edu.institution} · {edu.year} · রোল: {edu.roll} ·
                        বোর্ড: {edu.board}
                      </p>
                    </div>
                  )
                })}
                {!a.ssc && !a.hsc && !a.honors && (
                  <p className="text-xs text-muted-foreground">
                    কোনো শিক্ষাগত তথ্য প্রদান করা হয়নি।
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {admissions.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
            কোনো ভর্তি আবেদন নেই
          </p>
        )}
      </div>
    </div>
  )
}
