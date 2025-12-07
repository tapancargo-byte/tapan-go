'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import BracketsIcon from '@/components/icons/brackets';
import GearIcon from '@/components/icons/gear';
import DotsVerticalIcon from '@/components/icons/dots-vertical';
import MonkeyIcon from '@/components/icons/monkey';
import EmailIcon from '@/components/icons/email';
import { Bullet } from '@/components/ui/bullet';
import LockIcon from '@/components/icons/lock';
import { useIsV0 } from '@/lib/v0-context';
import { BrandLogo } from '@/components/ui/brand-logo';

import { navMain, type NavBadgeKey } from '@/components/dashboard/nav-config';
import { ThemeToggle } from '@/components/theme-toggle';
import { supabase } from '@/lib/supabaseClient';
import { MapPin, Bell, ChevronDown } from 'lucide-react';
import { useLocation } from '@/lib/location-context';
import { LOCATIONS, type Location } from '@/types/auth';

// Compact Location & Notification Bar for sidebar
function LocationNotificationBar() {
  const { locationScope, setLocationScope } = useLocation();
  const [notificationCount, setNotificationCount] = React.useState(0);
  
  // Fetch real notification count
  React.useEffect(() => {
    async function fetchNotificationCount() {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
        
        if (!error && count !== null) {
          setNotificationCount(count);
        }
      } catch {
        // Silently fail - notifications table may not exist
        setNotificationCount(0);
      }
    }
    fetchNotificationCount();
  }, []);
  
  return (
    <div className="flex items-center gap-2 px-2">
      {/* Location Selector - Compact */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex-1 flex items-center gap-2 px-3 py-2 bg-sidebar-accent hover:bg-sidebar-accent-active transition-colors text-left">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium truncate flex-1">
              {locationScope === 'all' ? 'All' : LOCATIONS[locationScope as Location]?.code || 'IMF'}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 rounded-none" side="top" align="start">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-2 pb-1">Branch Location</p>
            <button
              onClick={() => setLocationScope('imphal')}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                locationScope === 'imphal' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <span className="font-mono text-xs">IMF</span>
              <span>Imphal</span>
            </button>
            <button
              onClick={() => setLocationScope('newdelhi')}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                locationScope === 'newdelhi' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <span className="font-mono text-xs">DEL</span>
              <span>New Delhi</span>
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => setLocationScope('all')}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors",
                locationScope === 'all' ? "bg-blue-500/10 text-blue-600" : "hover:bg-accent text-muted-foreground"
              )}
            >
              View all locations
            </button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Notifications - Compact */}
      <Link
        href="/notifications"
        className="relative flex items-center justify-center w-9 h-9 bg-sidebar-accent hover:bg-sidebar-accent-active transition-colors"
      >
        <Bell className="h-4 w-4" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-medium bg-destructive text-destructive-foreground">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </Link>
    </div>
  );
}

