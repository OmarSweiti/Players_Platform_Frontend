import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale } from './src/i18n/locales';

/**
 * Pages a visitor without a session may open, within a locale.
 * Using whitelist approach - everything else is protected by default
 */
const publicRoutes = ['/sign-in'];

/**
 * Proxy function for route protection and authentication checks
 * (Next.js 16+ replacement for middleware)
 *
 * Every route lives under /{locale} (0.9.1): a path without a supported
 * locale gains the default one. Within a locale, routing only looks at
 * whether a session cookie is present — it decides nothing; the session
 * itself arrives with 0.9.5.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const [, first = ''] = pathname.split('/');

  if (!isLocale(first)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  const locale = first;
  const route = pathname.slice(locale.length + 1) || '/';

  // Check if user has authentication cookie (HTTP-only)
  // Backend sets secure HTTP-only cookies, so we check for their existence
  // Checking multiple possible cookie names for compatibility
  const hasAuthCookie =
    request.cookies.has('accessToken') ||
    request.cookies.has('refreshToken') ||
    request.cookies.has('auth_token');

  // Signed in, the sign-in page leads home
  if (hasAuthCookie && route === '/sign-in') {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // If accessing protected route while not authenticated, redirect to sign-in
  const isPublicRoute = publicRoutes.some(
    (publicRoute) =>
      route === publicRoute || route.startsWith(publicRoute + '/'),
  );

  if (!hasAuthCookie && !isPublicRoute) {
    const signInUrl = new URL(`/${locale}/sign-in`, request.url);
    signInUrl.searchParams.set('redirect', pathname); // Preserve intended destination
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Configure proxy matcher for optimal performance
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
