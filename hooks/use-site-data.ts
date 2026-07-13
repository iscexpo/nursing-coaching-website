'use client'

import { useState, useEffect } from 'react'
import { defaultCmsContent, type CmsContent } from '@/lib/content-cms'

type SiteData = CmsContent['site']

const fallback: SiteData = defaultCmsContent.site

export function useSiteData(): SiteData {
  const [site, setSite] = useState<SiteData>(fallback)

  useEffect(() => {
    let cancelled = false
    fetch('/api/site-data')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data && !data.error) setSite(data)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return site
}
