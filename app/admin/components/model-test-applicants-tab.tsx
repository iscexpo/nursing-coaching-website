'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Phone, Trash2, Loader2, FileText } from 'lucide-react'
import type { ModelTestApplicant, ModelTestApplicantStatus } from './types'
import { useToast } from '@/components/ui/toast'

const STATUS_OPTIONS: ModelTestApplicantStatus[] = [
  'pending',
  'contacted',
  'registered',
  'rejected',
]

const STATUS_STYLES: Record<ModelTestApplicantStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  contacted: 'bg-blue-100 text-blue-700',
  registered: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export function ModelTestApplicantsPanel({
  applicants,
  onRefresh,
}: {
  applicants: ModelTestApplicant[]
  onRefresh: () => void
}) {
  const t = useTranslations('admin.modelTest')
  const { success, error, confirm } = useToast()
  const [processing, setProcessing] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const statusLabels = useMemo(
    () => ({
      pending: t('statusLabels.pending'),
      contacted: t('statusLabels.contacted'),
      registered: t('statusLabels.registered'),
      rejected: t('statusLabels.rejected'),
    }),
    [t],
  )

  async function updateStatus(id: string, status: ModelTestApplicantStatus) {
    setProcessing(id)
    try {
      await fetch(`/api/model-test-applicants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      onRefresh()
      success(t('statusUpdated'))
    } catch (updateError) {
      console.error('Failed to update applicant:', updateError)
    } finally {
      setProcessing(null)
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirm(t('confirmDelete')))) return
    setProcessing(id)
    try {
      await fetch(`/api/model-test-applicants/${id}`, { method: 'DELETE' })
      onRefresh()
      success(t('deleted'))
    } catch (deleteError) {
      console.error('Failed to delete applicant:', deleteError)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-foreground">
        {t('title')}
      </h3>

      <div className="space-y-3">
        {applicants.map((a) => (
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
                    {statusLabels[a.status]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.reference}
                  {a.examTitle ? ` · ${a.examTitle}` : ''}
                  {a.preferredSubject ? ` · ${a.preferredSubject}` : ''}
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
                  updateStatus(a.id, e.target.value as ModelTestApplicantStatus)
                }
                className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:border-brand focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary/70"
              >
                <FileText className="size-3.5" />
                {t('detailsBtn')}
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
                Delete
              </button>
            </div>

            {expanded === a.id && (
              <div className="mt-4 space-y-2 rounded-xl bg-secondary/50 p-4 text-sm">
                <p className="text-xs text-muted-foreground">
                  {t('preferredSubject')}: {a.preferredSubject || '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('exam')}: {a.examTitle || '—'}
                </p>
                {!a.message && (
                  <p className="text-xs text-muted-foreground">
                    {t('noMessage')}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {applicants.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
            {t('noApplicants')}
          </p>
        )}
      </div>
    </div>
  )
}
