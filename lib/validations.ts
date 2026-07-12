import { z } from 'zod/v3'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createCourseSchema = z.object({
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  duration: z.string().min(1).max(100),
  fee: z.number().int().positive(),
  discountFee: z.number().int().positive().optional(),
  image: z.string().url().optional(),
  features: z.array(z.string()).optional(),
  maxStudents: z.number().int().positive().optional(),
  schedule: z.string().max(500).optional(),
})

export const updateCourseSchema = createCourseSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const createEnrollmentSchema = z.object({
  courseId: z.string().uuid(),
  notes: z.string().max(1000).optional(),
})

export const updateEnrollmentSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled']).optional(),
  notes: z.string().max(1000).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const createPaymentSchema = z.object({
  enrollmentId: z.string().uuid(),
  amount: z.number().int().positive(),
  method: z.enum(['bkash', 'nagad', 'cash', 'bank']),
  transactionId: z.string().max(200).optional(),
  senderNumber: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
})

export const verifyPaymentSchema = z.object({
  status: z.enum(['verified', 'rejected']),
})

export const createInvoiceSchema = z.object({
  userId: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  amount: z.number().int().positive(),
  dueDate: z.coerce.date().optional(),
  description: z.string().max(500).optional(),
})

export const createNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  type: z.enum(['info', 'success', 'warning', 'payment', 'enrollment']).optional(),
  link: z.string().url().optional(),
  targetUserId: z.string().uuid().optional(),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  dateOfBirth: z.string().max(20).optional(),
  guardianName: z.string().max(200).optional(),
  guardianPhone: z.string().max(20).optional(),
  institution: z.string().max(200).optional(),
})

export const createNoticeSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(5000).optional(),
  tag: z.string().min(1).max(50),
  isUrgent: z.boolean().optional(),
  isPublished: z.boolean().optional(),
})

export const updateNoticeSchema = createNoticeSchema.partial()

export const createExamSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(100),
  duration: z.number().int().min(1).max(120).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  isActive: z.boolean().optional(),
})

export const updateExamSchema = createExamSchema.partial()

export const createQuestionSchema = z.object({
  examId: z.string().uuid(),
  question: z.string().min(1).max(2000),
  options: z.array(z.string().min(1).max(500)).length(4),
  correctIndex: z.number().int().min(0).max(3),
})

export const submitExamSchema = z.object({
  examId: z.string().uuid(),
  answers: z.record(z.coerce.number().int().min(0).max(3)),
  timeTaken: z.number().int().min(0).optional(),
})

export const createAdmissionSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(10).max(20),
  courseSlug: z.string().min(1).max(200),
  message: z.string().max(2000).optional(),
})

export const createContactInquirySchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(10).max(20),
  message: z.string().min(1).max(5000),
})

export const updateContactInquirySchema = z.object({
  isResolved: z.boolean().optional(),
  response: z.string().max(5000).optional(),
})

export const createAttendanceSchema = z.object({
  userId: z.string().uuid(),
  date: z.coerce.date(),
  status: z.enum(['present', 'late', 'absent']),
  time: z.string().max(50).optional(),
})

export const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'late', 'absent']).optional(),
  time: z.string().max(50).optional(),
})

export const createAdmitCardSchema = z.object({
  userId: z.string().uuid(),
  examId: z.string().uuid(),
  examName: z.string().min(1).max(200),
  examDate: z.string().min(1).max(100),
  examTime: z.string().min(1).max(100),
  center: z.string().min(1).max(200),
  seatNumber: z.string().max(50).optional(),
})

export const updateAdmitCardSchema = z.object({
  examName: z.string().min(1).max(200).optional(),
  examDate: z.string().min(1).max(100).optional(),
  examTime: z.string().min(1).max(100).optional(),
  center: z.string().min(1).max(200).optional(),
  seatNumber: z.string().max(50).optional(),
})
