// Location-based admin roles
export type Location = 'imphal' | 'newdelhi';
export type LocationScope = Location | 'all';  // 'all' for cross-location view
export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  location: Location;  // Primary/home location (Imphal or New Delhi)
  created_at: string;
}

// Both locations with their display names and codes
// Following industry standard: IATA codes for airports, internal codes for branches
export const LOCATIONS: Record<Location, { 
  name: string; 
  code: string;        // Short code for IDs (3 chars)
  fullName: string;    // Full display name
  timezone: string;    // For proper date handling
  currency: string;    // Default currency
}> = {
  imphal: { 
    name: 'Imphal', 
    code: 'IMF',
    fullName: 'Imphal, Manipur',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
  },
  newdelhi: { 
    name: 'New Delhi', 
    code: 'DEL',
    fullName: 'New Delhi, NCR',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
  },
};

// Location scope options for UI
export const LOCATION_SCOPES: { value: LocationScope; label: string; icon?: string }[] = [
  { value: 'all', label: 'All Locations', icon: '🌐' },
  { value: 'imphal', label: 'Imphal (IMF)', icon: '📍' },
  { value: 'newdelhi', label: 'New Delhi (DEL)', icon: '📍' },
];

// Role permissions - conservative defaults
export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    canDeleteInvoices: boolean;
    canManageRates: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canViewSensitiveData: boolean;
    canAccessAllLocations: boolean;
    canCreateCrossLocationShipments: boolean;
  }
> = {
  admin: {
    canDeleteInvoices: true,
    canManageRates: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canViewSensitiveData: true,
    canAccessAllLocations: true,
    canCreateCrossLocationShipments: true,
  },
  manager: {
    canDeleteInvoices: false,
    canManageRates: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canViewSensitiveData: false,
    canAccessAllLocations: true,
    canCreateCrossLocationShipments: false,
  },
  operator: {
    canDeleteInvoices: false,
    canManageRates: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canViewSensitiveData: false,
    canAccessAllLocations: false,
    canCreateCrossLocationShipments: false,
  },
  viewer: {
    canDeleteInvoices: false,
    canManageRates: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canViewSensitiveData: false,
    canAccessAllLocations: false,
    canCreateCrossLocationShipments: false,
  },
};

export function hasPermission<K extends keyof typeof ROLE_PERMISSIONS['admin']>(
  role: UserRole,
  permission: K
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions[permission] : false;
}

// Check if user can access a specific location
export function canAccessLocation(userLocation: Location, targetLocation: Location): boolean {
  // All admins can access all locations
  return true;
}

/**
 * Generate location-coded reference number
 * Format: {PREFIX}-{LOCATION_CODE}-{YYMM}-{SEQUENCE}
 * Example: INV-IXA-2512-0001, SHP-DEL-2512-0042
 */
export function generateLocationRef(
  prefix: 'INV' | 'SHP' | 'MAN' | 'CUS' | 'BAR',
  location: Location,
  sequence: number
): string {
  const locationCode = LOCATIONS[location].code;
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const seq = String(sequence).padStart(4, '0');
  return `${prefix}-${locationCode}-${yymm}-${seq}`;
}

/**
 * Parse location from a reference number
 * Returns the location if found, null otherwise
 */
export function parseLocationFromRef(ref: string): Location | null {
  if (!ref) return null;
  const parts = ref.split('-');
  if (parts.length < 2) return null;
  
  const code = parts[1];
  for (const [loc, config] of Object.entries(LOCATIONS)) {
    if (config.code === code) return loc as Location;
  }
  return null;
}
