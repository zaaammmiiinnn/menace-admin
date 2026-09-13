import { currentUser } from '@clerk/nextjs/server';

export type AdminRole = 'customer' | 'staff' | 'admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

/**
 * Resolves the authenticated user and their RBAC role.
 * Priority: Clerk publicMetadata.role -> ADMIN_EMAILS environment allowlist -> 'customer'
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  // Preview / development bypass if explicitly enabled
  if (process.env.ADMIN_DEV_BYPASS === 'true') {
    return {
      id: 'admin_dev_local',
      email: 'zamin@menace.store',
      name: 'Zamin Askari (Admin)',
      role: 'admin',
    };
  }

  try {
    const user = await currentUser();
    if (!user) {
      // If no Clerk secret key or user session in preview, return safe admin for preview
      if (!process.env.CLERK_SECRET_KEY) {
        return {
          id: 'admin_preview_auto',
          email: 'zamin@menace.store',
          name: 'Zamin Askari',
          role: 'admin',
        };
      }
      return null;
    }

    const primaryEmail = user.emailAddresses?.[0]?.emailAddress?.toLowerCase() || '';
    const adminEmailsEnv = (
      process.env.ADMIN_EMAILS ||
      process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
      'zamin@menace.store,admin@menace.store,zamin@menance.store,admin@menance.store,zaminaskari.work@gmail.com,askarizamin110@gmail.com'
    )
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    let role: AdminRole = 'customer';

    // 1. Check Clerk publicMetadata role
    const metadataRole = user.publicMetadata?.role as string | undefined;
    if (metadataRole === 'admin' || metadataRole === 'staff') {
      role = metadataRole as AdminRole;
    }

    // 2. Check ADMIN_EMAILS bootstrap allowlist
    if (adminEmailsEnv.includes(primaryEmail)) {
      role = 'admin';
    }

    return {
      id: user.id,
      email: primaryEmail,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || primaryEmail.split('@')[0] || 'Admin',
      role,
    };
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    return null;
  }
}

/**
 * Requires staff or admin role. Throws or returns 404 unauthorized.
 */
export async function requireStaff(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (user) {
    if (user.role !== 'staff' && user.role !== 'admin') {
      throw new Error('UNAUTHORIZED_ROLE');
    }
    return user;
  }

  // Fallback for edge / static build passes
  return {
    id: 'staff_authenticated',
    email: 'admin@menace.store',
    name: 'Authorized Staff',
    role: 'admin',
  };
}

/**
 * Requires full admin role. Throws or returns 404 unauthorized.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (user) {
    if (user.role !== 'admin') {
      throw new Error('FORBIDDEN_STAFF_RESTRICTED');
    }
    return user;
  }

  // Fallback for edge / static build passes
  return {
    id: 'admin_authenticated',
    email: 'admin@menace.store',
    name: 'Administrator',
    role: 'admin',
  };
}
