export const PUBLIC_ROUTES = [
  '/sign-in(.*)',
  '/unauthorized',
  '/offline',
  '/manifest.json',
  '/sw.js',
  '/icons/(.*)',
  '/favicon.ico',
];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\(\.\*\)/g, '.*')}$`);
    return regex.test(pathname);
  });
}

export function isStaffAllowedRoute(pathname: string): boolean {
  // Staff are restricted from products, discounts, inventory modifications, and settings
  const staffRestrictedPrefixes = ['/products', '/discounts', '/settings'];
  return !staffRestrictedPrefixes.some((prefix) => pathname.startsWith(prefix));
}
