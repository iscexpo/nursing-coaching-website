import { describe, it, expect } from 'vitest'
import {
  isValidEnrollmentTransition,
  getEnrollmentTransitionError,
  getLifecycleTimestamp,
  shouldAutoExpire,
  calculateGrade,
  calculateExamScore,
  validatePaymentAmount,
  calculatePaymentUpdate,
  shuffleArray,
  calculateCompletionPercentage,
} from '@/lib/core/lms-logic'

describe('Enrollment Status Transitions', () => {
  it('allows pending → approved', () => {
    expect(isValidEnrollmentTransition('pending', 'approved')).toBe(true)
  })

  it('allows pending → rejected', () => {
    expect(isValidEnrollmentTransition('pending', 'rejected')).toBe(true)
  })

  it('allows approved → active', () => {
    expect(isValidEnrollmentTransition('approved', 'active')).toBe(true)
  })

  it('allows active → completed', () => {
    expect(isValidEnrollmentTransition('active', 'completed')).toBe(true)
  })

  it('allows active → suspended', () => {
    expect(isValidEnrollmentTransition('active', 'suspended')).toBe(true)
  })

  it('allows suspended → active', () => {
    expect(isValidEnrollmentTransition('suspended', 'active')).toBe(true)
  })

  it('rejects pending → active (skips approval)', () => {
    expect(isValidEnrollmentTransition('pending', 'active')).toBe(false)
  })

  it('rejects completed → any (terminal state)', () => {
    expect(isValidEnrollmentTransition('completed', 'active')).toBe(false)
    expect(isValidEnrollmentTransition('completed', 'pending')).toBe(false)
    expect(isValidEnrollmentTransition('completed', 'cancelled')).toBe(false)
  })

  it('rejects same-status transitions', () => {
    expect(isValidEnrollmentTransition('pending', 'pending')).toBe(false)
  })

  it('rejects unknown status', () => {
    expect(isValidEnrollmentTransition('unknown', 'active')).toBe(false)
  })

  it('returns Bengali error for invalid transition', () => {
    const err = getEnrollmentTransitionError('pending', 'active')
    expect(err).toContain('pending')
    expect(err).toContain('active')
    expect(err).toContain('যাবে না')
  })

  it('returns null for valid transition', () => {
    expect(getEnrollmentTransitionError('pending', 'approved')).toBeNull()
  })

  it('returns null for same-status (no-op)', () => {
    expect(getEnrollmentTransitionError('active', 'active')).toBeNull()
  })
})

describe('Lifecycle Timestamps', () => {
  it('maps approved → approvedAt', () => {
    expect(getLifecycleTimestamp('approved')).toBe('approvedAt')
  })

  it('maps active → startedAt', () => {
    expect(getLifecycleTimestamp('active')).toBe('startedAt')
  })

  it('maps completed → completedAt', () => {
    expect(getLifecycleTimestamp('completed')).toBe('completedAt')
  })

  it('maps expired → expiresAt', () => {
    expect(getLifecycleTimestamp('expired')).toBe('expiresAt')
  })

  it('returns null for other statuses', () => {
    expect(getLifecycleTimestamp('pending')).toBeNull()
    expect(getLifecycleTimestamp('rejected')).toBeNull()
    expect(getLifecycleTimestamp('cancelled')).toBeNull()
  })
})

describe('Auto-Expire', () => {
  it('returns true for active enrollment past expires_at', () => {
    const pastDate = new Date('2024-01-01')
    expect(shouldAutoExpire('active', pastDate, new Date('2025-01-01'))).toBe(
      true,
    )
  })

  it('returns false for active enrollment before expires_at', () => {
    const futureDate = new Date('2030-01-01')
    expect(shouldAutoExpire('active', futureDate, new Date('2025-01-01'))).toBe(
      false,
    )
  })

  it('returns false for non-active enrollment', () => {
    expect(shouldAutoExpire('pending', new Date('2020-01-01'))).toBe(false)
  })

  it('returns false when expires_at is null', () => {
    expect(shouldAutoExpire('active', null)).toBe(false)
  })
})

describe('Grade Calculation', () => {
  it('returns A+ for 80%+', () => {
    const g = calculateGrade(80, 100)
    expect(g.grade).toBe('A+')
    expect(g.gpa).toBe(5.0)
  })

  it('returns A for 70-79%', () => {
    const g = calculateGrade(75, 100)
    expect(g.grade).toBe('A')
    expect(g.gpa).toBe(4.0)
  })

  it('returns B+ for 60-69%', () => {
    const g = calculateGrade(65, 100)
    expect(g.grade).toBe('B+')
    expect(g.gpa).toBe(3.5)
  })

  it('returns F for <33%', () => {
    const g = calculateGrade(30, 100)
    expect(g.grade).toBe('F')
    expect(g.gpa).toBe(0.0)
  })

  it('handles score/total ratio correctly', () => {
    const g = calculateGrade(40, 50) // 80%
    expect(g.grade).toBe('A+')
  })

  it('returns F for zero total', () => {
    const g = calculateGrade(0, 0)
    expect(g.grade).toBe('F')
  })
})

