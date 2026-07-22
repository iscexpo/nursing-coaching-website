'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Save, X, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import type { Notice } from './types'

export function NoticesPanel({
  notices,
  onRefresh,
}: {
  notices: Notice[]
  onRefresh: () => void
}) {
  const t = useTranslations('admin.notices')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Notice | null>(null)
  const [form, setForm] = useState({ tag: t('tags.enrollment'), title: '', urgent: false })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await fetch(`/api/notices/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            tag: form.tag,
            isUrgent: form.urgent,
          }),
        })
      } else {
        await fetch('/api/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            tag: form.tag,
            isUrgent: form.urgent,
          }),
        })
      }
      setForm({ tag: t('tags.enrollment'), title: '', urgent: false })
      setEditing(null)
      setShowForm(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to save notice:', error)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(n: Notice) {
    setEditing(n)
    setForm({ tag: n.tag, title: n.title, urgent: n.isUrgent })
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/notices/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete notice:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">
          {t('title')}
        </h3>
        <button
          onClick={() => {
            setShowForm(true)
            setEditing(null)
            setForm({ tag: t('tags.enrollment'), title: '', urgent: false })
          }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          {t('newNotice')}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? t('editTitle') : t('addTitle')}
            </h4>
            <button
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('tagLabel')}
                </label>
                <select
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option>{t('tags.enrollment')}</option>
                  <option>{t('tags.class')}</option>
                  <option>{t('tags.exam')}</option>
                  <option>{t('tags.deadline')}</option>
                  <option>{t('tags.general')}</option>
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={form.urgent}
                    onChange={(e) =>
                      setForm({ ...form, urgent: e.target.checked })
                    }
                    className="size-4 rounded border-border"
                  />
                  {t('isUrgentLabel')}
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('noticeLabel')}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t('noticePlaceholder')}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {editing ? t('noticeUpdated') : t('noticeCreated')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notices.map((n) => (
          <div
            key={n.id}
            className={`rounded-2xl border bg-card p-4 shadow-sm ${n.isUrgent ? 'border-gold/50' : 'border-border'}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status="active" customLabel={n.tag} showIcon={false} size="sm" />
              {n.isUrgent && (
                <StatusBadge status="warning" customLabel={t('urgentBadge')} size="sm" />
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(n.createdAt).toLocaleDateString('bn-BD')}
              </span>
              <button
                onClick={() => handleEdit(n)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => handleDelete(n.id)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">
              {n.title}
            </p>
          </div>
        ))}
        {notices.length === 0 && (
          <EmptyState title={t('emptyTitle')} />
        )}
      </div>
    </div>
  )
}
