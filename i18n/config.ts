import type { Locale } from './routing'

export const localeConfig = {
  bn: {
    label: 'বাংলা',
    englishLabel: 'Bengali',
    direction: 'ltr',
    dateLocale: 'bn-BD',
    currency: 'BDT',
  },
  en: {
    label: 'English',
    englishLabel: 'English',
    direction: 'ltr',
    dateLocale: 'en-US',
    currency: 'BDT',
  },
} as const satisfies Record<Locale, object>

export type LocaleConfig = (typeof localeConfig)[Locale]

export function isLocale(value: string | undefined): value is Locale {
  return value === 'bn' || value === 'en'
}

export function getLocaleConfig(locale: Locale) {
  return localeConfig[locale]
}

export const localeOptions = Object.entries(localeConfig).map(
  ([value, config]) => ({
    value: value as Locale,
    ...config,
  }),
)

export const messageNamespaces = [
  'common',
  'nav',
  'marketing',
  'auth',
  'admission',
  'dashboard',
  'admin',
  'forms',
  'errors',
  'notifications',
  'reports',
] as const
