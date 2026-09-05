import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['bn', 'en'] as const,
  defaultLocale: 'bn',
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
