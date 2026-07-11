export interface Notice {
  id: number
  tag: string
  title: string
  date: string
  urgent: boolean
}

export interface Exam {
  id: number
  title: string
  date: string
  time: string
  duration: string
  totalMarks: number
  status: 'upcoming' | 'ongoing' | 'completed'
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
  phone: string
  course: string
  enrolled: string
  status: 'active' | 'inactive'
}
