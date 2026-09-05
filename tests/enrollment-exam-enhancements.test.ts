import { describe, it, expect } from 'vitest'
import {
  isValidEnrollmentTransition,
  calculateExpiryDate,
} from '@/lib/core/lms-logic'
import {
  createExamSchema,
  createQuestionSchema,
  updateEnrollmentSchema,
} from '@/lib/core/validations'

describe('Enrollment expired handling (design 3.1)', () => {
  it('allows active → expired', () => {
    expect(isValidEnrollmentTransition('active', 'expired')).toBe(true)
  })
  it('allows expired → pending (re-enroll)', () => {
    expect(isValidEnrollmentTransition('expired', 'pending')).toBe(true)
  })
  it('calculates expiry 12 months by default', () => {
    const approvedAt = new Date('2025-01-15T00:00:00Z')
    const expiry = calculateExpiryDate(approvedAt)
    expect(expiry.getMonth()).toBe(0) // Jan +12months = Jan next year
    expect(expiry.getFullYear()).toBe(2026)
  })
  it('calculates expiry with custom months', () => {
    const approvedAt = new Date('2025-01-15T00:00:00Z')
    const expiry = calculateExpiryDate(approvedAt, 6)
    expect(expiry.getMonth()).toBe(6) // July
    expect(expiry.getFullYear()).toBe(2025)
  })
  it('updateEnrollmentSchema accepts expired', () => {
    expect(
      updateEnrollmentSchema.safeParse({ status: 'expired' }).success,
    ).toBe(true)
    expect(
      updateEnrollmentSchema.safeParse({ status: 'cancelled' }).success,
    ).toBe(true)
  })
})

describe('Exam system enhancements (design 3.3)', () => {
  it('accepts examType and boolean flags', () => {
    const parsed = createExamSchema.safeParse({
      title: 'Final Model Test',
      subject: 'Anatomy',
      duration: 60,
      difficulty: 'hard',
      examType: 'final_exam',
      negativeMarking: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      allowReview: false,
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.examType).toBe('final_exam')
      expect(parsed.data.negativeMarking).toBe(true)
    }
  })
  it('defaults are optional', () => {
    const parsed = createExamSchema.safeParse({
      title: 'Quiz',
      subject: 'Physiology',
    })
    expect(parsed.success).toBe(true)
  })
  it('rejects invalid examType', () => {
    const parsed = createExamSchema.safeParse({
      title: 'X',
      subject: 'Y',
      examType: 'invalid',
    })
    expect(parsed.success).toBe(false)
  })
  it('question accepts difficulty/points/explanation', () => {
    const parsed = createQuestionSchema.safeParse({
      examId: '00000000-0000-0000-0000-000000000000',
      question: 'What is BON...?',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 1,
      difficulty: 'easy',
      points: 5,
      explanation: 'Because ...',
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.difficulty).toBe('easy')
      expect(parsed.data.points).toBe(5)
      expect(parsed.data.explanation).toBe('Because ...')
    }
  })
  it('question rejects invalid points (too high)', () => {
    const parsed = createQuestionSchema.safeParse({
      examId: '00000000-0000-0000-0000-000000000000',
      question: 'Q?',
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      points: 11,
    })
    expect(parsed.success).toBe(false)
  })
})
