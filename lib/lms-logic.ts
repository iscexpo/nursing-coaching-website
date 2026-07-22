/**
 * LMS Core Logic — Enrollment lifecycle, payment validation, exam scoring & grading
 *
 * This module is pure logic with no DB calls. It takes data in, returns results.
 * API routes call these functions and handle the DB side.
 */

// ─── Enrollment Status Transitions ───────────────────────────────────────────

type EnrollmentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'suspended'

/**
 * Valid status transitions for enrollments.
 * From → To: only these transitions are allowed.
 */
const ENROLLMENT_TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['active', 'cancelled', 'rejected'],
  rejected: ['pending'],
  active: ['completed', 'cancelled', 'suspended', 'expired'],
  completed: [],
  cancelled: ['pending'],
  expired: ['pending'],
  suspended: ['active', 'cancelled'],
}

export function isValidEnrollmentTransition(from: string, to: string): boolean {
  const allowed = ENROLLMENT_TRANSITIONS[from as EnrollmentStatus]
  if (!allowed) return false
  return allowed.includes(to as EnrollmentStatus)
}

export function getEnrollmentTransitionError(
  from: string,
  to: string,
): string | null {
  if (from === to) return null
  if (isValidEnrollmentTransition(from, to)) return null
  return `স্ট্যাটাস "${from}" থেকে "${to}" এ পরিবর্তন করা যাবে না`
}

/**
 * Get the timestamp column name for a given status transition.
 * Used to auto-set lifecycle timestamps when status changes.
 */
export function getLifecycleTimestamp(status: string): string | null {
  switch (status) {
    case 'approved':
      return 'approvedAt'
    case 'active':
      return 'startedAt'
    case 'completed':
      return 'completedAt'
    case 'expired':
      return 'expiresAt'
    default:
      return null
  }
}

/**
 * Check if an enrollment should be auto-expired.
 * Returns true if the enrollment is active and past its expires_at date.
 */
export function shouldAutoExpire(
  status: string,
  expiresAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (status !== 'active') return false
  if (!expiresAt) return false
  return now > expiresAt
}

// ─── Payment Validation ──────────────────────────────────────────────────────

export interface PaymentValidation {
  ok: boolean
  error?: string
}

/**
 * Validate a payment amount against the enrollment's due amount.
 */
export function validatePaymentAmount(
  amount: number,
  dueAmount: number,
): PaymentValidation {
  if (amount <= 0) {
    return { ok: false, error: 'পরিশোধের পরিমাণ শূন্যের বেশি হতে হবে' }
  }
  if (amount > dueAmount) {
    return {
      ok: false,
      error: `পরিশোধের পরিমাণ (${amount}) বকেয় (${dueAmount}) অতিক্রম করেছে`,
    }
  }
  return { ok: true }
}

/**
 * Calculate updated enrollment and invoice amounts after a verified payment.
 */
export function calculatePaymentUpdate(
  enrollmentPaid: number,
  enrollmentDue: number,
  invoicePaid: number,
  invoiceDue: number,
  paymentAmount: number,
) {
  const newEnrollmentPaid = enrollmentPaid + paymentAmount
  const newEnrollmentDue = Math.max(0, enrollmentDue - paymentAmount)
  const newInvoicePaid = invoicePaid + paymentAmount
  const newInvoiceDue = Math.max(0, invoiceDue - paymentAmount)

  return {
    enrollmentPaid: newEnrollmentPaid,
    enrollmentDue: newEnrollmentDue,
    invoicePaid: newInvoicePaid,
    invoiceDue: newInvoiceDue,
    invoiceStatus: newInvoiceDue <= 0 ? 'paid' : 'partial',
  }
}

// ─── Exam Scoring & Grading ─────────────────────────────────────────────────

/**
 * Grade boundaries for Bangladeshi education system.
 * Score is a percentage (0–100).
 */
export interface GradeResult {
  grade: string
  gpa: number
  label: string
  labelBn: string
}

