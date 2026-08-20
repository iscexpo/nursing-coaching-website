import { describe, expect, it } from 'vitest'
import {
  createEnrollmentSchema,
  createQuestionSchema,
  createPaymentSchema,
  paginationSchema,
  submitExamSchema,
} from '@/lib/validations'

describe('domain validation contracts', () => {
  it('requires a course when creating an enrollment', () => {
    expect(createEnrollmentSchema.safeParse({}).success).toBe(false)
    expect(
      createEnrollmentSchema.safeParse({
        courseId: '00000000-0000-0000-0000-000000000001',
      }).success,
    ).toBe(true)
  })

  it('bounds pagination to a safe server limit', () => {
    expect(paginationSchema.parse({ page: '2', limit: '50' })).toEqual({
      page: 2,
      limit: 50,
    })
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false)
  })

  it('requires transaction metadata for the payment shape only when supplied', () => {
    const result = createPaymentSchema.safeParse({
      enrollmentId: '00000000-0000-0000-0000-000000000001',
      amount: 1000,
      method: 'cash',
    })
    expect(result.success).toBe(true)
  })

  it('enforces four answer options and a valid correct index', () => {
    const base = {
      examId: '00000000-0000-0000-0000-000000000001',
      question: 'What is 2 + 2?',
    }
    expect(
      createQuestionSchema.safeParse({
        ...base,
        options: ['1', '2', '3', '4'],
        correctIndex: 3,
      }).success,
    ).toBe(true)
    expect(
      createQuestionSchema.safeParse({
        ...base,
        options: ['1', '2', '3'],
        correctIndex: 0,
      }).success,
    ).toBe(false)
  })

  it('accepts bounded exam answers', () => {
    expect(
      submitExamSchema.safeParse({
        examId: '00000000-0000-0000-0000-000000000001',
        answers: { question: 2 },
        timeTaken: 60,
      }).success,
    ).toBe(true)
    expect(
      submitExamSchema.safeParse({
        examId: '00000000-0000-0000-0000-000000000001',
        answers: { question: 4 },
      }).success,
    ).toBe(false)
  })
})
