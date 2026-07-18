'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Check,
  GraduationCap,
  Wallet,
  Loader2,
} from 'lucide-react'
import { EnrollmentStatusBadge } from '@/components/ui/badges'
import type { Course, Enrollment } from './types'

export function CourseSection({
  courses,
  enrollments,
  onRefresh,
}: {
  courses: Course[]
  enrollments: Enrollment[]
  onRefresh: () => void
}) {
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const enrolledCourseIds = enrollments.map((e) => e.courseId)

  async function handleEnroll(courseId: string) {
    setEnrolling(courseId)
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      if (res.ok) {
        setSuccess(courseId)
        onRefresh()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (error) {
      console.error('Enrollment failed:', error)
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <div className="space-y-6">
      {enrollments.length > 0 && (
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground mb-4">
            আমার কোর্সসমূহ
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-heading font-bold text-foreground">
                    {enrollment.courseTitle}
                  </h4>
                  <EnrollmentStatusBadge status={enrollment.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {enrollment.courseDuration}
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">মোট ফি:</span>
                    <span className="font-medium">
                      ৳{enrollment.totalFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">পরিশোধিত:</span>
                    <span className="font-medium text-green">
                      ৳{enrollment.paidAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">বকেয়:</span>
                    <span
                      className={`font-medium ${enrollment.dueAmount > 0 ? 'text-gold' : 'text-green'}`}
                    >
                      ৳{enrollment.dueAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
                {enrollment.dueAmount > 0 && (
                  <Link
                    href="/dashboard?tab=billing"
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/20"
                  >
                    <Wallet className="size-4" />
                    পেমেন্ট করুন
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-heading text-lg font-bold text-foreground mb-4">
          উপলব্ধ কোর্সসমূহ
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses
            .filter((c) => c.isActive)
            .map((course) => {
              const isEnrolled = enrolledCourseIds.includes(course.id)
              const isEnrolling = enrolling === course.id
              const justEnrolled = success === course.id

              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <h4 className="font-heading font-bold text-foreground">
                    {course.title}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {course.shortDescription || course.description}
                  </p>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">সময়কাল:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ফি:</span>
                      <span className="font-medium">
                        ৳{course.fee.toLocaleString()}
                      </span>
                    </div>
                    {course.discountFee && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ছাড়ের পর:
                        </span>
                        <span className="font-bold text-green">
                          ৳{course.discountFee.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  {isEnrolled ? (
                    <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green/10 px-3 py-2 text-sm font-medium text-green">
                      <CheckCircle2 className="size-4" />
                      এনরোলড
                    </div>
                  ) : justEnrolled ? (
                    <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green/10 px-3 py-2 text-sm font-medium text-green">
                      <Check className="size-4" />
                      সফলভাবে এনরোল হয়েছে!
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={isEnrolling}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50"
                    >
                      {isEnrolling ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <GraduationCap className="size-4" />
                          এনরোল হন
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
