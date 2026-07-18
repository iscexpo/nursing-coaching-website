'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, X, Loader2, Search, Ban, Check } from 'lucide-react'
import { EnrollmentStatusBadge } from '@/components/ui/badges'
import type { Enrollment, Course, Student } from './types'

const inputCls =
  'mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
const labelCls = 'block text-sm font-medium text-foreground'

type AddFormState = {
  userId: string
  selectedCourseIds: string[]
  notes: string
  discount: string
}

type EditState = {
  status: string
  notes: string
  startDate: string
  endDate: string
  discount: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'অপেক্ষমান' },
  { value: 'approved', label: 'অনুমোদিত' },
  { value: 'active', label: 'সক্রিয়' },
  { value: 'completed', label: 'সম্পন্ন' },
  { value: 'rejected', label: 'প্রত্যাখ্যাত' },
  { value: 'cancelled', label: 'বাতিল' },
]

export function EnrollmentsPanel({
  enrollments,
  courses,
  students,
  onRefresh,
}: {
  enrollments: Enrollment[]
  courses: Course[]
  students: Student[]
  onRefresh: () => void
}) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<AddFormState>({
    userId: '',
    selectedCourseIds: [],
    notes: '',
    discount: '0',
  })
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState('')
  const [courseSearch, setCourseSearch] = useState('')

  const [editing, setEditing] = useState<Enrollment | null>(null)
  const [editForm, setEditForm] = useState<EditState>({
    status: '',
    notes: '',
    startDate: '',
    endDate: '',
    discount: '0',
  })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const [cancelling, setCancelling] = useState<string | null>(null)

  const activeCourses = courses.filter((c) => c.isActive)
  const filtered = enrollments.filter((e) => {
    if (filter !== 'all' && e.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (e.userName || '').toLowerCase().includes(q) ||
        (e.userPhone || '').toLowerCase().includes(q) ||
        (e.courseTitle || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const filteredActiveCourses = useMemo(() => {
    if (!courseSearch) return activeCourses
    const q = courseSearch.toLowerCase()
    return activeCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.courseCode || '').toLowerCase().includes(q),
    )
  }, [activeCourses, courseSearch])

  const addDiscountNum = Math.max(0, parseInt(addForm.discount) || 0)
  const addTotalFee = useMemo(() => {
    return addForm.selectedCourseIds.reduce((sum, cid) => {
      const c = activeCourses.find((x) => x.id === cid)
      if (!c) return sum
      const fee = c.discountFee || c.fee
      return sum + Math.max(0, fee - addDiscountNum)
    }, 0)
  }, [addForm.selectedCourseIds, addDiscountNum, activeCourses])

  const addCourseFees = useMemo(() => {
    return addForm.selectedCourseIds.map((cid) => {
      const c = activeCourses.find((x) => x.id === cid)
      return {
        id: cid,
        title: c?.title || cid,
        fee: c ? c.discountFee || c.fee : 0,
      }
    })
  }, [addForm.selectedCourseIds, activeCourses])

  const editCourseFee = useMemo(() => {
    if (!editing) return 0
    const c = courses.find((c) => c.id === editing.courseId)
    return c ? c.discountFee || c.fee : editing.totalFee + editing.discount
  }, [editing, courses])

  const editDiscountNum = Math.max(0, parseInt(editForm.discount) || 0)
  const editTotalFee = Math.max(0, editCourseFee - editDiscountNum)

  function toggleCourse(courseId: string) {
    setAddForm((prev) => {
      const exists = prev.selectedCourseIds.includes(courseId)
      return {
        ...prev,
        selectedCourseIds: exists
          ? prev.selectedCourseIds.filter((id) => id !== courseId)
          : [...prev.selectedCourseIds, courseId],
      }
    })
  }

  function toggleAllCourses() {
    setAddForm((prev) => ({
      ...prev,
      selectedCourseIds:
        prev.selectedCourseIds.length === filteredActiveCourses.length
          ? []
          : filteredActiveCourses.map((c) => c.id),
    }))
  }

  async function handleAdd() {
    if (!addForm.userId || addForm.selectedCourseIds.length === 0) return
    setAddSaving(true)
    setAddError('')
    try {
      const body: Record<string, unknown> = {
        courseIds: addForm.selectedCourseIds,
        userId: addForm.userId,
      }
      if (addForm.notes.trim()) body.notes = addForm.notes.trim()
      if (addDiscountNum > 0) body.discount = addDiscountNum
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        const count = data.count || 0
        const errCount = data.errors?.length || 0
        if (errCount > 0 && count > 0) {
          setAddError(`${count}টি এনরোলমেন্ট তৈরি হয়েছে, ${errCount}টি ব্যর্থ`)
        } else if (errCount > 0) {
          setAddError(
            data.details
              ?.map((d: { courseId: string; error: string }) => d.error)
              .join(', ') || 'এনরোলমেন্ট তৈরি ব্যর্থ',
          )
          return
        }
        setShowAdd(false)
        setAddForm({
          userId: '',
          selectedCourseIds: [],
          notes: '',
          discount: '0',
        })
        setCourseSearch('')
        onRefresh()
      } else {
        setAddError(data.error || 'এনরোলমেন্ট তৈরি ব্যর্থ')
      }
    } catch {
      setAddError('এনরোলমেন্ট তৈরি ব্যর্থ')
    } finally {
      setAddSaving(false)
    }
  }

  function handleEditClick(e: Enrollment) {
    setEditing(e)
    setEditForm({
      status: e.status,
      notes: e.notes || '',
      startDate: e.startDate ? e.startDate.slice(0, 10) : '',
      endDate: e.endDate ? e.endDate.slice(0, 10) : '',
      discount: String(e.discount || 0),
    })
    setEditError('')
  }

  async function handleEditSave() {
    if (!editing) return
    setEditSaving(true)
    setEditError('')
    try {
      const body: Record<string, unknown> = {
        status: editForm.status,
        notes: editForm.notes.trim() || undefined,
        discount: editDiscountNum,
        totalFee: editTotalFee,
      }
      if (editForm.startDate) body.startDate = editForm.startDate
      if (editForm.endDate) body.endDate = editForm.endDate
      const res = await fetch(`/api/enrollments/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setEditing(null)
        onRefresh()
      } else {
        const err = await res.json().catch(() => ({ error: 'আপডেট ব্যর্থ' }))
        setEditError(err.error || 'আপডেট ব্যর্থ')
      }
    } catch {
      setEditError('আপডেট ব্যর্থ')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('আপনি কি নিশ্চিত এই এনরোলমেন্ট বাতিল করতে চান?')) return
    setCancelling(id)
    try {
      const res = await fetch(`/api/enrollments/${id}`, { method: 'DELETE' })
      if (res.ok) onRefresh()
      else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'বাতিল ব্যর্থ')
      }
    } catch {
      alert('বাতিল ব্যর্থ')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">
          এনরোলমেন্ট ব্যবস্থাপনা
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="all">সকল</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setShowAdd(true)
              setAddForm({
                userId: '',
                selectedCourseIds: [],
                notes: '',
                discount: '0',
              })
              setCourseSearch('')
              setAddError('')
            }}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <Plus className="size-4" /> নতুন এনরোলমেন্ট
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              নতুন এনরোলমেন্ট
            </h4>
            <button
              onClick={() => setShowAdd(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            {addError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {addError}
              </div>
            )}

            <div>
              <label className={labelCls}>শিক্ষার্থী *</label>
              <select
                value={addForm.userId}
                onChange={(e) =>
                  setAddForm({ ...addForm, userId: e.target.value })
                }
                className={inputCls}
              >
                <option value="">শিক্ষার্থী নির্বাচন করুন</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.phoneNumber ? ` (${s.phoneNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls}>কোর্স নির্বাচন করুন *</label>
                <span className="text-xs text-muted-foreground">
                  {addForm.selectedCourseIds.length}টি নির্বাচিত
                </span>
              </div>
              <div className="mt-1 rounded-lg border border-border bg-background overflow-hidden">
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    placeholder="কোর্স খুঁজুন..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground border-b border-border bg-secondary/30 cursor-pointer hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={
                        addForm.selectedCourseIds.length ===
                          filteredActiveCourses.length &&
                        filteredActiveCourses.length > 0
                      }
                      onChange={toggleAllCourses}
                      className="size-4 rounded border-border text-brand focus:ring-brand"
                    />
                    সকল কোর্স নির্বাচন করুন
                  </label>
                  {filteredActiveCourses.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground cursor-pointer hover:bg-secondary/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={addForm.selectedCourseIds.includes(c.id)}
                        onChange={() => toggleCourse(c.id)}
                        className="size-4 rounded border-border text-brand focus:ring-brand"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="truncate block">{c.title}</span>
                        {c.courseCode && (
                          <span className="text-xs text-muted-foreground">
                            {c.courseCode}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        ৳{(c.discountFee || c.fee).toLocaleString()}
                      </span>
                    </label>
                  ))}
                  {filteredActiveCourses.length === 0 && (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                      কোনো কোর্স পাওয়া যায়নি
                    </div>
                  )}
                </div>
              </div>
            </div>

            {addForm.selectedCourseIds.length > 0 && (
              <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  নির্বাচিত কোর্সসমূহ
                </p>
                <div className="space-y-1">
                  {addCourseFees.map((cf) => (
                    <div
                      key={cf.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-foreground truncate">
                        {cf.title}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        ৳{cf.fee.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">মোট ফি</span>
                    <span className="font-medium text-foreground">
                      ৳
                      {addCourseFees
                        .reduce((s, c) => s + c.fee, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <label className={labelCls}>ছাড় (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={addForm.discount}
                      onChange={(e) =>
                        setAddForm({ ...addForm, discount: e.target.value })
                      }
                      placeholder="০"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-border">
                    <span className="text-muted-foreground">
                      পরিশোধযোগ্য ফি
                    </span>
                    <span className="font-semibold text-green">
                      ৳{addTotalFee.toLocaleString()}
                    </span>
                  </div>
                  {addDiscountNum > 0 && (
                    <div className="text-xs text-muted-foreground">
                      ছাড়: ৳
                      {(
                        addDiscountNum * addForm.selectedCourseIds.length
                      ).toLocaleString()}{' '}
                      (প্রতিটি কোর্সে)
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>নোট</label>
              <input
                type="text"
                value={addForm.notes}
                onChange={(e) =>
                  setAddForm({ ...addForm, notes: e.target.value })
                }
                placeholder="ঐচ্ছিক নোট"
                className={inputCls}
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={
                addSaving ||
                !addForm.userId ||
                addForm.selectedCourseIds.length === 0
              }
              className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {addSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {addForm.selectedCourseIds.length > 1
                ? `${addForm.selectedCourseIds.length}টি এনরোলমেন্ট তৈরি করুন`
                : 'এনরোলমেন্ট তৈরি করুন'}
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading font-semibold text-foreground">
              এনরোলমেন্ট সম্পাদনা — {editing.userName || '—'}
            </h4>
            <button
              onClick={() => setEditing(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="space-y-3">
            {editError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {editError}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>অবস্থা</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className={inputCls}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>নোট</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  placeholder="নোট"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>শুরুর তারিখ</label>
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, startDate: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>শেষের তারিখ</label>
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, endDate: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
              <p className="text-sm font-semibold text-foreground">ফি ও ছাড়</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    কোর্স ফি
                  </label>
                  <div className="mt-1 text-sm text-foreground">
                    ৳{editCourseFee.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>ছাড় (৳)</label>
                  <input
                    type="number"
                    min="0"
                    max={editCourseFee}
                    value={editForm.discount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, discount: e.target.value })
                    }
                    placeholder="০"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    পরিশোধযোগ্য ফি
                  </label>
                  <div className="mt-1 text-sm font-semibold text-green">
                    ৳{editTotalFee.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                পরিশোধ: ৳{editing.paidAmount.toLocaleString()} | বকেয়: ৳
                {Math.max(
                  0,
                  editTotalFee - editing.paidAmount,
                ).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
              >
                {editSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Pencil className="size-4" />
                )}
                সংরক্ষণ করুন
              </button>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="শিক্ষার্থী, ফোন বা কোর্স দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  শিক্ষার্থী
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  ফোন
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  কোর্স
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  ছাড়
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  মোট ফি
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  পরিশোধ
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  বকেয়
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  অবস্থা
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  কার্যক্রম
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {search
                      ? 'কোনো এনরোলমেন্ট পাওয়া যায়নি'
                      : 'এখনো কোনো এনরোলমেন্ট নেই'}
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {e.userName || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {e.userPhone || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {e.courseTitle || '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {e.discount > 0 ? (
                        <span className="text-orange-600 dark:text-orange-400">
                          −৳{e.discount.toLocaleString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      ৳{e.totalFee.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-green">
                      ৳{e.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-gold font-medium">
                      ৳{e.dueAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EnrollmentStatusBadge status={e.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {e.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleEditClick(e)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                              title="সম্পাদনা"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(e.id)}
                              disabled={cancelling === e.id}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="বাতিল করুন"
                            >
                              {cancelling === e.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Ban className="size-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
