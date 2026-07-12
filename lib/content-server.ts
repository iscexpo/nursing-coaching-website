import { getSystemSettings } from '@/lib/settings'
import { mergeCmsContent } from '@/lib/content-cms'

export async function getCmsContent() {
  const settings = await getSystemSettings()
  return mergeCmsContent(settings.cmsContent || undefined)
}
