import { z } from 'zod/v3'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'বিষয়ের নাম আবশ্যক').max(100),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

export const updateSubjectSchema = createSubjectSchema.partial()

export const createCourseSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  courseCode: z.string().max(50).optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  duration: z.string().min(1).max(100),
  fee: z.number().int().positive(),
  discountFee: z.number().int().positive().optional(),
  image: z.string().url().optional(),
  features: z.array(z.string()).optional(),
  category: z.enum(['icon', 'cornea']).optional(),
  maxStudents: z.number().int().positive().optional(),
  schedule: z.string().max(500).optional(),
})

export const updateCourseSchema = createCourseSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const createEnrollmentSchema = z
  .object({
    courseId: z.string().uuid().optional(),
    courseIds: z.array(z.string().uuid()).optional(),
    userId: z.string().min(1).optional(),
    notes: z.string().max(1000).optional(),
    discount: z.number().int().min(0).optional(),
  })
  .refine((d) => d.courseId || (d.courseIds && d.courseIds.length > 0), {
    message: 'একটি বা একাধিক কোর্স নির্বাচন করুন',
  })

export const updateEnrollmentSchema = z.object({
  status: z
    .enum([
      'pending',
      'approved',
      'rejected',
      'active',
      'completed',
      'cancelled',
    ])
    .optional(),
  notes: z.string().max(1000).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  discount: z.number().int().min(0).optional(),
  totalFee: z.number().int().min(0).optional(),
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

export const createTeacherSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200).optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  designation: z.string().max(200).optional(),
  subject: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  image: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
})

export const updateTeacherSchema = createTeacherSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const createInvoiceSchema = z.object({
  userId: z.string().min(1),
  enrollmentId: z.string().uuid(),
  amount: z.number().int().positive(),
  dueDate: z.coerce.date().optional(),
  description: z.string().max(500).optional(),
})

export const createNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  type: z
    .enum(['info', 'success', 'warning', 'payment', 'enrollment'])
    .optional(),
  link: z.string().url().optional(),
  targetUserId: z.string().min(1).optional(),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  dateOfBirth: z.string().max(20).optional(),
  guardianName: z.string().max(200).optional(),
  guardianPhone: z.string().max(20).optional(),
  institution: z.string().max(200).optional(),
  ssc: z
    .object({
      result: z.string().max(100),
      institution: z.string().max(200),
      year: z.string().max(10),
      roll: z.string().max(50),
      registrationNo: z.string().max(50),
      board: z.string().max(100),
      photoUrl: z.string().max(500),
    })
    .nullable()
    .optional(),
  hsc: z
    .object({
      result: z.string().max(100).optional(),
      institution: z.string().max(200).optional(),
      year: z.string().max(10).optional(),
      roll: z.string().max(50).optional(),
      registrationNo: z.string().max(50).optional(),
      board: z.string().max(100).optional(),
      photoUrl: z.string().max(500).optional(),
    })
    .nullable()
    .optional(),
  honors: z
    .object({
      result: z.string().max(100).optional(),
      institution: z.string().max(200).optional(),
      year: z.string().max(10).optional(),
      roll: z.string().max(50).optional(),
      registrationNo: z.string().max(50).optional(),
      board: z.string().max(100).optional(),
      photoUrl: z.string().max(500).optional(),
    })
    .nullable()
    .optional(),
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
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
  timeTaken: z.number().int().min(0).optional(),
})

const educationFieldSchema = z
  .object({
    result: z.string().max(100).optional().default(''),
    institution: z.string().max(300).optional().default(''),
    year: z.string().max(10).optional().default(''),
    roll: z.string().max(50).optional().default(''),
    registrationNo: z.string().max(50).optional().default(''),
    board: z.string().max(100).optional().default(''),
  })
  .optional()

export const createAdmissionSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z
    .string()
    .regex(/^(\+?880|0)[0-9]{10}$/, 'Invalid Bangladeshi phone number'),
  courseSlug: z.string().min(1).max(200),
  message: z.string().max(2000).optional(),
  ssc: educationFieldSchema,
  hsc: educationFieldSchema,
  honors: educationFieldSchema,
})

export const admissionStatusEnum = z.enum([
  'pending',
  'received',
  'processing',
  'approved',
  'rejected',
])

export const updateAdmissionSchema = z.object({
  status: admissionStatusEnum,
})

export const createModelTestApplicantSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z
    .string()
    .regex(/^(\+?880|0)[0-9]{10}$/, 'Invalid Bangladeshi phone number'),
  examId: z.string().uuid().optional(),
  preferredSubject: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
})

export const modelTestApplicantStatusEnum = z.enum([
  'pending',
  'contacted',
  'registered',
  'rejected',
])

export const updateModelTestApplicantSchema = z.object({
  status: modelTestApplicantStatusEnum,
})

export const createContactInquirySchema = z.object({
  name: z.string().min(1).max(200),
  phone: z
    .string()
    .regex(/^(\+?880|0)[0-9]{10}$/, 'Invalid Bangladeshi phone number'),
  message: z.string().min(1).max(5000),
})

export const updateContactInquirySchema = z.object({
  isResolved: z.boolean().optional(),
  response: z.string().max(5000).optional(),
})

export const createAttendanceSchema = z.object({
  userId: z.string().min(1),
  date: z.coerce.date(),
  status: z.enum(['present', 'late', 'absent']),
  time: z.string().max(50).optional(),
})

export const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'late', 'absent']).optional(),
  time: z.string().max(50).optional(),
})

export const createAdmitCardSchema = z.object({
  userId: z.string().min(1),
  examId: z.string().uuid(),
  examName: z.string().min(1).max(200),
  examDate: z.string().min(1).max(100),
  examTime: z.string().min(1).max(100),
  center: z.string().min(1).max(200),
  seatNumber: z.string().max(50).optional(),
})

