import { describe, it, expect } from 'vitest'
import {
  isAdmin,
  isSuperAdmin,
  getPermissionsForRole,
  hasPermission,
  getSessionPermissions,
  type Permission,
} from '@/lib/core/permissions'

describe('isAdmin', () => {
  it('returns true for admin', () => {
    expect(isAdmin('admin')).toBe(true)
  })

  it('returns true for super-admin', () => {
    expect(isAdmin('super-admin')).toBe(true)
  })

  it('returns false for teacher', () => {
    expect(isAdmin('teacher')).toBe(false)
  })

  it('returns false for student', () => {
    expect(isAdmin('student')).toBe(false)
  })

  it('returns false for undefined/null', () => {
    expect(isAdmin(undefined)).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })
})

describe('isSuperAdmin', () => {
  it('returns true for super-admin', () => {
    expect(isSuperAdmin('super-admin')).toBe(true)
  })

  it('returns false for admin', () => {
    expect(isSuperAdmin('admin')).toBe(false)
  })

  it('returns false for other roles', () => {
    expect(isSuperAdmin('teacher')).toBe(false)
    expect(isSuperAdmin('student')).toBe(false)
    expect(isSuperAdmin(undefined)).toBe(false)
  })
})

describe('getPermissionsForRole', () => {
  it('super-admin gets all permissions', () => {
    const perms = getPermissionsForRole('super-admin')
    expect(perms).toContain('admin.access' as Permission)
    expect(perms).toContain('settings.manage' as Permission)
    expect(perms).toContain('student.view' as Permission)
    expect(perms).toContain('payment.verify' as Permission)
  })

  it('admin gets admin permissions', () => {
    const perms = getPermissionsForRole('admin')
    expect(perms).toContain('admin.access' as Permission)
    expect(perms).toContain('course.manage' as Permission)
    expect(perms).toContain('student.view' as Permission)
  })

  it('teacher gets limited permissions', () => {
    const perms = getPermissionsForRole('teacher')
    expect(perms).toContain('student.view' as Permission)
    expect(perms).toContain('exam.manage' as Permission)
    expect(perms).not.toContain('admin.access' as Permission)
    expect(perms).not.toContain('payment.verify' as Permission)
  })

  it('student gets no permissions', () => {
    const perms = getPermissionsForRole('student')
    expect(perms).toHaveLength(0)
  })

  it('unknown role gets student permissions (empty)', () => {
    const perms = getPermissionsForRole('unknown')
    expect(perms).toHaveLength(0)
  })
})

describe('hasPermission', () => {
  it('returns true when permission exists', () => {
    const perms = getPermissionsForRole('admin')
    expect(hasPermission(perms, 'course.manage')).toBe(true)
  })

  it('returns false when permission missing', () => {
    const perms = getPermissionsForRole('teacher')
    expect(hasPermission(perms, 'payment.verify')).toBe(false)
  })
})

describe('getSessionPermissions', () => {
  it('returns admin permissions for admin session', () => {
    const session = {
      user: {
        id: '1',
        name: 'Test',
        email: 't@t.com',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: '1',
        token: 'x',
        userId: '1',
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
    const perms = getSessionPermissions(session)
    expect(perms).toContain('admin.access' as Permission)
  })

  it('returns empty for student session', () => {
    const session = {
      user: {
        id: '1',
        name: 'Test',
        email: 't@t.com',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: '1',
        token: 'x',
        userId: '1',
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
    const perms = getSessionPermissions(session)
    expect(perms).toHaveLength(0)
  })

  it('returns empty for null session', () => {
    const perms = getSessionPermissions(null)
    expect(perms).toHaveLength(0)
  })
})
