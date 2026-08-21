import { getSystemSettings } from '@/lib/cms/settings'
import { defaultCmsContent, mergeCmsContent } from '@/lib/cms'

export async function getCmsContent() {
  const settings = await getSystemSettings()
  return mergeCmsContent(settings.cmsContent || undefined)
}

export async function getSiteData() {
  const content = await getCmsContent()
  return content.site
}

export type SiteData = typeof defaultCmsContent.site
