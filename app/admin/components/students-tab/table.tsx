'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Pencil, Key, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import type { Student } from '../types'

export function StudentsTable({
  filtered,
  search,
  onEdit,
  onResetPassword,
  onDelete,
}: {
  filtered: Student[]
  search: string
  onEdit: (s: Student) => void
  onResetPassword: (s: Student) => void
  onDelete: (id: string) => void
}) {
  const t = useTranslations('admin.students')

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                {t('tableHeaders.name')}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                {t('tableHeaders.email')}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                {t('tableHeaders.phone')}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                {t('tableHeaders.district')}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                {t('tableHeaders.studentId')}
              </th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">
                {t('tableHeaders.role')}
              </th>
              <th className="px-4 py-3 text-center font-semibold text-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    title={search ? t('emptySearch') : t('emptyNoData')}
                  />
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      {s.image ? (
                        <Image
                          src={s.image}
                          alt={s.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-muted-foreground">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.phoneNumber || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.district || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.studentId || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.role === 'admin' ? 'bg-brand/10 text-brand' : 'bg-green/10 text-green'}`}
                      >
                        {s.role === 'admin' ? t('roleAdmin') : t('roleStudent')}
                      </span>
                      {s.admissionId && (
                        <span className="inline-flex rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                          {t('admissionBadge')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(s)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => onResetPassword(s)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-50 hover:text-blue-600"
                        title={t('passwordResetHeading')}
                      >
                        <Key className="size-4" />
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}