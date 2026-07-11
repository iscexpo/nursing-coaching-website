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
  courseTitle: string | null
  courseDuration: string | null
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

export interface UserProfile {
  id: string
  name: string
  email: string | null
  phoneNumber: string | null
  role: string
  studentId: string | null
  address: string | null
  dateOfBirth: string | null
  guardianName: string | null
  guardianPhone: string | null
  institution: string | null
}

export interface MockResult {
  exam: string
  date: string
  score: number
  total: number
  rank: number
}

export interface MockAttendance {
  date: string
  status: 'present' | 'absent' | 'late'
  time: string
}