export function DashboardSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const isV0 = useIsV0();
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const [sidebarCounts, setSidebarCounts] = React.useState<
    Record<NavBadgeKey, number | null>
  >({
    warehouses: null,
    shipments: null,
    invoices: null,
    alerts: null,
  });

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out', error);
    } finally {
      setIsSigningOut(false);
      router.push('/login');
    }
  };

  // Defer sidebar counts loading to not block initial render
  React.useEffect(() => {
    let cancelled = false;

    // Delay loading counts to prioritize page content
    const timeoutId = setTimeout(async () => {
      if (cancelled) return;
      
      try {
        // Only fetch essential counts (3 queries instead of 7)
        const [warehousesRes, shipmentsRes, invoicesRes] = await Promise.all([
          supabase.from('warehouses').select('*', { count: 'exact', head: true }),
          supabase.from('shipments').select('*', { count: 'exact', head: true })
            .in('status', ['pending', 'in-transit', 'at-warehouse']),
          supabase.from('invoices').select('*', { count: 'exact', head: true })
            .in('status', ['pending', 'overdue']),
        ]);

        if (cancelled) return;

        setSidebarCounts({
          warehouses: warehousesRes.count ?? null,
          shipments: shipmentsRes.count ?? null,
          invoices: invoicesRes.count ?? null,
          alerts: null, // Load alerts separately on alerts page
        });
      } catch (error) {
        if (cancelled) return;
        console.warn('Failed to load sidebar counts', error);
      }
    }, 500); // Delay 500ms to let page content load first

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const toPositiveBadge = (value: number | null) =>
    typeof value === 'number' && value > 0 ? value : undefined;

  const navMainWithBadges = navMain.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (!item.badgeKey) return item;

      const raw = sidebarCounts[item.badgeKey];
      return {
        ...item,
        badge: toPositiveBadge(raw),
      };
    }),
  }));

  const [profile, setProfile] = React.useState<{
    name: string;
    email: string;
    avatar: string | null;
    role: string | null;
    status: 'Active' | 'Offline';
  } | null>(null);

  const [profileLoading, setProfileLoading] = React.useState(true);

  const isAdmin = profile?.role
    ? profile.role.toLowerCase() === 'admin'
    : false;

  const visibleNav = navMainWithBadges
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.requiresAdmin || isAdmin),
    }))
    .filter((group) => group.items.length > 0);

  React.useEffect(() => {
    let cancelled = false;

    // Defer profile loading to prioritize page content
    const timeoutId = setTimeout(async () => {
      if (cancelled) return;
      
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error || !user) {
          setProfile(null);
          setProfileLoading(false);
          return;
        }

        const { data: userRow, error: userError } = await supabase
          .from('users')
          .select('name, role, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (cancelled) return;

        if (userError) {
          console.warn('Failed to load sidebar profile from users table', userError);
        }

        setProfile({
          name: (userRow?.name as string | null) || user.email || 'Tapan Go Ops',
          email: user.email ?? 'ops@tapango.logistics',
          avatar: (userRow?.avatar_url as string | null) || null,
          role: (userRow?.role as string | null) ?? 'Operator',
          status: 'Active',
        });
      } catch (err) {
        if (cancelled) return;
        console.warn('Failed to load sidebar profile', err);
        setProfile(null);
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }, 300); // Delay 300ms to prioritize page content

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const renderBadge = (
    badge: string | number | undefined,
    color: 'default' | 'success' | 'warning' | 'destructive' = 'default'
  ) => {
    if (badge === undefined || badge === null) return null;
    if (typeof badge === 'number' && badge <= 0) return null;

    const colorClasses = {
      default: 'bg-muted text-muted-foreground',
      success: 'bg-green-500/20 text-green-700 dark:text-green-400',
      warning: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
      destructive: 'bg-red-500/20 text-red-700 dark:text-red-400',
    };

    return (
      <SidebarMenuBadge
        className={cn(
          'bg-transparent',
          colorClasses[color]
        )}
      >
        {badge}
      </SidebarMenuBadge>
    );
  };

  return (
    <Sidebar {...props} className={cn('py-sides', className)}>
      <SidebarHeader className="flex gap-3 flex-row items-center border-b border-sidebar-border pb-4">
        <BrandLogo size="xs" priority className="flex-1" />
        <div className="flex items-center justify-center gap-2">
          <ThemeToggle />
          <div className="w-2 h-2 bg-success animate-pulse" />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-4">
        {visibleNav.map((group, i) => (
          <SidebarGroup key={group.title} className="gap-3">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
              <Bullet className="mr-2 opacity-60" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="relative group"
                    data-disabled={item.locked}
                  >
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={pathname === item.url}
                      disabled={item.locked}
                      className={cn(
                        'transition-all duration-200 cursor-pointer',
                        'sidebar-menu-item-hover',
                        pathname === item.url && 'sidebar-menu-item-active',
                        item.locked && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                      )}
                    >
                      {item.locked ? (
                        <div className="flex items-center justify-between w-full gap-2 px-2 py-1.5">
                          <div className="flex items-center gap-3 flex-1">
                            <item.icon className="size-5 opacity-70" />
                            <span className="text-sm font-medium">
                              {item.title}
                            </span>
                          </div>
                          <LockIcon className="size-4 opacity-50" />
                        </div>
                      ) : (
                        <Link
                          href={item.url}
                          className="flex items-center justify-between w-full gap-2"
                          aria-current={pathname === item.url ? 'page' : undefined}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <item.icon className="size-4" />
                            <span className="text-sm md:text-base font-medium">
                              {item.title}
                            </span>
                          </div>
                        </Link>
                      )}
                    </SidebarMenuButton>
                    {!item.locked && renderBadge(item.badge, item.badgeColor)}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-0 border-t border-sidebar-border">
        <SidebarGroup className="gap-2 py-3">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            <Bullet className="mr-2 opacity-60" />
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {/* Location & Notifications Row */}
            <LocationNotificationBar />
            
            <SidebarMenu className="mt-2">
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex gap-0.5 w-full group cursor-pointer hover:opacity-90 transition-opacity">
                      <span className="shrink-0 flex size-12 items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 text-sidebar-primary-foreground overflow-clip shadow-md">
                        {profileLoading ? (
                          <span className="text-[10px] font-semibold tracking-wider uppercase">
                            ...
                          </span>
                        ) : (
                          <Image
                            src={profile?.avatar || '/avatars/user_krimson.png'}
                            alt={profile?.name || 'Profile'}
                            width={100}
                            height={100}
                          />
                        )}
                      </span>
                      <span className="group/item pl-3 pr-1.5 py-2 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center group-data-[state=open]:bg-sidebar-accent-active transition-colors">
                        <span className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold text-foreground text-sm">
                            {profile?.name || 'Tapan Go Ops'}
                          </span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {profile?.role || 'Operator'}
                          </span>
                        </span>
                        <DotsVerticalIcon className="ml-auto size-4 opacity-60" />
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-56 p-2 shadow-lg"
                    side="top"
                    align="start"
                    sideOffset={8}
                  >
                    <div className="flex flex-col gap-1">
                      {/* User Info Section */}
                      <div className="px-3 py-2 text-sm border-b border-border">
                        <div className="font-semibold text-foreground">
                          {profile?.name || 'Tapan Go Ops'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {profile?.email || 'ops@tapango.logistics'}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={cn('w-2 h-2', profile?.status === 'Active' ? 'bg-green-500' : 'bg-gray-500')} />
                          <span className="text-xs text-muted-foreground">
                            {profile?.status || 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
                        <MonkeyIcon className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </button>
                      <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
                        <GearIcon className="h-4 w-4" />
                        <span>System Settings</span>
                      </button>
                      <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors">
                        <BracketsIcon className="h-4 w-4" />
                        <span>Help & Support</span>
                      </button>

                      {/* Divider and Logout */}
                      <div className="border-t border-border pt-2 mt-1">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-red-50 dark:hover:bg-red-950 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <span>{isSigningOut ? 'Signing out…' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <SidebarMenuButton 
                   onClick={handleSignOut} 
                   disabled={isSigningOut}
                   className="text-destructive hover:text-destructive hover:bg-destructive/10"
                 >
                   <LockIcon className="size-4" />
                   <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                 </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default DashboardSidebar;
