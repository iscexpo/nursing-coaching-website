import type { Locale } from '@/i18n/routing'
import { getLocaleConfig } from '@/i18n/config'

export function formatDate(
  value: Date | string | number,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(
    getLocaleConfig(locale).dateLocale,
    options ?? {
      dateStyle: 'medium',
    },
  ).format(new Date(value))
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(
    getLocaleConfig(locale).dateLocale,
    options,
  ).format(value)
}

export function formatCurrency(value: number, locale: Locale) {
  return new Intl.NumberFormat(getLocaleConfig(locale).dateLocale, {
    style: 'currency',
    currency: getLocaleConfig(locale).currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number, locale: Locale) {
  return new Intl.NumberFormat(getLocaleConfig(locale).dateLocale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value / 100)
}
