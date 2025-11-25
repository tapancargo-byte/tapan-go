export type UserRole = 'admin' | 'manager' | 'operator';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
}

export const ROLE_PERMISSIONS = {
  admin: {
    canDeleteInvoices: true,
    canManageRates: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canViewSensitiveData: true,
  },
  manager: {
    canDeleteInvoices: false,
    canManageRates: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canViewSensitiveData: true,
  },
  operator: {
    canDeleteInvoices: false,
    canManageRates: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canViewSensitiveData: false,
  },
} as const;

export function hasPermission<K extends keyof typeof ROLE_PERMISSIONS['admin']>(
  role: UserRole,
  permission: K
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions[permission] : false;
}
