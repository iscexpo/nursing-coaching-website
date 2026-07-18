import { describe, expect, it } from 'vitest'
import { getPaymentValidationErrors } from '../lib/payment-utils'

describe('getPaymentValidationErrors', () => {
  it('accepts a valid cash payment without transaction details', () => {
    const errors = getPaymentValidationErrors(
      {
        amount: 5000,
        method: 'cash',
        transactionId: '',
        senderNumber: '',
      },
      10000,
    )

    expect(errors).toEqual({})
  })

  it('rejects payment amounts that exceed the due amount', () => {
    const errors = getPaymentValidationErrors(
      {
        amount: 12000,
        method: 'bkash',
        transactionId: 'TX123',
        senderNumber: '01711111111',
      },
      10000,
    )

    expect(errors.amount).toContain('বকেয়া')
  })

  it('requires transaction details for mobile payments', () => {
    const errors = getPaymentValidationErrors(
      {
        amount: 3000,
        method: 'bkash',
        transactionId: '',
        senderNumber: '',
      },
      10000,
    )

    expect(errors.transactionId).toContain('ট্রানজেকশন')
    expect(errors.senderNumber).toContain('প্রেরক')
  })
})
