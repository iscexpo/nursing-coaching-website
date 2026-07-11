import { auth } from './auth'
import { headers } from 'next/headers'

export type Session = typeof auth.$Infer.Session

export async function getSession() {
  return await auth.api.getSession({ headers: await headers() })
}


