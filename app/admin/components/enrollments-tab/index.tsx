'use client'

import { useState, useMemo, useCallback } from 'react'
import { Plus, X, Loader2, Ban, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/filter-bar'
import { useToast } from '@/components/ui/toast'
import type { Enrollment, Course, Student } from '../types'
import { AddEnrollmentForm } from './AddForm'
import { EditEnrollmentForm } from './EditForm'
import { EnrollmentsTable } from './table'
import type { AddFormState, EditState } from './types'

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
  const t = useTranslations('admin.enrollments')

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: 'pending', label: t('statusOptions.pending') },
      { value: 'approved', label: t('statusOptions.approved') },
      { value: 'active', label: t('statusOptions.active') },
      { value: 'completed', label: t('statusOptions.completed') },
      { value: 'rejected', label: t('statusOptions.rejected') },
      { value: 'cancelled', label: t('statusOptions.cancelled') },
      { value: 'suspended', label: t('statusOptions.suspended') },
    ],
    [t],
  )

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
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

  const { success, error, confirm } = useToast()
  const [cancelling, setCancelling] = useState<string | null>(null)

  // Bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<'status' | 'cancel' | null>(null)
  const [bulkStatus, setBulkStatus] = useState('active')
  const [bulkSaving, setBulkSaving] = useState(false)

  const resetPage = useCallback(() => setPage(1), [])

  const activeCourses = courses.filter((c) => c.isActive)
  const filtered = enrollments.filter((e) => {
    if (filter && filter !== 'all' && e.status !== filter) return false
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  )

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
  const addMaxDiscount = useMemo(() => {
    if (addForm.selectedCourseIds.length === 0) return 0
    return addForm.selectedCourseIds.reduce((max, cid) => {
      const c = activeCourses.find((x) => x.id === cid)
      const fee = c ? c.discountFee || c.fee : 0
      return Math.max(max, fee)
    }, 0)
  }, [addForm.selectedCourseIds, activeCourses])
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

  // Bulk selection handlers
  function toggleSelectAll() {
    if (selectedIds.length === paged.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paged.map((e) => e.id))
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleBulkAction() {
    if (selectedIds.length === 0) return
    setBulkSaving(true)
    let successCount = 0
    let failCount = 0
    try {
      if (bulkAction === 'status') {
        for (const id of selectedIds) {
          const res = await fetch(`/api/enrollments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: bulkStatus }),
          })
          if (res.ok) successCount++
          else failCount++
        }
        if (failCount > 0) {
          error(
            t('bulkPartialSuccess', { success: successCount, fail: failCount }),
          )
        } else {
          success(t('bulkSuccess', { count: successCount }))
        }
      } else if (bulkAction === 'cancel') {
        for (const id of selectedIds) {
          const res = await fetch(`/api/enrollments/${id}`, {
            method: 'DELETE',
          })
          if (res.ok) successCount++
          else failCount++
        }
        if (failCount > 0) {
          error(
            t('bulkPartialDelete', { success: successCount, fail: failCount }),
          )
        } else {
          success(t('bulkDeleteSuccess', { count: successCount }))
        }
      }
      setSelectedIds([])
      setBulkAction(null)
      onRefresh()
    } catch {
      error(t('bulkFailed'))
    } finally {
      setBulkSaving(false)
    }
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
          setAddError(
            t('partialCreateSuccess', { success: count, fail: errCount }),
          )
        } else if (errCount > 0) {
          setAddError(
            data.details
              ?.map((d: { courseId: string; error: string }) => d.error)
              .join(', ') || t('createFailed'),
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
        const details = data.details
          ? Object.entries(data.details)
              .map(
                ([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`,
              )
              .join('; ')
          : ''
        setAddError(
          details
            ? `${data.error} (${details})`
            : data.error || t('createFailed'),
        )
      }
    } catch {
      setAddError(t('createFailed'))
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
        const err = await res.json().catch(() => ({ error: t('updateFailed') }))
        setEditError(err.error || t('updateFailed'))
      }
    } catch {
      setEditError(t('updateFailed'))
    } finally {
      setEditSaving(false)
    }
  }

  async function handleCancel(id: string) {
    if (!(await confirm(t('cancelConfirm')))) return
    setCancelling(id)
    try {
      const res = await fetch(`/api/enrollments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        onRefresh()
        success(t('cancelSuccess'))
      } else {
        const err = await res.json().catch(() => ({}))
        error(err.error || t('cancelFailed'))
      }
    } catch {
      error(t('cancelFailed'))
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-bold text-foreground">
          {t('management')}
        </h3>
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
          <Plus className="size-4" /> {t('newEnrollment')}
        </button>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          resetPage()
        }}
        searchPlaceholder={t('searchPlaceholder')}
        filters={[
          {
            name: 'status',
            label: 'অবস্থা',
            type: 'select',
            options: STATUS_OPTIONS.map((s) => ({
              value: s.value,
              label: s.label,
            })),
            value: filter,
            onChange: (value) => {
              setFilter(value)
              resetPage()
            },
          },
        ]}
      />

      {showAdd && (
        <AddEnrollmentForm
          addForm={addForm}
          setAddForm={setAddForm}
          students={students}
          filteredActiveCourses={filteredActiveCourses}
          courseSearch={courseSearch}
          setCourseSearch={setCourseSearch}
          addDiscountNum={addDiscountNum}
          addMaxDiscount={addMaxDiscount}
          addTotalFee={addTotalFee}
          addCourseFees={addCourseFees}
          toggleCourse={toggleCourse}
          toggleAllCourses={toggleAllCourses}
          addError={addError}
          addSaving={addSaving}
          handleAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editing && (
        <EditEnrollmentForm
          editing={editing}
          editForm={editForm}
          setEditForm={setEditForm}
          statusOptions={STATUS_OPTIONS}
          editCourseFee={editCourseFee}
          editDiscountNum={editDiscountNum}
          editTotalFee={editTotalFee}
          editError={editError}
          editSaving={editSaving}
          handleEditSave={handleEditSave}
          onClose={() => setEditing(null)}
        />
      )}

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-brand/5 p-3 border border-brand/20">
          <span className="text-sm font-medium text-brand">
            {selectedIds.length}
            {t('selectedCount')}
          </span>
          <div className="flex items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <Button
              onClick={async () => {
                const statusLabel = STATUS_OPTIONS.find(
                  (s) => s.value === bulkStatus,
                )?.label
                const ok = await confirm(
                  t('bulkStatusChangeConfirm', {
                    count: selectedIds.length,
                    status: statusLabel!,
                  }),
                )
                if (ok) {
                  setBulkAction('status')
                  handleBulkAction()
                }
              }}
              disabled={bulkSaving}
              size="sm"
            >
              {bulkSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              {t('bulkUpdateStatus')}
            </Button>
            <Button
              onClick={async () => {
                const ok = await confirm(t('bulkCancelConfirm'))
                if (ok) {
                  setBulkAction('cancel')
                  handleBulkAction()
                }
              }}
              disabled={bulkSaving}
              variant="destructive"
              size="sm"
            >
              {bulkSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Ban className="size-4" />
              )}
              {t('cancelAction')}
            </Button>
            <button
              onClick={() => setSelectedIds([])}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <EnrollmentsTable
        filtered={filtered}
        paged={paged}
        selectedIds={selectedIds}
        toggleSelectAll={toggleSelectAll}
        toggleSelect={toggleSelect}
        onEdit={handleEditClick}
        onCancel={handleCancel}
        cancelling={cancelling}
        search={search}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        page={page}
        setPage={setPage}
        safePage={safePage}
        totalPages={totalPages}
      />
    </div>
  )
}