import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Ensure publishable key always has storefront fallback
const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_ZmFpdGhmdWwtdGFkcG9sZS01MzYyLmNsZXJrLmFjY291bnRzLmRldiQ';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Pass through all static assets, Next internals, icons, and public endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/__clerk') ||
    pathname.includes('.') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/offline') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/icons') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Dev Bypass (Works in development and on preview deployments if flag enabled)
  if (process.env.ADMIN_DEV_BYPASS === 'true') {
    return NextResponse.next();
  }

  // 3. Inspect Clerk session cookies
  // Clerk sets `__session` (JWT session token) and `__client_uat` (client user active timestamp)
  const hasSession = req.cookies.has('__session') || req.cookies.has('__client_uat');

  if (!hasSession) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
};
