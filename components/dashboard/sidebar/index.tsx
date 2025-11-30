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
import AtomIcon from '@/components/icons/atom';
import ProcessorIcon from '@/components/icons/proccesor';
import GearIcon from '@/components/icons/gear';
import DotsVerticalIcon from '@/components/icons/dots-vertical';
import MonkeyIcon from '@/components/icons/monkey';
import EmailIcon from '@/components/icons/email';
import { Bullet } from '@/components/ui/bullet';
import LockIcon from '@/components/icons/lock';
import { useIsV0 } from '@/lib/v0-context';
import { BrandLogo } from '@/components/ui/brand-logo';

import WarehouseIcon from '@/components/icons/warehouse';
import TruckIcon from '@/components/icons/truck';
import BoxIcon from '@/components/icons/box';
import { ThemeToggle } from '@/components/theme-toggle';
import { supabase } from '@/lib/supabaseClient';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  locked?: boolean;
  badge?: string | number;
  badgeColor?: 'default' | 'success' | 'warning' | 'destructive';
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function DashboardSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const isV0 = useIsV0();
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const [sidebarCounts, setSidebarCounts] = React.useState<{
    warehouses: number | null;
    shipments: number | null;
    invoices: number | null;
    alerts: number | null;
  }>({
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

  React.useEffect(() => {
    let cancelled = false;

    async function loadSidebarCounts() {
      try {
        const warehousesQuery = supabase
          .from('warehouses')
          .select('*', { count: 'exact', head: true });

        const activeShipmentsQuery = supabase
          .from('shipments')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'in-transit', 'at-warehouse']);

        const billingInvoicesQuery = supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'overdue']);

        const today = new Date();
        const todayISO = today.toISOString();
        const stalledCutoff = new Date();
        stalledCutoff.setDate(stalledCutoff.getDate() - 3);
        const stalledCutoffISO = stalledCutoff.toISOString();

        const overdueInvoicesQuery = supabase
          .from('invoices')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'overdue');

        const pendingPastDueInvoicesQuery = supabase
          .from('invoices')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
          .lt('due_date', todayISO);

        const stalledShipmentsQuery = supabase
          .from('shipments')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'in-transit', 'at-warehouse'])
          .lt('created_at', stalledCutoffISO);

        const highPriorityTicketsQuery = supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .neq('status', 'resolved')
          .eq('priority', 'high');

        const [
          warehousesRes,
          shipmentsRes,
          invoicesRes,
          overdueInvoicesRes,
          pendingPastDueInvoicesRes,
          stalledShipmentsRes,
          highPriorityTicketsRes,
        ] = await Promise.all([
          warehousesQuery,
          activeShipmentsQuery,
          billingInvoicesQuery,
          overdueInvoicesQuery,
          pendingPastDueInvoicesQuery,
          stalledShipmentsQuery,
          highPriorityTicketsQuery,
        ]);

        if (cancelled) return;

        const alertsCount =
          (overdueInvoicesRes.count ?? 0) +
          (pendingPastDueInvoicesRes.count ?? 0) +
          (stalledShipmentsRes.count ?? 0) +
          (highPriorityTicketsRes.count ?? 0);

        setSidebarCounts({
          warehouses: warehousesRes.count ?? null,
          shipments: shipmentsRes.count ?? null,
          invoices: invoicesRes.count ?? null,
          alerts: alertsCount > 0 ? alertsCount : null,
        });
      } catch (error) {
        if (cancelled) return;
        console.warn('Failed to load sidebar counts', error);
        setSidebarCounts({
          warehouses: null,
          shipments: null,
          invoices: null,
          alerts: null,
        });
      }
    }

    loadSidebarCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const toPositiveBadge = (value: number | null) =>
    typeof value === 'number' && value > 0 ? value : undefined;

  const navMain: NavGroup[] = [
    {
      title: 'Core Operations',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: BracketsIcon,
          badge: 'Live',
          badgeColor: 'success',
        },
        {
          title: 'Warehouse',
          url: '/warehouse',
          icon: WarehouseIcon,
          badge: toPositiveBadge(sidebarCounts.warehouses),
        },
        {
          title: 'Shipments',
          url: '/shipments',
          icon: TruckIcon,
          badge: toPositiveBadge(sidebarCounts.shipments),
          badgeColor: 'warning',
        },
        {
          title: 'Inventory',
          url: '/inventory',
          icon: BoxIcon,
        },
      ],
    },
    {
      title: 'Management & Billing',
      items: [
        {
          title: 'Customers',
          url: '/customers',
          icon: EmailIcon,
        },
        {
          title: 'Invoices',
          url: '/invoices',
          icon: GearIcon,
          badge: toPositiveBadge(sidebarCounts.invoices),
          badgeColor: 'destructive',
        },
        {
          title: 'Rates',
          url: '/rates',
          icon: ProcessorIcon,
        },
        {
          title: 'Aircargo Manifesto',
          url: '/aircargo',
          icon: AtomIcon,
        },
        {
          title: 'Manifest Scan Session',
          url: '/aircargo/scan-session',
          icon: AtomIcon,
        },
        {
          title: 'Barcode Tracking',
          url: '/barcodes',
          icon: BracketsIcon,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Global Search',
          url: '/search',
          icon: ProcessorIcon,
        },
        {
          title: 'Reports & Analytics',
          url: '/reports',
          icon: ProcessorIcon,
        },
        {
          title: 'Network Analytics',
          url: '/analytics',
          icon: AtomIcon,
        },
        {
          title: 'Exceptions & Alerts',
          url: '/alerts',
          icon: BracketsIcon,
          badge: toPositiveBadge(sidebarCounts.alerts),
          badgeColor: 'warning',
        },
        {
          title: 'Notifications',
          url: '/notifications',
          icon: EmailIcon,
        },
        {
          title: 'Support Tickets',
          url: '/support',
          icon: EmailIcon,
        },
        {
          title: 'Ops Activity',
          url: '/ops-activity',
          icon: ProcessorIcon,
        },
        {
          title: 'Settings',
          url: '/settings',
          icon: GearIcon,
        },
        {
          title: 'Admin',
          url: '/admin',
          icon: GearIcon,
        },
      ],
    },
  ];

  const [profile, setProfile] = React.useState<{
    name: string;
    email: string;
    avatar: string | null;
    role: string | null;
    status: 'Active' | 'Offline';
  } | null>(null);

  const [profileLoading, setProfileLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
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
    }

    void loadProfile();

    const handleProfileUpdate = (event: Event) => {
      // Optimistically update if URL is provided
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.avatarUrl) {
        setProfile((prev) =>
          prev
            ? { ...prev, avatar: customEvent.detail.avatarUrl }
            : null
        );
      }
      // Also fetch fresh data
      void loadProfile();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('profile-updated', handleProfileUpdate);
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
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row items-center rounded-b-none border-b border-sidebar-border pb-4">
        <BrandLogo size="xs" priority className="flex-1" />
        <div className="flex items-center justify-center gap-2">
          <ThemeToggle />
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-4">
        {navMain.map((group, i) => (
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
                        'hover:bg-sidebar-accent-active hover:text-sidebar-accent-foreground',
                        pathname === item.url &&
                          'bg-sidebar-accent-active text-sidebar-accent-foreground font-medium shadow-sm',
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
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <item.icon className="size-4" />
                            <span className="text-sm md:text-base font-semibold tracking-[0.12em]">
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
        <SidebarGroup className="gap-3 py-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            <Bullet className="mr-2 opacity-60" />
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex gap-0.5 w-full group cursor-pointer hover:opacity-90 transition-opacity">
                      <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-sidebar-primary-foreground overflow-clip shadow-md">
                        {profileLoading ? (
                          <span className="text-xs font-semibold tracking-[0.18em] uppercase">
                            Loading
                          </span>
                        ) : (
                          <Image
                            src={profile?.avatar || '/avatars/user_krimson.png'}
                            alt={profile?.name || 'Profile'}
                            width={120}
                            height={120}
                          />
                        )}
                      </div>
                      <div className="group/item pl-3 pr-1.5 pt-2 pb-1.5 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center rounded group-data-[state=open]:bg-sidebar-accent-active group-data-[state=open]:hover:bg-sidebar-accent-active group-data-[state=open]:text-sidebar-accent-foreground transition-colors">
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold text-foreground">
                            {profile?.name || 'Tapan Go Ops'}
                          </span>
                          <span className="truncate text-xs text-muted-foreground group-hover/item:text-foreground">
                            {profile?.role || 'Operator'}
                          </span>
                        </div>
                        <DotsVerticalIcon className="ml-auto size-4 opacity-60" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-56 p-2 rounded-lg shadow-lg"
                    side="bottom"
                    align="end"
                    sideOffset={8}
                  >
                    <div className="flex flex-col gap-2">
                      {/* User Info Section */}
                      <div className="px-3 py-2 text-sm border-b border-border">
                        <div className="font-semibold text-foreground">
                          {profile?.name || 'Tapan Go Ops'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {profile?.email || 'ops@tapango.logistics'}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={cn('w-2 h-2 rounded-full', profile?.status === 'Active' ? 'bg-green-500' : 'bg-gray-500')} />
                          <span className="text-xs text-muted-foreground">
                            {profile?.status || 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                        <MonkeyIcon className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </button>
                      <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                        <GearIcon className="h-4 w-4" />
                        <span>System Settings</span>
                      </button>
                      <button className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                        <BracketsIcon className="h-4 w-4" />
                        <span>Help & Support</span>
                      </button>

                      {/* Divider and Logout */}
                      <div className="border-t border-border pt-2 mt-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          <span>{isSigningOut ? 'Signing out…' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
