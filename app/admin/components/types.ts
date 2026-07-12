export interface Notice {
  id: string
  title: string
  content: string | null
  tag: string
  isUrgent: boolean
  isPublished: boolean
  authorId: string | null
  createdAt: string
}

export interface Exam {
  id: string
  title: string
  subject: string
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  isActive: boolean
  createdAt: string
  questionCount?: number
}

export interface Question {
  id: string
  examId: string
  question: string
  options: string[]
  correctIndex: number
  createdAt: string
}

export interface Result {
  id: number
  studentName: string
  studentId: string
  examId: number
  examTitle: string
  score: number
  total: number
  rank: number
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  shortDescription: string | null
  duration: string
  fee: number
  discountFee: number | null
  image: string | null
  features: string[] | null
  isActive: boolean
  maxStudents: number | null
  currentStudents: number
  schedule: string | null
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  status: string
  enrolledAt: string
  totalFee: number
  paidAmount: number
  dueAmount: number
  notes: string | null
  userName: string | null
  userPhone: string | null
  courseTitle: string | null
}

export interface Payment {
  id: string
  userId: string
  enrollmentId: string
  amount: number
  method: string
  transactionId: string | null
  senderNumber: string | null
  status: string
  notes: string | null
  verifiedBy: string | null
  verifiedAt: string | null
  paidAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  userId: string
  enrollmentId: string
  amount: number
  paidAmount: number
  dueAmount: number
  status: string
  dueDate: string | null
  description: string | null
  createdAt: string
}

export interface Student {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  phoneNumber: string | null
  phoneNumberVerified: boolean
  role: 'admin' | 'student'
  studentId: string | null
  address: string | null
  village: string | null
  post: string | null
  policeStation: string | null
  district: string | null
  dateOfBirth: string | null
  guardianName: string | null
  guardianPhone: string | null
  institution: string | null
  ssc: { result: string; institution: string; year: string } | null
  hsc: { result: string; institution: string; year: string } | null
  honors: { result: string; institution: string; year: string } | null
  createdAt: string
  updatedAt: string
}

export interface ExamSubmission {
  id: string
  userId: string
  examId: string
  score: number
  total: number
  answers: Record<number, number>
  timeTaken: number | null
  createdAt: string
  userName?: string | null
  userStudentId?: string | null
  examTitle?: string | null
}

export interface AttendanceRecord {
  id: string
  userId: string
  date: string
  status: 'present' | 'late' | 'absent'
  time: string | null
  markedBy: string | null
  createdAt: string
  userName?: string | null
  userStudentId?: string | null
}

export interface AdmitCard {
  id: string
  userId: string
  examId: string
  examName: string
  examDate: string
  examTime: string
  center: string
  seatNumber: string | null
  createdAt: string
  userName?: string | null
  userStudentId?: string | null
}

export interface Teacher {
  id: string
  name: string
  email: string | null
  phone: string | null
  designation: string | null
  subject: string | null
  bio: string | null
  image: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ContactInquiry {
  id: string
  name: string
  phone: string
  message: string
  isResolved: boolean
  resolvedAt: string | null
  resolvedBy: string | null
  response: string | null
  createdAt: string
}

export interface MediaFile {
  id: string
  filename: string
  originalFilename: string
  url: string
  contentType: string
  size: number
  altText: string | null
  description: string | null
  uploadedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface NotificationRecord {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'payment' | 'enrollment'
  isRead: boolean
  readAt: string | null
  link: string | null
  createdAt: string
}
