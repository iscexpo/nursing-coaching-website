import { pgTable, text, timestamp, boolean, jsonb, integer, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { defaultCmsContent, type CmsContent } from '@/lib/content-cms'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  phoneNumber: text('phone_number').unique(),
  phoneNumberVerified: boolean('phone_number_verified').notNull().default(false),
  role: text('role').$type<'super-admin' | 'admin' | 'teacher' | 'student'>().default('student').notNull(),
  studentId: text('student_id').unique(),
  address: text('address'),
  village: text('village'),
  post: text('post'),
  policeStation: text('police_station'),
  district: text('district'),
  dateOfBirth: text('date_of_birth'),
  guardianName: text('guardian_name'),
  guardianPhone: text('guardian_phone'),
  institution: text('institution'),
  ssc: jsonb('ssc').$type<{ result: string; institution: string; year: string }>(),
  hsc: jsonb('hsc').$type<{ result: string; institution: string; year: string }>(),
  honors: jsonb('honors').$type<{ result: string; institution: string; year: string }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('session_user_id_idx').on(table.userId),
])

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('account_user_id_idx').on(table.userId),
])

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const otp = pgTable('otp', {
  id: text('id').primaryKey(),
  phoneNumber: text('phone_number').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  attempts: jsonb('attempts').$type<{ count: number; lastAttempt: Date }>().default({ count: 0, lastAttempt: new Date() }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('otp_phone_number_idx').on(table.phoneNumber),
])

export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  shortDescription: text('short_description'),
  duration: text('duration').notNull(),
  fee: integer('fee').notNull(),
  discountFee: integer('discount_fee'),
  image: text('image'),
  features: jsonb('features').$type<string[]>().default([]),
  isActive: boolean('is_active').notNull().default(true),
  maxStudents: integer('max_students'),
  currentStudents: integer('current_students').notNull().default(0),
  schedule: text('schedule'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const teachers = pgTable('teachers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  designation: text('designation'),
  subject: text('subject'),
  bio: text('bio'),
  image: text('image'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('teachers_is_active_idx').on(table.isActive),
  index('teachers_subject_idx').on(table.subject),
])

export const enrollments = pgTable('enrollments', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  courseId: text('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  status: text('status').$type<'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled'>().default('pending').notNull(),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  totalFee: integer('total_fee').notNull(),
  paidAmount: integer('paid_amount').notNull().default(0),
  dueAmount: integer('due_amount').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('enrollments_user_id_idx').on(table.userId),
  index('enrollments_course_id_idx').on(table.courseId),
  index('enrollments_user_created_idx').on(table.userId, table.createdAt),
  uniqueIndex('enrollments_user_course_idx').on(table.userId, table.courseId),
])

export const studentLifecycleEvents = pgTable('student_lifecycle_events', {
  id: text('id').primaryKey(),
  studentId: text('student_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  enrollmentId: text('enrollment_id').references(() => enrollments.id, { onDelete: 'set null' }),
  eventType: text('event_type').notNull(),
  details: jsonb('details').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('student_lifecycle_events_student_id_idx').on(table.studentId),
  index('student_lifecycle_events_enrollment_id_idx').on(table.enrollmentId),
])

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  enrollmentId: text('enrollment_id')
    .notNull()
    .references(() => enrollments.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  method: text('method').$type<'bkash' | 'nagad' | 'cash' | 'bank'>().notNull(),
  transactionId: text('transaction_id'),
  senderNumber: text('sender_number'),
  status: text('status').$type<'pending' | 'verified' | 'rejected'>().default('pending').notNull(),
  notes: text('notes'),
  verifiedBy: text('verified_by').references(() => user.id, { onDelete: 'set null' }),
  verifiedAt: timestamp('verified_at'),
  paidAt: timestamp('paid_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('payments_user_id_idx').on(table.userId),
  index('payments_enrollment_id_idx').on(table.enrollmentId),
  index('payments_user_created_idx').on(table.userId, table.createdAt),
  index('payments_status_idx').on(table.status),
])

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').unique().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  enrollmentId: text('enrollment_id')
    .notNull()
    .references(() => enrollments.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  paidAmount: integer('paid_amount').notNull().default(0),
  dueAmount: integer('due_amount').notNull(),
  status: text('status').$type<'unpaid' | 'partial' | 'paid' | 'overdue'>().default('unpaid').notNull(),
  dueDate: timestamp('due_date'),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('invoices_user_id_idx').on(table.userId),
  index('invoices_enrollment_id_idx').on(table.enrollmentId),
  index('invoices_user_created_idx').on(table.userId, table.createdAt),
  index('invoices_status_idx').on(table.status),
])

export const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  siteName: text('site_name').notNull().default('কর্ণিয়া নার্সিং কোচিং'),
  siteTagline: text('site_tagline').notNull().default('সাফল্যের জন্য প্রস্তুতি'),
  smsProvider: text('sms_provider').notNull().default('none'),
  smsApiKey: text('sms_api_key').default(''),
  smsSenderId: text('sms_sender_id').default(''),
  paymentGateway: text('payment_gateway').notNull().default('none'),
  paymentGatewayApiKey: text('payment_gateway_api_key').default(''),
  paymentGatewaySecret: text('payment_gateway_secret').default(''),
  paymentGatewayWebhookSecret: text('payment_gateway_webhook_secret').default(''),
  cmsContent: jsonb('cms_content').$type<CmsContent>().default(defaultCmsContent),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').$type<'info' | 'success' | 'warning' | 'payment' | 'enrollment'>().default('info').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  link: text('link'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('notifications_user_id_idx').on(table.userId),
  index('notifications_user_created_idx').on(table.userId, table.createdAt),
  index('notifications_user_read_idx').on(table.userId, table.isRead),
])