export const updateAdmitCardSchema = z.object({
  examName: z.string().min(1, 'পরীক্ষার নাম আবশ্যক').max(200).optional(),
  examDate: z.string().min(1, 'তারিখ আবশ্যক').max(100).optional(),
  examTime: z.string().min(1, 'সময় আবশ্যক').max(100).optional(),
  center: z.string().min(1, 'কেন্দ্র আবশ্যক').max(200).optional(),
  seatNumber: z.string().max(50).optional(),
})

export const createStudentSchema = z.object({
  name: z.string().min(1, 'নাম আবশ্যক').max(200),
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর'),
  phoneNumber: z.string().max(20).optional(),
  studentId: z.string().max(50).optional(),
  image: z.string().url().optional(),
  address: z.string().max(500).optional(),
  village: z.string().max(200).optional(),
  post: z.string().max(200).optional(),
  policeStation: z.string().max(200).optional(),
  district: z.string().max(200).optional(),
  dateOfBirth: z.string().max(20).optional(),
  guardianName: z.string().max(200).optional(),
  guardianPhone: z.string().max(20).optional(),
  institution: z.string().max(200).optional(),
  ssc: z
    .object({
      result: z.string().max(100),
      institution: z.string().max(200),
      year: z.string().max(10),
      roll: z.string().max(50),
      registrationNo: z.string().max(50),
      board: z.string().max(100),
      photoUrl: z.string().max(500),
    })
    .optional(),
  hsc: z
    .object({
      result: z.string().max(100).optional(),
      institution: z.string().max(200).optional(),
      year: z.string().max(10).optional(),
      roll: z.string().max(50).optional(),
      registrationNo: z.string().max(50).optional(),
      board: z.string().max(100).optional(),
      photoUrl: z.string().max(500).optional(),
    })
    .optional(),
  honors: z
    .object({
      result: z.string().max(100).optional(),
      institution: z.string().max(200).optional(),
      year: z.string().max(10).optional(),
      roll: z.string().max(50).optional(),
      registrationNo: z.string().max(50).optional(),
      board: z.string().max(100).optional(),
      photoUrl: z.string().max(500).optional(),
    })
    .optional(),
})

export const updateStudentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phoneNumber: z.string().max(20).optional(),
  studentId: z.string().max(50).optional(),
  image: z.string().url().nullable().optional(),
  address: z.string().max(500).optional(),
  village: z.string().max(200).optional(),
  post: z.string().max(200).optional(),
  policeStation: z.string().max(200).optional(),
  district: z.string().max(200).optional(),
  dateOfBirth: z.string().max(20).optional(),
  guardianName: z.string().max(200).optional(),
  guardianPhone: z.string().max(20).optional(),
  institution: z.string().max(200).optional(),
  ssc: z
    .object({
      result: z.string().max(100),
      institution: z.string().max(200),
      year: z.string().max(10),
      roll: z.string().max(50),
      registrationNo: z.string().max(50),
      board: z.string().max(100),
      photoUrl: z.string().max(500),
    })
    .nullable()
    .optional(),
  hsc: z
    .object({
      result: z.string().max(100).optional(),
      institution: z.string().max(200).optional(),
      year: z.string().max(10).optional(),
      roll: z.string().max(50).optional(),
      registrationNo: z.string().max(50).optional(),
      board: z.string().max(100).optional(),
      photoUrl: z.string().max(500).optional(),
    })
    .nullable()
    .optional(),
  honors: z
    .object({
      result: z.string().max(100).optional(),
      institution: z.string().max(200).optional(),
      year: z.string().max(10).optional(),
      roll: z.string().max(50).optional(),
      registrationNo: z.string().max(50).optional(),
      board: z.string().max(100).optional(),
      photoUrl: z.string().max(500).optional(),
    })
    .nullable()
    .optional(),
  role: z.enum(['super-admin', 'admin', 'student']).optional(),
})

export const settingsSchema = z.object({
  siteName: z.string().min(1).max(200).optional(),
  siteTagline: z.string().max(500).optional(),
  smsProvider: z
    .enum(['none', 'grameenphone', 'sasbulksms', 'shiram', 'twilio'])
    .optional(),
  smsApiKey: z.string().max(500).optional(),
  smsSenderId: z.string().max(100).optional(),
  smsEmail: z.string().max(200).optional(),
  smsPassword: z.string().max(500).optional(),
  paymentGateway: z.enum(['none', 'sslcommerz', 'stripe']).optional(),
  paymentGatewayApiKey: z.string().max(500).optional(),
  paymentGatewaySecret: z.string().max(500).optional(),
  paymentGatewayWebhookSecret: z.string().max(500).optional(),
  cmsContent: z
    .object({
      site: z
        .object({
          nameBn: z.string().optional(),
          nameEn: z.string().optional(),
          tagline: z.string().optional(),
          logo: z.string().optional(),
          city: z.string().optional(),
          phone: z.string().optional(),
          phoneHref: z.string().optional(),
          whatsapp: z.string().optional(),
          messenger: z.string().optional(),
          email: z.string().optional(),
          facebook: z.string().optional(),
          youtube: z.string().optional(),
          addressBn: z.string().optional(),
        })
        .partial()
        .optional(),
      hero: z
        .object({
          eyebrow: z.string().optional(),
          title: z.string().optional(),
          subtitle: z.string().optional(),
          primaryCta: z.string().optional(),
          secondaryCta: z.string().optional(),
        })
        .partial()
        .optional(),
      whyCornia: z
        .array(z.object({ title: z.string(), description: z.string() }))
        .optional(),
      counters: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .optional(),
      faqs: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .optional(),
    })
    .optional(),
})
