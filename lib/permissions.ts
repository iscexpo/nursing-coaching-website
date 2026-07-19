import { auth } from './auth'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export type Session = typeof auth.$Infer.Session

export async function getSession() {
  return await auth.api.getSession({ headers: await headers() })
}

export type Role = 'super-admin' | 'admin' | 'teacher' | 'student'

/** Returns true for both `admin` and `super-admin` roles. */
export function isAdmin(role: string | undefined | null): boolean {
  return role === 'admin' || role === 'super-admin'
}

/** Returns true only for the `super-admin` role. */
export function isSuperAdmin(role: string | undefined | null): boolean {
  return role === 'super-admin'
}

export type Permission =
  | 'admin.access'
  | 'settings.view'
  | 'settings.manage'
  | 'course.manage'
  | 'student.view'
  | 'student.manage'
  | 'student.export'
  | 'payment.view'
  | 'payment.verify'
  | 'payment.refund'
  | 'exam.manage'
  | 'question.manage'
  | 'content.publish'
  | 'content.manage'
  | 'teacher.manage'
  | 'branch.manage'
  | 'user.manage'
  | 'admission.manage'
  | 'communication.manage'

const ADMIN_PERMISSIONS: Permission[] = [
  'admin.access',
  'settings.view',
  'settings.manage',
  'course.manage',
  'student.view',
  'student.manage',
  'student.export',
  'payment.view',
  'payment.verify',
  'payment.refund',
  'exam.manage',
  'question.manage',
  'content.publish',
  'content.manage',
  'teacher.manage',
  'user.manage',
  'admission.manage',
  'communication.manage',
]

const TEACHER_PERMISSIONS: Permission[] = [
  'student.view',
  'exam.manage',
  'question.manage',
  'content.publish',
]

const STUDENT_PERMISSIONS: Permission[] = []

function allPermissions(): Permission[] {
  return Array.from(
    new Set<Permission>([
      ...ADMIN_PERMISSIONS,
      ...TEACHER_PERMISSIONS,
      ...STUDENT_PERMISSIONS,
      'settings.manage',
    ]),
  )
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  'super-admin': allPermissions(),
  admin: ADMIN_PERMISSIONS,
  teacher: TEACHER_PERMISSIONS,
  student: STUDENT_PERMISSIONS,
}

export function getPermissionsForRole(
  role: string | undefined | null,
): Permission[] {
  if (role === 'super-admin') return ROLE_PERMISSIONS['super-admin']
  if (role === 'admin') return ROLE_PERMISSIONS.admin
  if (role === 'teacher') return ROLE_PERMISSIONS.teacher
  return ROLE_PERMISSIONS.student
}

export function hasPermission(
  permissions: Permission[],
  permission: Permission,
): boolean {
  return permissions.includes(permission)
}

export function getSessionPermissions(session: Session | null): Permission[] {
  return getPermissionsForRole(session?.user?.role)
}

export type AuthResult =
  | { ok: true; session: Session; permissions: Permission[] }
  | { ok: false; response: NextResponse }

async function authorize(permission?: Permission): Promise<AuthResult> {
  const session = await getSession()
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const permissions = getSessionPermissions(session)
  if (permission && !hasPermission(permissions, permission)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { ok: true, session, permissions }
}

export function requireAdmin(): Promise<AuthResult> {
  return authorize('admin.access')
}

export function requireSuperAdmin(): Promise<AuthResult> {
  return authorize('settings.manage')
}

export function requirePermission(permission: Permission): Promise<AuthResult> {
  return authorize(permission)
}
