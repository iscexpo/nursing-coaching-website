import { beforeEach, describe, expect, it, vi } from 'vitest'

const selectMock = vi.hoisted(() => vi.fn())
const insertMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
  },
}))

import { getSystemSettings } from '@/lib/settings'

describe('getSystemSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('falls back to default settings when the database query fails', async () => {
    selectMock.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error('db down')),
      }),
    })

    await expect(getSystemSettings()).resolves.toMatchObject({
      id: 'primary',
      siteName: 'ISC Expo - Icon Skill & Career Expo',
      siteTagline: 'সাফল্যের জন্য প্রস্তুতি',
      cmsContent: expect.objectContaining({
        hero: expect.objectContaining({
          title: 'খুলনার অন্যতম বিশ্বস্ত নার্সিং ভর্তি কোচিং',
        }),
      }),
    })
  })
})