export const notices = pgTable('notices', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  tag: text('tag').notNull(),
  isUrgent: boolean('is_urgent').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(true),
  authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('notices_created_idx').on(table.createdAt),
])

export const exams = pgTable('exams', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  duration: integer('duration').notNull().default(15),
  difficulty: text('difficulty').$type<'easy' | 'medium' | 'hard'>().default('medium').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('exams_subject_idx').on(table.subject),
  index('exams_is_active_idx').on(table.isActive),
])

export const questions = pgTable('questions', {
  id: text('id').primaryKey(),
  examId: text('exam_id')
    .notNull()
    .references(() => exams.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  options: jsonb('options').$type<string[]>().notNull(),
  correctIndex: integer('correct_index').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('questions_exam_id_idx').on(table.examId),
])

export const examSubmissions = pgTable('exam_submissions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  examId: text('exam_id')
    .notNull()
    .references(() => exams.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  total: integer('total').notNull(),
  answers: jsonb('answers').$type<Record<string, number>>().notNull(),
  timeTaken: integer('time_taken'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('exam_submissions_user_id_idx').on(table.userId),
  index('exam_submissions_exam_id_idx').on(table.examId),
  index('exam_submissions_user_exam_idx').on(table.userId, table.examId),
])

export const contactInquiries = pgTable('contact_inquiries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  message: text('message').notNull(),
  isResolved: boolean('is_resolved').notNull().default(false),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: text('resolved_by').references(() => user.id, { onDelete: 'set null' }),
  response: text('response'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('contact_inquiries_created_idx').on(table.createdAt),
])

export const admissions = pgTable('admissions', {
  id: text('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  courseId: text('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  message: text('message'),
  status: text('status').$type<'pending' | 'received' | 'processing' | 'approved' | 'rejected'>().notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('admissions_phone_idx').on(table.phone),
  index('admissions_course_id_idx').on(table.courseId),
  index('admissions_created_idx').on(table.createdAt),
])

export const mediaFiles = pgTable('media_files', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  url: text('url').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  altText: text('alt_text'),
  description: text('description'),
  uploadedBy: text('uploaded_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('media_files_uploaded_by_idx').on(table.uploadedBy),
  index('media_files_created_idx').on(table.createdAt),
])

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
  actorEmail: text('actor_email'),
  actorRole: text('actor_role'),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  action: text('action').notNull(),
  details: jsonb('details').$type<Record<string, unknown>>().notNull().default({}),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const attendance = pgTable('attendance', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  status: text('status').$type<'present' | 'late' | 'absent'>().notNull(),
  time: text('time'),
  markedBy: text('marked_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('attendance_user_id_idx').on(table.userId),
  index('attendance_date_idx').on(table.date),
  index('attendance_user_date_idx').on(table.userId, table.date),
  uniqueIndex('attendance_user_date_unique').on(table.userId, table.date),
])

export const admitCards = pgTable('admit_cards', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  examId: text('exam_id')
    .notNull()
    .references(() => exams.id, { onDelete: 'cascade' }),
  examName: text('exam_name').notNull(),
  examDate: text('exam_date').notNull(),
  examTime: text('exam_time').notNull(),
  center: text('center').notNull(),
  seatNumber: text('seat_number'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('admit_cards_user_id_idx').on(table.userId),
  index('admit_cards_exam_id_idx').on(table.examId),
  uniqueIndex('admit_cards_user_exam_unique').on(table.userId, table.examId),
])