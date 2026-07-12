import { describe, expect, it } from 'vitest'
import { buildBroadcastMessage, normalizePhoneNumbers } from '../lib/sms'

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
