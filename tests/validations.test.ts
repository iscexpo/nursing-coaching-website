import { describe, it, expect } from 'vitest'
import {
  paginationSchema,
  createEnrollmentSchema,
  updateEnrollmentSchema,
  createPaymentSchema,
  verifyPaymentSchema,
  createQuestionSchema,
  submitExamSchema,
  createAttendanceSchema,
} from '@/lib/core/validations'

describe('paginationSchema', () => {
  it('defaults page to 1 and limit to 20', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 20 })
  })

  it('parses string values from query params', () => {
    expect(paginationSchema.parse({ page: '3', limit: '50' })).toEqual({
      page: 3,
      limit: 50,
    })
  })

  it('rejects a limit above 100', () => {
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false)
  })

  it('rejects a page below 1', () => {
    expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false)
  })
})

describe('createEnrollmentSchema', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000'

  it('accepts a single courseId', () => {
    const result = createEnrollmentSchema.safeParse({ courseId: uuid })
    expect(result.success).toBe(true)
  })

  it('accepts courseIds list', () => {
    const result = createEnrollmentSchema.safeParse({
      courseIds: [uuid, '550e8400-e29b-41d4-a716-446655440001'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects when no course is selected', () => {
    const result = createEnrollmentSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects a non-uuid courseId', () => {
    const result = createEnrollmentSchema.safeParse({ courseId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

describe('updateEnrollmentSchema', () => {
  it('accepts a valid status change', () => {
    const result = updateEnrollmentSchema.safeParse({ status: 'approved' })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown status', () => {
    const result = updateEnrollmentSchema.safeParse({ status: 'archived' })
    expect(result.success).toBe(false)
  })

  it('accepts an empty body', () => {
    expect(updateEnrollmentSchema.safeParse({}).success).toBe(true)
  })
})

describe('createPaymentSchema', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000'

  it('accepts a valid payment', () => {
    const result = createPaymentSchema.safeParse({
      enrollmentId: uuid,
      amount: 2500,
      method: 'bkash',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a zero amount', () => {
    const result = createPaymentSchema.safeParse({
      enrollmentId: uuid,
      amount: 0,
      method: 'cash',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown method', () => {
    const result = createPaymentSchema.safeParse({
      enrollmentId: uuid,
      amount: 100,
      method: 'paypal',
    })
    expect(result.success).toBe(false)
  })
})

describe('verifyPaymentSchema', () => {
  it('accepts verified and rejected', () => {
    expect(verifyPaymentSchema.safeParse({ status: 'verified' }).success).toBe(
      true,
    )
    expect(verifyPaymentSchema.safeParse({ status: 'rejected' }).success).toBe(
      true,
    )
  })

  it('rejects refunded as a verify action', () => {
    expect(verifyPaymentSchema.safeParse({ status: 'refunded' }).success).toBe(
      false,
    )
  })
})

describe('createQuestionSchema', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000'

  it('accepts a valid question with exactly 4 options', () => {
    const result = createQuestionSchema.safeParse({
      examId: uuid,
      question: 'What is 2+2?',
      options: ['1', '2', '3', '4'],
      correctIndex: 2,
    })
    expect(result.success).toBe(true)
  })

  it('rejects fewer than 4 options', () => {
    const result = createQuestionSchema.safeParse({
      examId: uuid,
      question: 'What is 2+2?',
      options: ['1', '2'],
      correctIndex: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects an out-of-range correctIndex', () => {
    const result = createQuestionSchema.safeParse({
      examId: uuid,
      question: 'What is 2+2?',
      options: ['1', '2', '3', '4'],
      correctIndex: 5,
    })
    expect(result.success).toBe(false)
  })
})

describe('submitExamSchema', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000'

  it('accepts answers with 0-3 indexes', () => {
    const result = submitExamSchema.safeParse({
      examId: uuid,
      answers: { q1: 0, q2: 3 },
      timeTaken: 120,
    })
    expect(result.success).toBe(true)
  })

  it('rejects an out-of-range answer index', () => {
    const result = submitExamSchema.safeParse({
      examId: uuid,
      answers: { q1: 4 },
    })
    expect(result.success).toBe(false)
  })
})

describe('createAttendanceSchema', () => {
  it('accepts present, late, and absent', () => {
    for (const status of ['present', 'late', 'absent']) {
      expect(
        createAttendanceSchema.safeParse({
          userId: 'user-1',
          date: '2026-08-20',
          status,
        }).success,
      ).toBe(true)
    }
  })

  it('rejects an unknown attendance status', () => {
    expect(
      createAttendanceSchema.safeParse({
        userId: 'user-1',
        date: '2026-08-20',
        status: 'sick',
      }).success,
    ).toBe(false)
  })

  it('rejects a missing user or date', () => {
    expect(
      createAttendanceSchema.safeParse({ status: 'present' }).success,
    ).toBe(false)
  })
})
