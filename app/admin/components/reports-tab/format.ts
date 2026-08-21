'use client'

import { useTranslations } from 'next-intl'

export function useReportFormatters() {
  const t = useTranslations('admin.reports')

  const MONTHS_BN = [
    t('months.jan'),
    t('months.feb'),
    t('months.mar'),
    t('months.apr'),
    t('months.may'),
    t('months.jun'),
    t('months.jul'),
    t('months.aug'),
    t('months.sep'),
    t('months.oct'),
    t('months.nov'),
    t('months.dec'),
  ]

  function formatMonth(dateStr: string) {
    const d = new Date(dateStr)
    return `${MONTHS_BN[d.getMonth()]} ${d.getFullYear()}`
  }

  function formatCurrency(amount: number) {
    return `৳${amount.toLocaleString('bn-BD')}`
  }

  function calculatePercentage(value: number, total: number) {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  return { t, formatMonth, formatCurrency, calculatePercentage }
}
