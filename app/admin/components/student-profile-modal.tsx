'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Student } from './types'

interface StudentProfileModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
}

export function StudentProfileModal({
  student,
  isOpen,
  onClose,
}: StudentProfileModalProps) {
  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-secondary/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Student Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Basic Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{student.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium text-foreground">
                  {student.phoneNumber || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Student ID:</span>
                <span className="font-medium text-foreground">
                  {student.studentId || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {(student.address || student.district) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Contact Information
              </h3>
              <div className="space-y-2 text-sm">
                {student.address && (
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium text-foreground mt-1">{student.address}</p>
                  </div>
                )}
                {student.district && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">District:</span>
                    <span className="font-medium text-foreground">{student.district}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guardian Info */}
          {student.guardianName && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Guardian Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">
                    {student.guardianName}
                  </span>
                </div>
                {student.guardianPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-foreground">
                      {student.guardianPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education Info */}
          {student.institution && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Education
              </h3>
              <div className="text-sm">
                <span className="text-muted-foreground">Institution:</span>
                <p className="font-medium text-foreground mt-1">{student.institution}</p>
              </div>
            </div>
          )}

          {/* Account Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Account Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email Verified:</span>
                <span className="font-medium">
                  {student.emailVerified ? (
                    <span className="text-green-600 dark:text-green-400">✓ Yes</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">✗ No</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone Verified:</span>
                <span className="font-medium">
                  {student.phoneNumberVerified ? (
                    <span className="text-green-600 dark:text-green-400">✓ Yes</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">✗ No</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-secondary/20 px-6 py-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
