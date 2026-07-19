'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Pencil, Save, X, Loader2, Upload } from 'lucide-react'
import type { Course } from './types'
import { useToast } from '@/components/ui/toast'

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
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error, confirm } = useToast()
  const [form, setForm] = useState({
    slug: '',
    courseCode: '',
    title: '',
    description: '',
    shortDescription: '',
    duration: '',
    fee: 0,
    discountFee: 0,
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
      formData.append('altText', form.title || 'কোর্স ছবি')
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
      setFormError('বিস্তারিত বিবরণ আবশ্যক')
      return
    }
    if (!form.duration.trim()) {
      setFormError('সময়কাল আবশ্যক')
      return
    }
    if (!form.fee || form.fee <= 0) {
      setFormError('ফি আবশ্যক এবং ০-এর বেশি হতে হবে')
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
        success(editing ? 'কোর্স আপডেট করা হয়েছে' : 'নতুন কোর্স যোগ করা হয়েছে')
      }       else {
        const err = await res.json().catch(() => ({ error: 'সংরক্ষণ ব্যর্থ' }))
        const msg = err.details
          ? Object.values(err.details).flat().join(', ')
          : err.error || 'সংরক্ষণ ব্যর্থ'
        setFormError(msg)
        error(msg)
      }
    } catch (saveError) {
      setFormError('সংরক্ষণ ব্যর্থ')
      error('সংরক্ষণ ব্যর্থ')
      console.error('Failed to save course:', saveError)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirm('আপনি কি নিশ্চিত এই কোর্স মুছে ফেলতে চান?'))) return
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' })
      onRefresh()
      success('কোর্স মুছে ফেলা হয়েছে')
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
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-foreground">
          কোর্স ব্যবস্থাপনা
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
          নতুন কোর্স
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              {editing ? 'কোর্স সম্পাদনা' : 'নতুন কোর্স যোগ'}
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
                  কোর্সের নাম
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="যেমন: নার্সিং অ্যাডমিশন কোচিং"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  কোর্স কোড
                </label>
                <input
                  type="text"
                  value={form.courseCode}
                  onChange={(e) =>
                    setForm({ ...form, courseCode: e.target.value })
                  }
                  placeholder="যেমন: NAC-2025"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  স্লাগ (URL)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="যেমন: nursing-admission"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                ছবি
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
                  {uploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}
                </button>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="অথবা URL পেস্ট করুন"
                  className={inputCls}
                />
              </div>
              {form.image && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={form.image}
                    alt=""
                    className="h-20 w-32 rounded-lg object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: '' })}
                    className="text-xs text-destructive hover:underline"
                  >
                    মুছুন
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                সংক্ষিপ্ত বিবরণ
              </label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) =>
                  setForm({ ...form, shortDescription: e.target.value })
                }
                placeholder="কোর্স সম্পর্কে সংক্ষিপ্ত"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">
                বিস্তারিত বিবরণ
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="কোর্সের বিস্তারিত বিবরণ"
                className={inputCls}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  সময়কাল
                </label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  placeholder="যেমন: ১ বছর"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  ফি (৳)
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
                  ছাড়ের ফি (৳)
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
                  সর্বোচ্চ আসন
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
                  সময়সূচি
                </label>
                <input
                  type="text"
                  value={form.schedule}
                  onChange={(e) =>
                    setForm({ ...form, schedule: e.target.value })
                  }
                  placeholder="যেমন: শনি-বৃহ ৬:০০-৮:০০"
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
              {editing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  কোর্স
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  ছবি
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  কোড
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  সময়কাল
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  ফি
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  ছাড়
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  শিক্ষার্থী
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  অবস্থা
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt=""
                        className="mx-auto h-10 w-16 rounded object-cover border border-border"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">নেই</span>
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
                    {c.discountFee ? `৳${c.discountFee.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-foreground">
                    {c.currentStudents}/{c.maxStudents || '∞'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${c.isActive ? 'bg-green/10 text-green' : 'bg-secondary text-muted-foreground'}`}
                    >
                      {c.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
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
    </div>
  )
}
