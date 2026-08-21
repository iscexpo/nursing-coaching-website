'use client'

import { useTranslations } from 'next-intl'
import { Loader2, X, Key } from 'lucide-react'
import type { Student } from '../types'
import { inputCls, labelCls } from './types'

export function ResetPasswordCard({
  student,
  newPassword,
  setNewPassword,
  resetError,
  resetSaving,
  handleResetPassword,
  onClose,
}: {
  student: Student
  newPassword: string
  setNewPassword: (v: string) => void
  resetError: string
  resetSaving: boolean
  handleResetPassword: () => void
  onClose: () => void
}) {
  const t = useTranslations('admin.students')

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-900 dark:bg-blue-950/30">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading font-semibold text-foreground">
          {t('passwordResetHeading')} — {student.name}
        </h4>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="space-y-3">
        {resetError && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {resetError}
          </div>
        )}
        <div>
          <label className={labelCls}>{t('newPasswordLabel')}</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('formLabels.passwordPlaceholder')}
            className={inputCls}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleResetPassword()
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetPassword}
            disabled={resetSaving || newPassword.length < 6}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {resetSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Key className="size-4" />
            )}
            {t('updatePassword')}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}