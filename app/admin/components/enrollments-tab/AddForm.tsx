'use client'

import { useTranslations } from 'next-intl'
import { Plus, Loader2, X } from 'lucide-react'
import type { Course, Student } from '../types'
import { inputCls, labelCls } from './types'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Alert } from '@/components/ui/alert'
import type { AddFormState } from './types'

export function AddEnrollmentForm({
  addForm,
  setAddForm,
  students,
  filteredActiveCourses,
  courseSearch,
  setCourseSearch,
  addDiscountNum,
  addMaxDiscount,
  addTotalFee,
  addCourseFees,
  toggleCourse,
  toggleAllCourses,
  addError,
  addSaving,
  handleAdd,
  onClose,
}: {
  addForm: AddFormState
  setAddForm: React.Dispatch<React.SetStateAction<AddFormState>>
  students: Student[]
  filteredActiveCourses: Course[]
  courseSearch: string
  setCourseSearch: (v: string) => void
  addDiscountNum: number
  addMaxDiscount: number
  addTotalFee: number
  addCourseFees: { id: string; title: string; fee: number }[]
  toggleCourse: (courseId: string) => void
  toggleAllCourses: () => void
  addError: string
  addSaving: boolean
  handleAdd: () => void
  onClose: () => void
}) {
  const t = useTranslations('admin.enrollments')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading font-semibold text-foreground">
          {t('newEnrollment')}
        </h4>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="space-y-4">
        {addError && (
          <Alert variant="error" message={addError} dismissible={false} />
        )}

        <FormField id="enroll-student" label={t('studentLabel')} required>
          <select
            id="enroll-student"
            value={addForm.userId}
            onChange={(e) => setAddForm({ ...addForm, userId: e.target.value })}
            className={inputCls}
            aria-required="true"
          >
            <option value="">{t('studentLabel')} নির্বাচন করুন</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.phoneNumber ? ` (${s.phoneNumber})` : ''}
              </option>
            ))}
          </select>
        </FormField>

        <div>
          <div className="flex items-center justify-between">
            <label className={labelCls}>{t('courseSelectLabel')} *</label>
            <span className="text-xs text-muted-foreground">
              {addForm.selectedCourseIds.length}
              {t('selectedCount')}
            </span>
          </div>
          <div className="mt-1 rounded-lg border border-border bg-background overflow-hidden">
            <div className="p-2 border-b border-border">
              <input
                type="text"
                placeholder={t('courseSearchPlaceholder')}
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
              {t('selectedCourses')}
            </p>
            <div className="space-y-1">
              {addCourseFees.map((cf) => (
                <div
                  key={cf.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground truncate">{cf.title}</span>
                  <span className="shrink-0 text-muted-foreground">
                    ৳{cf.fee.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('totalFee')}</span>
                <span className="font-medium text-foreground">
                  ৳
                  {addCourseFees
                    .reduce((s, c) => s + c.fee, 0)
                    .toLocaleString()}
                </span>
              </div>
              <FormField
                id="enroll-discount"
                label={t('discountLabel')}
                error={
                  addDiscountNum > addMaxDiscount
                    ? t('discountExceedsFee')
                    : undefined
                }
              >
                <Input
                  id="enroll-discount"
                  type="number"
                  min="0"
                  max={addMaxDiscount}
                  value={addForm.discount}
                  onChange={(e) =>
                    setAddForm({ ...addForm, discount: e.target.value })
                  }
                  placeholder="০"
                  aria-invalid={addDiscountNum > addMaxDiscount}
                />
              </FormField>
              <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-border">
                <span className="text-muted-foreground">{t('payableFee')}</span>
                <span className="font-semibold text-green">
                  ৳{addTotalFee.toLocaleString()}
                </span>
              </div>
              {addDiscountNum > 0 && (
                <div className="text-xs text-muted-foreground">
                  {t('totalDiscount')}: ৳
                  {(
                    addDiscountNum * addForm.selectedCourseIds.length
                  ).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        <FormField
          id="enroll-notes"
          label="নোট"
          helpText={`${addForm.notes.length}/1000`}
        >
          <Input
            id="enroll-notes"
            type="text"
            value={addForm.notes}
            onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
            placeholder={t('notesPlaceholder')}
            maxLength={1000}
          />
        </FormField>

        <Separator />

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
            ? t('createEnrollments', {
                count: addForm.selectedCourseIds.length,
              })
            : t('createEnrollment')}
        </button>
      </div>
    </div>
  )
}
