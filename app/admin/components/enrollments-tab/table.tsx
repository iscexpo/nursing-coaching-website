'use client'

import { useTranslations } from 'next-intl'
import { Pencil, Ban, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { EnrollmentStatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import type { Enrollment } from '../types'

export function EnrollmentsTable({
  filtered,
  paged,
  selectedIds,
  toggleSelectAll,
  toggleSelect,
  onEdit,
  onCancel,
  cancelling,
  search,
  pageSize,
  onPageSizeChange,
  page,
  setPage,
  safePage,
  totalPages,
}: {
  filtered: Enrollment[]
  paged: Enrollment[]
  selectedIds: string[]
  toggleSelectAll: () => void
  toggleSelect: (id: string) => void
  onEdit: (e: Enrollment) => void
  onCancel: (id: string) => void
  cancelling: string | null
  search: string
  pageSize: number
  onPageSizeChange: (n: number) => void
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  safePage: number
  totalPages: number
}) {
  const t = useTranslations('admin.enrollments')

  return (
    <>
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-center font-semibold text-foreground w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paged.length && paged.length > 0}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-border text-brand focus:ring-brand"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  {t('tableHeaders.student')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  {t('tableHeaders.phone')}
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  {t('tableHeaders.course')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  {t('tableHeaders.discount')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  {t('tableHeaders.totalFee')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  {t('tableHeaders.payment')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  {t('tableHeaders.due')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  {t('tableHeaders.status')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">
                  {t('tableHeaders.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8">
                    <EmptyState
                      title={search ? t('emptySearch') : t('emptyNoData')}
                      description={
                        search ? t('emptySearchHint') : t('emptyCreateHint')
                      }
                    />
                  </td>
                </tr>
              ) : (
                paged.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(e.id)}
                        onChange={() => toggleSelect(e.id)}
                        className="size-4 rounded border-border text-brand focus:ring-brand"
                      />
                    </td>
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
                              onClick={() => onEdit(e)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                              title={t('editAction')}
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => onCancel(e.id)}
                              disabled={cancelling === e.id}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title={t('cancelAction')}
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

      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">দেখুন:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value))
                setPage(1)
              }}
              className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
            >
              <option value={10}>১০</option>
              <option value={25}>২৫</option>
              <option value={50}>৫০</option>
              <option value={100}>১০০</option>
            </select>
            <span className="text-sm text-muted-foreground">
              / {filtered.length} টি
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              পৃষ্ঠা {safePage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage <= 1}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              পূর্ববর্তী
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="gap-1"
            >
              পরবর্তী
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}