describe('Exam Scoring', () => {
  const questions = [
    { id: 'q1', correctIndex: 0 },
    { id: 'q2', correctIndex: 1 },
    { id: 'q3', correctIndex: 2 },
    { id: 'q4', correctIndex: 0 },
    { id: 'q5', correctIndex: 3 },
  ]

  it('calculates correct score without negative marking', () => {
    const answers = { q1: 0, q2: 1, q3: 0, q4: 2, q5: 3 }
    const result = calculateExamScore(answers, questions, false)
    expect(result.correct).toBe(3)
    expect(result.wrong).toBe(2)
    expect(result.skipped).toBe(0)
    expect(result.score).toBe(3)
    expect(result.total).toBe(5)
  })

  it('applies negative marking', () => {
    const answers = { q1: 0, q2: 1, q3: 0, q4: 2, q5: 3 }
    const result = calculateExamScore(answers, questions, true)
    expect(result.correct).toBe(3)
    expect(result.wrong).toBe(2)
    expect(result.score).toBe(2.5) // 3 - (2 * 0.25)
  })

  it('handles all skipped', () => {
    const result = calculateExamScore({}, questions, false)
    expect(result.correct).toBe(0)
    expect(result.wrong).toBe(0)
    expect(result.skipped).toBe(5)
    expect(result.score).toBe(0)
  })

  it('handles all correct', () => {
    const answers = { q1: 0, q2: 1, q3: 2, q4: 0, q5: 3 }
    const result = calculateExamScore(answers, questions, true)
    expect(result.score).toBe(5)
    expect(result.correct).toBe(5)
  })

  it('never goes below 0 with negative marking', () => {
    const answers = { q1: 3, q2: 3, q3: 3, q4: 3, q5: 0 }
    const result = calculateExamScore(answers, questions, true)
    expect(result.score).toBe(0) // 0 - 1.25 → clamped to 0
  })
})

describe('Payment Validation', () => {
  it('rejects zero amount', () => {
    const r = validatePaymentAmount(0, 1000)
    expect(r.ok).toBe(false)
    expect(r.error).toContain('শূন্যের বেশি')
  })

  it('rejects negative amount', () => {
    expect(validatePaymentAmount(-100, 1000).ok).toBe(false)
  })

  it('rejects overpayment', () => {
    const r = validatePaymentAmount(1500, 1000)
    expect(r.ok).toBe(false)
    expect(r.error).toContain('অতিক্রম')
  })

  it('accepts exact amount', () => {
    expect(validatePaymentAmount(1000, 1000).ok).toBe(true)
  })

  it('accepts partial payment', () => {
    expect(validatePaymentAmount(500, 1000).ok).toBe(true)
  })
})

describe('Payment Update Calculation', () => {
  it('calculates correct new amounts', () => {
    const r = calculatePaymentUpdate(1000, 2000, 1000, 2000, 500)
    expect(r.enrollmentPaid).toBe(1500)
    expect(r.enrollmentDue).toBe(1500)
    expect(r.invoicePaid).toBe(1500)
    expect(r.invoiceDue).toBe(1500)
    expect(r.invoiceStatus).toBe('partial')
  })

  it('marks invoice as paid when fully paid', () => {
    const r = calculatePaymentUpdate(1500, 500, 1500, 500, 500)
    expect(r.invoiceStatus).toBe('paid')
    expect(r.invoiceDue).toBe(0)
  })
})

describe('Shuffle Array', () => {
  it('returns same length', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(arr)
    expect(shuffled.length).toBe(5)
  })

  it('contains same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(arr)
    expect(shuffled.sort()).toEqual(arr.sort())
  })

  it('does not mutate original', () => {
    const arr = [1, 2, 3, 4, 5]
    const original = [...arr]
    shuffleArray(arr)
    expect(arr).toEqual(original)
  })
})

describe('Completion Percentage', () => {
  it('calculates weighted average', () => {
    const r = calculateCompletionPercentage({
      attendanceRate: 80,
      examAverage: 60,
      assignmentCompletion: 100,
    })
    // (80*30 + 60*50 + 100*20) / 100 = 2400+3000+2000 / 100 = 74
    expect(r).toBe(74)
  })

  it('returns 0 for all zeros', () => {
    expect(calculateCompletionPercentage({})).toBe(0)
  })

  it('clamps to 100', () => {
    const r = calculateCompletionPercentage({
      attendanceRate: 100,
      examAverage: 100,
      assignmentCompletion: 100,
    })
    expect(r).toBe(100)
  })
})
