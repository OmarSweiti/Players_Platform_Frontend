import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/players',
  '/contracts',
  '/training',
  '/performance',
  '/legal',
  '/chat',
  '/settings',
];

// Auth routes that should redirect if already authenticated
const authRoutes = ['/login', '/register'];

/**
 * Middleware for route protection and authentication checks
 * 
 * Features:
 * - Protects dashboard routes from unauthenticated access
 * - Redirects authenticated users away from auth pages
 * - Supports tenant-based routing (future enhancement)
 * - Performance optimized with matcher config
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if user has authentication cookie (HTTP-only)
  // Backend sets secure HTTP-only cookies, so we check for their existence
  const hasAuthCookie = request.cookies.has('accessToken') || request.cookies.has('refreshToken');

  // Redirect to login if accessing protected route without authentication
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); // Preserve intended destination
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (authRoutes.includes(pathname) && hasAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure middleware matcher for optimal performance
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
