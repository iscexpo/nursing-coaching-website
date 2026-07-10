import { pgTable, text, timestamp, boolean, jsonb, integer, decimal } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  phoneNumber: text('phone_number').unique(),
  phoneNumberVerified: boolean('phone_number_verified').notNull().default(false),
  role: text('role').$type<'admin' | 'student'>().default('student').notNull(),
  studentId: text('student_id').unique(),
  address: text('address'),
  dateOfBirth: text('date_of_birth'),
  guardianName: text('guardian_name'),
  guardianPhone: text('guardian_phone'),
  institution: text('institution'),
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
})

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
})

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
})

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
})

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
  verifiedBy: text('verified_by'),
  verifiedAt: timestamp('verified_at'),
  paidAt: timestamp('paid_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

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
  link: text('link'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})