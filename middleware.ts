import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextResponse, type NextRequest} from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const sessionToken = request.cookies.get('__Secure-better-auth.session_token')?.value
    || request.cookies.get('better-auth.session_token')?.value;

  const isDashboard = pathname.startsWith('/dashboard') || pathname.includes('/dashboard');
  const isAdmin = pathname.startsWith('/admin') || pathname.includes('/admin');
  const isAuthPage = pathname.includes('/auth/sign-in') || pathname.includes('/auth/sign-up');

  if (!sessionToken && (isDashboard || isAdmin)) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAdmin || isDashboard || isAuthPage) {
    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|images|icon.svg|icon-dark-32x32.png|icon-light-32x32.png|apple-icon.png|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image.*).*)',
  ],
};