const GRADE_TABLE: Array<{
  min: number
  max: number
  grade: string
  gpa: number
  label: string
  labelBn: string
}> = [
  {
    min: 80,
    max: 100,
    grade: 'A+',
    gpa: 5.0,
    label: 'A+ (Outstanding)',
    labelBn: 'A+ (অসাধারণ)',
  },
  {
    min: 70,
    max: 79,
    grade: 'A',
    gpa: 4.0,
    label: 'A (Excellent)',
    labelBn: 'A (সুন্দর)',
  },
  {
    min: 60,
    max: 69,
    grade: 'B+',
    gpa: 3.5,
    label: 'B+ (Very Good)',
    labelBn: 'B+ (খুব ভালো)',
  },
  {
    min: 50,
    max: 59,
    grade: 'B',
    gpa: 3.0,
    label: 'B (Good)',
    labelBn: 'B (ভালো)',
  },
  {
    min: 40,
    max: 49,
    grade: 'C+',
    gpa: 2.5,
    label: 'C+ (Above Average)',
    labelBn: 'C+ (গড়ের উপরে)',
  },
  {
    min: 33,
    max: 39,
    grade: 'C',
    gpa: 2.0,
    label: 'C (Average)',
    labelBn: 'C (গড়)',
  },
  {
    min: 0,
    max: 32,
    grade: 'F',
    gpa: 0.0,
    label: 'F (Fail)',
    labelBn: 'F (ব্যর্থ)',
  },
]

export function calculateGrade(score: number, total: number): GradeResult {
  if (total <= 0) return { grade: 'F', gpa: 0, label: 'N/A', labelBn: 'N/A' }
  const pct = Math.round((score / total) * 100)
  for (const row of GRADE_TABLE) {
    if (pct >= row.min && pct <= row.max) {
      return {
        grade: row.grade,
        gpa: row.gpa,
        label: row.label,
        labelBn: row.labelBn,
      }
    }
  }
  return { grade: 'F', gpa: 0, label: 'F (Fail)', labelBn: 'F (ব্যর্থ)' }
}

/**
 * Calculate exam score with optional negative marking.
 * @param answers - { questionId: selectedIndex }
 * @param questions - { id, correctIndex }
 * @param negativeMarking - if true, wrong answers deduct 0.25 marks
 */
export function calculateExamScore(
  answers: Record<string, number>,
  questions: Array<{ id: string; correctIndex: number }>,
  negativeMarking: boolean = false,
): {
  score: number
  correct: number
  wrong: number
  skipped: number
  total: number
} {
  let correct = 0
  let wrong = 0
  let skipped = 0

  for (const q of questions) {
    const userAnswer = answers[q.id]
    if (userAnswer === undefined || userAnswer === null) {
      skipped++
    } else if (userAnswer === q.correctIndex) {
      correct++
    } else {
      wrong++
    }
  }

  const total = questions.length
  const rawScore = correct
  const penalty = negativeMarking ? wrong * 0.25 : 0
  const score = Math.max(0, rawScore - penalty)

  return { score, correct, wrong, skipped, total }
}

/**
 * Fisher-Yates shuffle (cryptographically safe for exam use).
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Shuffle question options while tracking the new correct index.
 */
export function shuffleOptions(
  options: string[],
  correctIndex: number,
): { shuffledOptions: string[]; newCorrectIndex: number } {
  const indices = options.map((_, i) => i)
  const shuffledIndices = shuffleArray(indices)
  const shuffledOptions = shuffledIndices.map((i) => options[i])
  const newCorrectIndex = shuffledIndices.indexOf(correctIndex)
  return { shuffledOptions, newCorrectIndex }
}

// ─── Enrollment Lifecycle Utilities ──────────────────────────────────────────

/**
 * Determine the auto-expiry duration for an enrollment based on course duration.
 * Default: 365 days from approval.
 */
export function calculateExpiryDate(
  approvedAt: Date,
  courseDurationMonths?: number,
): Date {
  const months = courseDurationMonths || 12
  const expiry = new Date(approvedAt)
  expiry.setMonth(expiry.getMonth() + months)
  return expiry
}

/**
 * Calculate completion percentage based on attendance and exam scores.
 * Returns 0–100.
 */
export function calculateCompletionPercentage(params: {
  attendanceRate?: number // 0–100
  examAverage?: number // 0–100
  assignmentCompletion?: number // 0–100
  weights?: { attendance: number; exam: number; assignment: number }
}): number {
  const {
    attendanceRate = 0,
    examAverage = 0,
    assignmentCompletion = 0,
    weights = { attendance: 30, exam: 50, assignment: 20 },
  } = params

  const totalWeight = weights.attendance + weights.exam + weights.assignment
  if (totalWeight === 0) return 0

  const weighted =
    (attendanceRate * weights.attendance +
      examAverage * weights.exam +
      assignmentCompletion * weights.assignment) /
    totalWeight

  return Math.round(Math.min(100, Math.max(0, weighted)))
}
