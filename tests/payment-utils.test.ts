import { describe, expect, it } from 'vitest'
import { getPaymentValidationErrors } from '../lib/payment'
import {
  calculatePaymentUpdate,
  validatePaymentAmount,
} from '../lib/core/lms-logic'

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

  it('rejects an amount above the server-authoritative due amount', () => {
    expect(validatePaymentAmount(0, 1000).ok).toBe(false)
    expect(validatePaymentAmount(-1, 1000).ok).toBe(false)
    expect(validatePaymentAmount(1001, 1000).ok).toBe(false)
    expect(validatePaymentAmount(1000, 1000).ok).toBe(true)
  })

  it('keeps invoice and enrollment totals synchronized', () => {
    expect(calculatePaymentUpdate(2000, 3000, 2000, 3000, 1000)).toEqual({
      enrollmentPaid: 3000,
      enrollmentDue: 2000,
      invoicePaid: 3000,
      invoiceDue: 2000,
      invoiceStatus: 'partial',
    })
  })
})
