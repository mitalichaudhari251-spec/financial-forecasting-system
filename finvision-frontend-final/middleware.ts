import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PATHS = ['/login', '/register', '/forgot-password'];

const PROTECTED_PREFIXES = [
  '/dashboard', '/forecasting', '/analytics', '/training',
  '/cnn-analysis', '/rl-agent', '/ingestion', '/preprocessing',
  '/image-generation', '/reports', '/history', '/settings',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('fv_token')?.value;

  // '/' is ALWAYS public — never redirect from landing page
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Not logged in + protected route → /login
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in + auth pages → /dashboard
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match everything EXCEPT static files — '/' is included in this matcher
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
