import { api } from './api'
import { handleAuthRequest } from './handler'
import type { NextRequest } from 'next/server'
import { hashPassword, verifyPassword } from './password'

export { hashPassword, verifyPassword }

export function createAuth() {
  return {
    api,
    handler: async (request: NextRequest) => handleAuthRequest(request),
  }
}

export type AuthInstance = ReturnType<typeof createAuth>

let _auth: AuthInstance | null = null

export function getAuth(): AuthInstance {
  if (!_auth) {
    _auth = createAuth()
  }
  return _auth
}

export const auth = new Proxy({} as AuthInstance, {
  get(_, prop) {
    return (getAuth() as AuthInstance)[prop as keyof AuthInstance]
  },
})
