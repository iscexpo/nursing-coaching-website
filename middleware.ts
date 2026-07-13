import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware provides authentication gating only (session cookie check).
 * Authorization (role verification) is handled by server components in
 * `app/admin/layout.tsx` which calls `getSession()` and checks `isAdmin()`.
 *
 * This dual-gate pattern is intentional: middleware runs in the Edge runtime
 * where Better Auth's full session lookup is not available without an extra
 * network hop. The admin layout server component performs the authoritative
 * role check before any admin content renders.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('__Secure-better-auth.session_token')?.value
    || request.cookies.get('better-auth.session_token')?.value

  const isAuthPage = pathname.startsWith('/auth')
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin = pathname.startsWith('/admin')

  if (!sessionToken && (isDashboard || isAdmin)) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
}
