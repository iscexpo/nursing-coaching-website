'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Trash2, Save, X, Loader2 } from 'lucide-react'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface CourseCategory {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CourseCategoriesPanelProps {
  categories: CourseCategory[]
  onRefresh: () => void
}

export function CourseCategoriesPanel({
  categories,
  onRefresh,
}: CourseCategoriesPanelProps) {
  const t = useTranslations('admin.courseCategories')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<CourseCategory | null>(null)

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function handleNameChange(value: string) {
    setName(value)
    if (!editing) {
      setSlug(generateSlug(value))
    }
  }

  async function handleCreate() {
    if (!name.trim() || !slug.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/course-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          sortOrder: categories.length,
        }),
      })
      if (res.ok) {
        setName('')
        setSlug('')
        setDescription('')
        setShowForm(false)
        onRefresh()
      }
    } catch (error) {
      console.error('Failed to create course category:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(cat: CourseCategory) {
    setEditing(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description || '')
    setShowForm(true)
  }

  async function handleSaveEdit() {
    if (!editing || !name.trim() || !slug.trim()) return
    setSaving(true)
    try {
      await fetch(`/api/course-categories/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
        }),
      })
      setName('')
      setSlug('')
      setDescription('')
      setEditing(null)
      setShowForm(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to update course category:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/course-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to toggle course category:', error)
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/course-categories/${id}`, { method: 'DELETE' })
      onRefresh()
    } catch (error) {
      console.error('Failed to delete course category:', error)
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
            setShowForm(!showForm)
            setEditing(null)
            setName('')
            setSlug('')
            setDescription('')
          }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          {t('addNew')}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? t('editTitle') : t('addTitle')}
            </h4>
            <button
              onClick={() => {
                setShowForm(false)
                setEditing(null)
                setName('')
                setSlug('')
                setDescription('')
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-4">
            <FormField id="cc-name" label={t('nameLabel')} required>
              <Input
                id="cc-name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t('namePlaceholder')}
                aria-required="true"
              />
            </FormField>
            <FormField id="cc-slug" label={t('slugLabel')} required>
              <Input
                id="cc-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t('slugPlaceholder')}
                aria-required="true"
              />
            </FormField>
            <FormField id="cc-description" label={t('descriptionLabel')}>
              <textarea
                id="cc-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </FormField>
            <Separator />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                  setName('')
                  setSlug('')
                  setDescription('')
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {t('cancelBtn')}
              </button>
              <button
                onClick={editing ? handleSaveEdit : handleCreate}
                disabled={saving || !name.trim() || !slug.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {editing ? t('saveBtn') : t('addBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  {t('nameLabel')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  {t('slugLabel')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  {t('statusLabel')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  {t('actionsLabel')}
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-border transition-colors hover:bg-secondary/50 last:border-0"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {cat.name}
                    </span>
                    {cat.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {cat.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(cat.id, cat.isActive)}
                      className={`inline-flex cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                        cat.isActive
                          ? 'bg-green/10 text-green'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {cat.isActive ? t('active') : t('inactive')}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleUpdate(cat)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        {t('editBtn')}
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    {t('noCategories')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
