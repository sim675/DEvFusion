import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define which routes are meant for authenticated users
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/seller') || path.startsWith('/buyer');
  
  // Define public routes (auth routes)
  const isAuthRoute =
    path === '/login' ||
    path === '/register' ||
    path === '/register/buyer' ||
    path === '/register/seller';

  // Read the auth cookie we set during login
  const token = request.cookies.get('auth_token')?.value || '';

  // 1. If trying to access a protected route without a token, redirect to Login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If trying to access an auth route (login/register) WITH a token, redirect to Home/Dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Continue normally if none of the conditions apply
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
