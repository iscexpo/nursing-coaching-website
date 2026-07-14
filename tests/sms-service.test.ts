import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

const selectMock = vi.hoisted(() => vi.fn())
const insertMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
  },
}))

import { buildBroadcastMessage, normalizePhoneNumbers, sendSmsToRecipients } from '../lib/sms'

describe('sms helpers', () => {
  it('builds a concise broadcast message from notice content', () => {
    const message = buildBroadcastMessage('নতুন নোটিশ', 'আজ রাতে ক্লাস হবে')

    expect(message).toContain('নতুন নোটিশ')
    expect(message).toContain('আজ রাতে ক্লাস হবে')
  })

  it('keeps only valid local phone numbers', () => {
    const numbers = normalizePhoneNumbers(['01711111111', 'abc', '+8801812345678', '01522222222'])

    expect(numbers).toEqual(['01711111111', '01522222222', '+8801812345678'])
  })
})

describe('GP SMS integration', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('sends SMS to recipients via Grameenphone API when configured', async () => {
    selectMock.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{
          id: 'primary',
          smsProvider: 'grameenphone',
          smsApiKey: 'test-api-key',
          smsSenderId: 'CORNIA',
        }]),
      }),
    })

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ status: 'success', message_id: 'msg-123' })),
    })
    globalThis.fetch = mockFetch

    const result = await sendSmsToRecipients(['01711111111'], 'Test message')

    expect(mockFetch).toHaveBeenCalled()
    expect(result.provider).toBe('grameenphone')
    expect(result.skipped).toBe(false)
  })

  it('returns skipped when provider is none', async () => {
    selectMock.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{
          id: 'primary',
          smsProvider: 'none',
          smsApiKey: '',
          smsSenderId: '',
        }]),
      }),
    })

    const result = await sendSmsToRecipients(['01711111111'], 'Test message')

    expect(result.skipped).toBe(true)
    expect(result.sent).toBe(0)
  })
})
