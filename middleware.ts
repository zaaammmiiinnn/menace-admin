import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/unauthorized',
  '/offline',
  '/manifest.json',
  '/sw.js',
  '/icons/(.*)',
  '/favicon.ico',
]);

const isStaffRestrictedRoute = createRouteMatcher([
  '/products(.*)',
  '/discounts(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // If local bypass is on, skip auth
  if (process.env.ADMIN_DEV_BYPASS === 'true' && process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Allow public static assets and auth pages
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  // 1. Unauthenticated users -> redirect to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 2. Role inspection from Clerk session claims
  const metadata = (sessionClaims?.public_metadata || sessionClaims?.publicMetadata) as Record<string, any> | undefined;
  const role = metadata?.role as string | undefined;

  // Check email bootstrap fallback
  const email = (sessionClaims?.email as string | undefined)?.toLowerCase() || '';
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = role === 'admin' || (email && adminEmails.includes(email));
  const isStaff = role === 'staff';

  // 3. Unauthorized users (regular customers) -> redirect to stealth 404 unauthorized page
  if (!isAdmin && !isStaff) {
    return NextResponse.rewrite(new URL('/unauthorized', req.url));
  }

  // 4. Staff attempting to access admin-only settings / products / discounts
  if (isStaff && !isAdmin && isStaffRestrictedRoute(req)) {
    return NextResponse.rewrite(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
