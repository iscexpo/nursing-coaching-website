import { describe, expect, it } from 'vitest'
import { defaultCmsContent, mergeCmsContent } from '../lib/content-cms'

describe('mergeCmsContent', () => {
  it('merges custom hero content over the defaults', () => {
    const merged = mergeCmsContent({ hero: { title: 'নতুন হিরো টাইটেল' } })

    expect(merged.hero.title).toBe('নতুন হিরো টাইটেল')
    expect(merged.hero.subtitle).toBe(defaultCmsContent.hero.subtitle)
    expect(merged.site.nameBn).toBe(defaultCmsContent.site.nameBn)
  })
})
