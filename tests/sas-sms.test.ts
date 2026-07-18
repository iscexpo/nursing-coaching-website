import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

const selectMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db', () => ({
  db: {
    select: selectMock,
  },
}))

import { sendSmsToRecipients } from '../lib/sms'

describe('SAS Bulk SMS integration', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('sends SMS via SAS Bulk SMS when provider is sasbulksms', async () => {
    selectMock.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          {
            id: 'primary',
            smsProvider: 'sasbulksms',
            smsApiKey: 'sas-test-key',
            smsSenderId: 'CORNIA',
          },
        ]),
      }),
    })

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({ status: 'success', message_id: 'sas-msg-456' }),
        ),
    })
    globalThis.fetch = mockFetch

    const result = await sendSmsToRecipients(
      ['01711111111'],
      'Test SAS message',
    )

    expect(mockFetch).toHaveBeenCalled()
    expect(result.provider).toBe('sasbulksms')
    expect(result.skipped).toBe(false)
  })

  it('returns skipped when SAS provider has no API key', async () => {
    selectMock.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          {
            id: 'primary',
            smsProvider: 'sasbulksms',
            smsApiKey: '',
            smsSenderId: '',
          },
        ]),
      }),
    })

    const result = await sendSmsToRecipients(['01711111111'], 'Test message')

    expect(result.skipped).toBe(true)
    expect(result.sent).toBe(0)
  })
})
