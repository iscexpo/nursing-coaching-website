import { db } from './db'
import { auditLogs, studentLifecycleEvents } from './db/schema'
import type { Session } from './permissions'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'verify'
  | 'reject'
  | 'settings.update'
  | 'student.create'
  | 'student.update'
  | 'student.delete'
  | 'payment.verify'
  | 'payment.delete'
  | 'admission.submit'
  | 'contact.submit'
  | string

export interface AuditEntry {
  actorId?: string
  actorEmail?: string
  actorRole?: string
  resourceType: string
  resourceId?: string
  action: AuditAction
  details?: Record<string, unknown>
  ipAddress?: string
}

export interface LifecycleEntry {
  studentId: string
  enrollmentId?: string
  eventType: string
  details?: Record<string, unknown>
}

export async function writeAudit(entry: AuditEntry) {
  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    actorId: entry.actorId ?? null,
    actorEmail: entry.actorEmail ?? null,
    actorRole: entry.actorRole ?? null,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId ?? null,
    action: entry.action,
    details: entry.details ?? {},
    ipAddress: entry.ipAddress ?? null,
  })
}

export async function writeLifecycleEvent(entry: LifecycleEntry) {
  await db.insert(studentLifecycleEvents).values({
    id: crypto.randomUUID(),
    studentId: entry.studentId,
    enrollmentId: entry.enrollmentId ?? null,
    eventType: entry.eventType,
    details: entry.details ?? {},
  })
}

export function buildAuditEntry(
  partial: Omit<AuditEntry, 'actorId' | 'actorEmail' | 'actorRole' | 'ipAddress'>,
  session?: Session | null,
  ipAddress?: string
): AuditEntry {
  return {
    ...partial,
    actorId: session?.user?.id,
    actorEmail: session?.user?.email ?? undefined,
    actorRole: session?.user?.role ?? undefined,
    ipAddress,
  }
}
