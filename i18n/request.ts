import { getRequestConfig } from 'next-intl/server'
import { isLocale } from './config'
import { routing } from './routing'

const messageLoaders = {
  bn: () => import('../messages/bn.json'),
  en: () => import('../messages/en.json'),
} as const

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  const locale = isLocale(requestedLocale)
    ? requestedLocale
    : routing.defaultLocale
  return {
    locale,
    messages: (await messageLoaders[locale]()).default,
  }
})
