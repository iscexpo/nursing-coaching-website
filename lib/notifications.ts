import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'

/**
 * Insert an in-app notification for a user.
 * Non-blocking — caller should `void notify(...)` to fire-and-forget.
 */
export async function notify(params: {
  userId: string
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'payment' | 'enrollment'
  link?: string
}): Promise<void> {
  try {
    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type ?? 'info',
      link: params.link,
    })
  } catch {
    // Notifications are best-effort — swallow errors silently
  }
}

/**
 * Notify the student when their enrollment status changes.
 */
export function notifyEnrollmentStatusChange(params: {
  userId: string
  enrollmentId: string
  previousStatus: string
  newStatus: string
  courseName?: string
}): void {
  const courseSuffix = params.courseName ? ` (${params.courseName})` : ''
  const messages: Record<string, string> = {
    approved: `আপনার এনরোলমেন্ট${courseSuffix} অনুমোদিত হয়েছে।`,
    rejected: `আপনার এনরোলমেন্ট${courseSuffix} প্রত্যাখ্যাত হয়েছে।`,
    active: `আপনার এনরোলমেন্ট${courseSuffix} সক্রিয় হয়েছে।`,
    completed: `আপনার এনরোলমেন্ট${courseSuffix} সম্পন্ন হয়েছে।`,
    cancelled: `আপনার এনরোলমেন্ট${courseSuffix} বাতিল করা হয়েছে।`,
    suspended: `আপনার এনরোলমেন্ট${courseSuffix} সাময়িক বন্ধ করা হয়েছে।`,
    expired: `আপনার এনরোলমেন্ট${courseSuffix} মেয়াদোত্তীর্ণ হয়েছে।`,
  }

  const message = messages[params.newStatus]
  if (!message) return

  const typeMap: Record<string, 'info' | 'success' | 'warning' | 'enrollment'> =
    {
      approved: 'success',
      active: 'success',
      completed: 'success',
      rejected: 'warning',
      cancelled: 'warning',
      suspended: 'warning',
      expired: 'warning',
    }

  void notify({
    userId: params.userId,
    title: 'এনরোলমেন্ট আপডেট',
    message,
    type: typeMap[params.newStatus] ?? 'enrollment',
    link: `/dashboard/enrollments`,
  })
}

/**
 * Notify the student when a payment is verified or rejected.
 */
export function notifyPaymentUpdate(params: {
  userId: string
  amount: number
  method: string
  status: 'verified' | 'rejected'
  enrollmentCourseName?: string
}): void {
  const methodLabels: Record<string, string> = {
    bkash: 'bKash',
    nagad: 'Nagad',
    cash: 'নগদ',
    bank: 'ব্যাংক',
  }
  const methodLabel = methodLabels[params.method] || params.method
  const courseSuffix = params.enrollmentCourseName
    ? ` — ${params.enrollmentCourseName}`
    : ''

  if (params.status === 'verified') {
    void notify({
      userId: params.userId,
      title: 'পেমেন্ট যাচাইকৃত',
      message: `৳${params.amount.toLocaleString()} ${methodLabel} পেমেন্ট${courseSuffix} যাচাই করা হয়েছে।`,
      type: 'payment',
      link: `/dashboard/billing`,
    })
  } else {
    void notify({
      userId: params.userId,
      title: 'পেমেন্ট প্রত্যাখ্যাত',
      message: `৳${params.amount.toLocaleString()} ${methodLabel} পেমেন্ট${courseSuffix} প্রত্যাখ্যাত হয়েছে।`,
      type: 'warning',
      link: `/dashboard/billing`,
    })
  }
}
