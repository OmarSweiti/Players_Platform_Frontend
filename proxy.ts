import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './src/shared/lib/constants';

/**
 * Public routes that do NOT require authentication
 * Using whitelist approach - everything else is protected by default
 */
const publicRoutes = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  '/verify-email',
  '/reset-password',
];

/**
 * Auth routes that should redirect authenticated users to dashboard
 */
const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD];

/**
 * Proxy function for route protection and authentication checks
 * (Next.js 16+ replacement for middleware)
 * 
 * Features:
 * - Whitelist-based route protection (more secure than blacklist)
 * - Redirects authenticated users away from auth pages
 * - Preserves intended destination via redirect parameter
 * - Uses constants for maintainability
 * - Performance optimized with matcher config
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if user has authentication cookie (HTTP-only)
  // Backend sets secure HTTP-only cookies, so we check for their existence
  // Checking multiple possible cookie names for compatibility
  const hasAuthCookie = 
    request.cookies.has('accessToken') || 
    request.cookies.has('refreshToken') || 
    request.cookies.has('auth_token');

  const isAuthenticated = hasAuthCookie;

  // If accessing auth pages while authenticated, redirect to dashboard
  const isAuthRoute = authRoutes.includes(pathname as any);
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  // If accessing protected route while not authenticated, redirect to login
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname); // Preserve intended destination
    return NextResponse.redirect(loginUrl);
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
