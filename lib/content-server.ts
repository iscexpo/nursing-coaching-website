import { getSystemSettings } from '@/lib/settings'
import { defaultCmsContent, mergeCmsContent } from '@/lib/content-cms'

export async function getCmsContent() {
  const settings = await getSystemSettings()
  return mergeCmsContent(settings.cmsContent || undefined)
}

export async function getSiteData() {
  const content = await getCmsContent()
  return content.site
}

export type SiteData = typeof defaultCmsContent.site
