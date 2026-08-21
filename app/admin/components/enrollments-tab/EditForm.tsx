'use client'

import { useTranslations } from 'next-intl'
import { Pencil, Loader2, X } from 'lucide-react'
import type { Enrollment } from '../types'
import { inputCls, labelCls } from './types'
import type { EditState } from './types'

export function EditEnrollmentForm({
  editing,
  editForm,
  setEditForm,
  statusOptions,
  editCourseFee,
  editDiscountNum,
  editTotalFee,
  editError,
  editSaving,
  handleEditSave,
  onClose,
}: {
  editing: Enrollment
  editForm: EditState
  setEditForm: React.Dispatch<React.SetStateAction<EditState>>
  statusOptions: { value: string; label: string }[]
  editCourseFee: number
  editDiscountNum: number
  editTotalFee: number
  editError: string
  editSaving: boolean
  handleEditSave: () => void
  onClose: () => void
}) {
  const t = useTranslations('admin.enrollments')

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading font-semibold text-foreground">
          {t('editTitle')} — {editing.userName || '—'}
        </h4>
        <button
          onClick={onClose}
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
              {statusOptions.map((s) => (
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
              maxLength={1000}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {editForm.notes.length}/1000
            </p>
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
              min={editForm.startDate || undefined}
              onChange={(e) =>
                setEditForm({ ...editForm, endDate: e.target.value })
              }
              className={inputCls}
            />
            {editForm.startDate &&
              editForm.endDate &&
              editForm.endDate < editForm.startDate && (
                <p className="mt-1 text-xs text-destructive">
                  শেষের তারিখ শুরুর তারিখের পরে হতে হবে
                </p>
              )}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {t('feeAndDiscount')}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                {t('courseFee')}
              </label>
              <div className="mt-1 text-sm text-foreground">
                ৳{editCourseFee.toLocaleString()}
              </div>
            </div>
            <div>
              <label className={labelCls}>{t('discountLabel')}</label>
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
                {t('payableFee')}
              </label>
              <div className="mt-1 text-sm font-semibold text-green">
                ৳{editTotalFee.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            পরিশোধ: ৳{editing.paidAmount.toLocaleString()} | বকেয়: ৳
            {Math.max(0, editTotalFee - editing.paidAmount).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEditSave}
            disabled={
              editSaving ||
              (!!editForm.startDate &&
                !!editForm.endDate &&
                editForm.endDate < editForm.startDate)
            }
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
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            বাতিল
          </button>
        </div>
      </div>
    </div>
  )
}