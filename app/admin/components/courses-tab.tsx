'use client'

import { useState, useRef, useMemo } from 'react'
import NextImage from 'next/image'
import { Plus, Trash2, Pencil, Save, X, Loader2, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Course } from './types'
import { useToast } from '@/components/ui/toast'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterBar } from '@/components/ui/filter-bar'

function resizeImage(
  file: File,
  maxW = 1200,
  maxH = 800,
  quality = 0.8,
): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width: w, height: h } = img
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
    }
    img.src = url
  })
}

const inputCls =
  'mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'

export function CoursesPanel({
  courses,
  onRefresh,
}: {
  courses: Course[]
  onRefresh: () => void
}) {
  const t = useTranslations('admin.courses')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'icon' | 'isc'>(
    'all',
  )
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error, confirm } = useToast()

  const filteredCourses = useMemo(() => {
    let result =
      categoryFilter === 'all'
        ? courses
        : courses.filter((c) => c.category === categoryFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((c) => c.title.toLowerCase().includes(q))
    }
    return result
  }, [courses, categoryFilter, searchQuery])
  const [form, setForm] = useState({
    slug: '',
    courseCode: '',
    title: '',
    description: '',
    shortDescription: '',
    duration: '',
    fee: 0,
    discountFee: 0,
    category: 'icon' as 'icon' | 'isc',
    image: '',
    maxStudents: 0,
    schedule: '',
  })

  function resetForm() {
    setForm({
      slug: '',
      courseCode: '',
      title: '',
      description: '',
      shortDescription: '',
      duration: '',
      fee: 0,
      discountFee: 0,
      category: 'icon',
      image: '',
      maxStudents: 0,
      schedule: '',
    })
    setFormError('')
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resized = await resizeImage(file)
      const formData = new FormData()
      formData.append('file', resized, 'course.jpg')
      formData.append('altText', form.title || t('formLabels.imageAlt'))
      const res = await fetch('/api/media', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm({ ...form, image: data.url })
      }
    } catch {
      /* ignore */
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.slug.trim()) return
    if (!form.description.trim()) {
      setFormError(t('validation.descriptionRequired'))
      return
    }
    if (!form.duration.trim()) {
      setFormError(t('validation.durationRequired'))
      return
    }
    if (!form.fee || form.fee <= 0) {
      setFormError(t('validation.feeRequired'))
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const body: Record<string, unknown> = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        duration: form.duration.trim(),
        fee: Number(form.fee),
      }
      if (form.courseCode.trim()) body.courseCode = form.courseCode.trim()
      if (form.shortDescription.trim())
        body.shortDescription = form.shortDescription.trim()
      if (form.category) body.category = form.category
      if (form.discountFee) body.discountFee = Number(form.discountFee)
      if (form.image.trim()) body.image = form.image.trim()
      if (form.maxStudents) body.maxStudents = Number(form.maxStudents)
      if (form.schedule.trim()) body.schedule = form.schedule.trim()

      const url = editing ? `/api/courses/${editing.id}` : '/api/courses'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        onRefresh()
        setShowForm(false)
        setEditing(null)
        resetForm()
        success(editing ? t('saveSuccess') : t('createSuccess'))
      } else {
        const err = await res.json().catch(() => ({ error: t('saveFailed') }))
        const msg = err.details
          ? Object.values(err.details).flat().join(', ')
          : err.error || t('saveFailed')
        setFormError(msg)
        error(msg)
      }
    } catch (saveError) {
      setFormError(t('saveFailed'))
      error(t('saveFailed'))
      console.error('Failed to save course:', saveError)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirm(t('deleteConfirm')))) return
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' })
      onRefresh()
      success(t('deleteSuccess'))
    } catch (deleteError) {
      console.error('Failed to delete course:', deleteError)
    }
  }

  function handleEdit(course: Course) {
    setEditing(course)
    setForm({
      slug: course.slug,
      courseCode: course.courseCode || '',
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription || '',
      duration: course.duration,
      fee: course.fee,
      discountFee: course.discountFee || 0,
      category: course.category || 'icon',
      image: course.image || '',
      maxStudents: course.maxStudents || 0,
      schedule: course.schedule || '',
    })
    setShowForm(true)
  }

  async function toggleActive(course: Course) {
    const res = await fetch(`/api/courses/${course.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !course.isActive }),
    })
    if (res.ok) onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">
          {t('management')}
        </h3>
        <button
          onClick={() => {
            setShowForm(true)
            setEditing(null)
            resetForm()
          }}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Plus className="size-4" />
          {t('newCourse')}
        </button>
      </div>

      <FilterBar
        searchPlaceholder="কোর্স খুঁজুন..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            name: 'category',
            label: t('categoryFilter'),
            type: 'select',
            value: categoryFilter === 'all' ? '' : categoryFilter,
            onChange: (v) =>
              setCategoryFilter((v || 'all') as 'all' | 'icon' | 'isc'),
            options: [
              { value: 'icon', label: 'Icon' },
              { value: 'isc', label: 'ISC' },
            ],
          },
        ]}
        onClearFilters={() => {
          setCategoryFilter('all')
          setSearchQuery('')
        }}
      />

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
            {formError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('formLabels.name')}
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={t('formLabels.namePlaceholder')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('formLabels.code')}
                </label>
                <input
                  type="text"
                  value={form.courseCode}
                  onChange={(e) =>
                    setForm({ ...form, courseCode: e.target.value })
                  }
                  placeholder={t('formLabels.codePlaceholder')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('formLabels.category')}
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value as 'icon' | 'isc',
                    })
                  }
                  className={inputCls}
                >
                  <option value="icon">Icon</option>
                  <option value="isc">ISC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('formLabels.slug')}
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder={t('formLabels.slugPlaceholder')}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('formLabels.image')}
              </label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  {uploading
                    ? t('formLabels.uploading')
                    : t('formLabels.uploadImage')}
                </button>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder={t('formLabels.imageOrUrl')}
                  className={inputCls}
                />
              </div>
              {form.image && (
                <div className="mt-2 flex items-center gap-3">
                  <NextImage
                    src={form.image}
                    alt=""
                    width={128}
                    height={80}
                    className="rounded-lg object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: '' })}
                    className="text-xs text-destructive hover:underline"
                  >
                    {t('formLabels.remove')}
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('formLabels.shortDescription')}
              </label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) =>
                  setForm({ ...form, shortDescription: e.target.value })
                }
                placeholder={t('formLabels.shortDescriptionPlaceholder')}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                {t('formLabels.description')}
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder={t('formLabels.descriptionPlaceholder')}
                className={inputCls}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('formLabels.duration')}
                </label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  placeholder={t('formLabels.durationPlaceholder')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('formLabels.fee')}
                </label>
                <input
                  type="number"
                  value={form.fee || ''}
                  onChange={(e) =>
                    setForm({ ...form, fee: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('formLabels.discountFee')}
                </label>
                <input
                  type="number"
                  value={form.discountFee || ''}
                  onChange={(e) =>
                    setForm({ ...form, discountFee: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('formLabels.maxStudents')}
                </label>
                <input
                  type="number"
                  value={form.maxStudents || ''}
                  onChange={(e) =>
                    setForm({ ...form, maxStudents: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  {t('formLabels.schedule')}
                </label>
                <input
                  type="text"
                  value={form.schedule}
                  onChange={(e) =>
                    setForm({ ...form, schedule: e.target.value })
                  }
                  placeholder={t('formLabels.schedulePlaceholder')}
                  className={inputCls}
                />
              </div>
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
              {editing ? t('updateButton') : t('newCourse')}
            </button>
          </div>
        </div>
      )}

      {filteredCourses.length === 0 ? (
        <EmptyState title={t('emptyState')} description={t('emptyHint')} />
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('tableHeaders.course')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    {t('tableHeaders.image')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('tableHeaders.code')}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    {t('tableHeaders.duration')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    {t('tableHeaders.fee')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    {t('tableHeaders.discount')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    {t('tableHeaders.students')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">
                    {t('tableHeaders.status')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {c.title}
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {c.category === 'isc' ? 'ISC' : 'Icon'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.image ? (
                        <NextImage
                          src={c.image}
                          alt=""
                          width={64}
                          height={40}
                          className="mx-auto rounded object-cover border border-border"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {t('noImage')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.courseCode || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.duration}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      ৳{c.fee.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-green">
                      {c.discountFee
                        ? `৳${c.discountFee.toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {c.currentStudents}/{c.maxStudents || '∞'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${c.isActive ? 'bg-green/10 text-green' : 'bg-secondary text-muted-foreground'}`}
                      >
                        {c.isActive ? t('statusActive') : t('statusInactive')}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
