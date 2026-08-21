import { describe, it, expect } from 'vitest'
import {
  validatePaymentAmount,
  calculatePaymentUpdate,
  calculatePaymentRefund,
} from '@/lib/core/lms-logic'
import { refundPaymentSchema } from '@/lib/core/validations'

describe('validatePaymentAmount', () => {
  it('accepts a payment equal to the due amount', () => {
    expect(validatePaymentAmount(5000, 5000).ok).toBe(true)
  })

  it('accepts a partial payment below the due amount', () => {
    expect(validatePaymentAmount(2000, 5000).ok).toBe(true)
  })

  it('rejects zero or negative amounts', () => {
    expect(validatePaymentAmount(0, 5000).ok).toBe(false)
    expect(validatePaymentAmount(-100, 5000).ok).toBe(false)
  })

  it('rejects overpayment beyond the due amount', () => {
    expect(validatePaymentAmount(5001, 5000).ok).toBe(false)
  })
})

describe('calculatePaymentUpdate', () => {
  it('adds the payment to paid and reduces due on both enrollment and invoice', () => {
    const result = calculatePaymentUpdate(1000, 4000, 500, 4500, 1000)
    expect(result.enrollmentPaid).toBe(2000)
    expect(result.enrollmentDue).toBe(3000)
    expect(result.invoicePaid).toBe(1500)
    expect(result.invoiceDue).toBe(3500)
    expect(result.invoiceStatus).toBe('partial')
  })

  it('marks invoice paid when the due amount is fully settled', () => {
    const result = calculatePaymentUpdate(4000, 1000, 4000, 1000, 1000)
    expect(result.enrollmentDue).toBe(0)
    expect(result.invoiceDue).toBe(0)
    expect(result.invoiceStatus).toBe('paid')
  })
})

describe('calculatePaymentRefund', () => {
  it('removes the refunded amount from paid and restores it to due', () => {
    const result = calculatePaymentRefund(4000, 1000, 4000, 1000, 1000)
    expect(result.enrollmentPaid).toBe(3000)
    expect(result.enrollmentDue).toBe(2000)
    expect(result.invoicePaid).toBe(3000)
    expect(result.invoiceDue).toBe(2000)
  })

  it('never pushes paid amounts below zero', () => {
    const result = calculatePaymentRefund(500, 0, 500, 0, 1000)
    expect(result.enrollmentPaid).toBe(0)
    expect(result.enrollmentDue).toBe(1000)
  })

  it('returns to partial status when only part of the balance was cleared', () => {
    const result = calculatePaymentRefund(4000, 1000, 4000, 1000, 500)
    expect(result.invoiceStatus).toBe('partial')
  })

  it('returns to partial status when the refund recreates a due amount', () => {
    const result = calculatePaymentRefund(4000, 0, 4000, 0, 500)
    expect(result.invoiceDue).toBe(500)
    expect(result.invoiceStatus).toBe('partial')
  })
})

describe('refundPaymentSchema', () => {
  it('accepts an empty body (full refund)', () => {
    expect(refundPaymentSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a positive integer amount', () => {
    expect(refundPaymentSchema.safeParse({ amount: 1500 }).success).toBe(true)
  })

  it('rejects zero, negative, and non-integer amounts', () => {
    expect(refundPaymentSchema.safeParse({ amount: 0 }).success).toBe(false)
    expect(refundPaymentSchema.safeParse({ amount: -50 }).success).toBe(false)
    expect(refundPaymentSchema.safeParse({ amount: 10.5 }).success).toBe(false)
  })
})
