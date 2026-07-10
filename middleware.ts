import { auth } from '@/lib/auth'
import { NextResponse, type NextRequest } from 'next/server'

async function getSessionFromRequest(request: NextRequest) {
  try {
    return await auth.api.getSession({
      headers: Object.fromEntries(request.headers.entries()),
    })
  } catch {
    return null
  }
}

export default async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith('/auth')
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdmin = pathname.startsWith('/admin')

  if (!session && (isDashboard || isAdmin)) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  if (isAuthPage && session) {
    if (session.user.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isAdmin && session && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
}
