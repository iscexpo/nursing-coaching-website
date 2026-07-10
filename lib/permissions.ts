import { auth } from './auth'
import { headers } from 'next/headers'

export type Session = typeof auth.$Infer.Session

export async function getSession() {
  return await auth.api.getSession({ headers: await headers() })
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function requireRole(role: 'admin' | 'student') {
  const session = await requireAuth()
  if (session.user.role !== role) throw new Error('Forbidden')
  return session
}
