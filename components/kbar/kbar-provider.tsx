'use client';

import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
  KBarResults,
  useMatches,
  Action,
} from 'kbar';
import {
  Package,
  Users,
  FileText,
  Warehouse,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  Home,
  ScanLine,
  Moon,
  Sun,
  Calendar,
} from 'lucide-react';

// Static navigation actions - use window.location for navigation to avoid hook issues
const staticActions: Action[] = [
  // Navigation Section
  {
    id: 'home',
    name: 'Dashboard',
    shortcut: ['g', 'h'],
    keywords: 'home dashboard overview',
    section: 'Navigation',
    subtitle: 'Go to dashboard overview',
    icon: <Home className="h-4 w-4" />,
    perform: () => { window.location.href = '/dashboard'; },
  },
  {
    id: 'shipments',
    name: 'Shipments',
    shortcut: ['g', 's'],
    keywords: 'shipments cargo packages',
    section: 'Navigation',
    subtitle: 'Manage shipments',
    icon: <Package className="h-4 w-4" />,
    perform: () => { window.location.href = '/shipments'; },
  },
  {
    id: 'customers',
    name: 'Customers',
    shortcut: ['g', 'c'],
    keywords: 'customers clients contacts',
    section: 'Navigation',
    subtitle: 'View customer list',
    icon: <Users className="h-4 w-4" />,
    perform: () => { window.location.href = '/customers'; },
  },
  {
    id: 'invoices',
    name: 'Invoices',
    shortcut: ['g', 'i'],
    keywords: 'invoices billing payments',
    section: 'Navigation',
    subtitle: 'Manage invoices',
    icon: <FileText className="h-4 w-4" />,
    perform: () => { window.location.href = '/invoices'; },
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    shortcut: ['g', 'w'],
    keywords: 'warehouse inventory storage',
    section: 'Navigation',
    subtitle: 'Warehouse management',
    icon: <Warehouse className="h-4 w-4" />,
    perform: () => { window.location.href = '/warehouse'; },
  },
  {
    id: 'tracking',
    name: 'Tracking',
    shortcut: ['g', 't'],
    keywords: 'tracking scans barcodes',
    section: 'Navigation',
    subtitle: 'Live tracking events',
    icon: <ScanLine className="h-4 w-4" />,
    perform: () => { window.location.href = '/track'; },
  },
  {
    id: 'analytics',
    name: 'Analytics',
    keywords: 'analytics reports data',
    section: 'Navigation',
    subtitle: 'View analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    perform: () => { window.location.href = '/analytics'; },
  },
  {
    id: 'reports',
    name: 'Reports',
    keywords: 'reports analytics data',
    section: 'Navigation',
    subtitle: 'View reports',
    icon: <BarChart3 className="h-4 w-4" />,
    perform: () => { window.location.href = '/reports'; },
  },
  {
    id: 'support',
    name: 'Support',
    keywords: 'support tickets help',
    section: 'Navigation',
    subtitle: 'Support tickets',
    icon: <HelpCircle className="h-4 w-4" />,
    perform: () => { window.location.href = '/support'; },
  },
  {
    id: 'settings',
    name: 'Settings',
    shortcut: ['g', ','],
    keywords: 'settings preferences',
    section: 'Navigation',
    subtitle: 'App settings',
    icon: <Settings className="h-4 w-4" />,
    perform: () => { window.location.href = '/settings'; },
  },
  {
    id: 'calendar',
    name: 'Calendar',
    shortcut: ['g', 'l'],
    keywords: 'calendar schedule events',
    section: 'Navigation',
    subtitle: 'Open calendar',
    icon: <Calendar className="h-4 w-4" />,
    perform: () => { window.location.href = '/calendar'; },
  },
  // Quick Actions
  {
    id: 'create-shipment',
    name: 'Create Shipment',
    keywords: 'new shipment create',
    section: 'Actions',
    subtitle: 'Open shipments and start a new one',
    icon: <Package className="h-4 w-4" />,
    perform: () => { window.location.href = '/shipments?new=1'; },
  },
  {
    id: 'go-to-shipment',
    name: 'Go to Shipment by Ref…',
    keywords: 'find shipment reference search',
    section: 'Actions',
    subtitle: 'Filter dashboard by shipment reference',
    icon: <Search className="h-4 w-4" />,
    perform: () => {
      const ref = window.prompt('Enter shipment reference (e.g. SHP-IMF-2412-001)');
      if (ref) {
        window.location.href = `/dashboard?q=${encodeURIComponent(ref)}`;
      }
    },
  },
  // Quick Filters (Dashboard)
  {
    id: 'filter-pending',
    name: 'Filter: Pending Shipments',
    keywords: 'filter pending',
    section: 'Filters',
    subtitle: 'Show pending shipments on dashboard',
    icon: <Search className="h-4 w-4" />,
    perform: () => { window.location.href = '/dashboard?status=pending'; },
  },
  {
    id: 'filter-in-transit',
    name: 'Filter: In Transit Shipments',
    keywords: 'filter in transit',
    section: 'Filters',
    subtitle: 'Show in transit shipments on dashboard',
    icon: <Search className="h-4 w-4" />,
    perform: () => { window.location.href = '/dashboard?status=in_transit'; },
  },
  {
    id: 'filter-delivered',
    name: 'Filter: Delivered Shipments',
    keywords: 'filter delivered',
    section: 'Filters',
    subtitle: 'Show delivered shipments on dashboard',
    icon: <Search className="h-4 w-4" />,
    perform: () => { window.location.href = '/dashboard?status=delivered'; },
  },
  {
    id: 'filter-cancelled',
    name: 'Filter: Cancelled Shipments',
    keywords: 'filter cancelled',
    section: 'Filters',
    subtitle: 'Show cancelled shipments on dashboard',
    icon: <Search className="h-4 w-4" />,
    perform: () => { window.location.href = '/dashboard?status=cancelled'; },
  },
  // Theme Section
  {
    id: 'theme-light',
    name: 'Light Mode',
    keywords: 'light theme mode',
    section: 'Theme',
    subtitle: 'Switch to light mode',
    icon: <Sun className="h-4 w-4" />,
    perform: () => { 
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    },
  },
  {
    id: 'theme-dark',
    name: 'Dark Mode',
    keywords: 'dark theme mode',
    section: 'Theme',
    subtitle: 'Switch to dark mode',
    icon: <Moon className="h-4 w-4" />,
    perform: () => { 
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    },
  },
];

// Custom results renderer
function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {item}
          </div>
        ) : (
          <div
            className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
              active
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            {item.icon && (
              <span className={active ? 'text-primary' : 'text-muted-foreground'}>
                {item.icon}
              </span>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{item.name}</span>
              {item.subtitle && (
                <span className="text-xs text-muted-foreground">
                  {item.subtitle}
                </span>
              )}
            </div>
            {item.shortcut?.length ? (
              <div className="ml-auto flex gap-1">
                {item.shortcut.map((sc: string) => (
                  <kbd
                    key={sc}
                    className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {sc}
                  </kbd>
                ))}
              </div>
            ) : null}
          </div>
        )
      }
    />
  );
}

// Main KBar component
function KBarComponent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-[99999] bg-background/80 backdrop-blur-sm p-0">
          <KBarAnimator className="relative mt-[20vh] w-full max-w-[600px] overflow-hidden rounded-lg border bg-card text-card-foreground shadow-2xl">
            <div className="sticky top-0 z-10 border-b bg-card">
              <div className="flex items-center gap-3 px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <KBarSearch className="w-full border-none bg-transparent py-4 text-base outline-none placeholder:text-muted-foreground focus:ring-0" />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <RenderResults />
            </div>
            <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
              <span>
                Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">↵</kbd> to select
              </span>
              <span>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">esc</kbd> to close
              </span>
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
}

// Provider wrapper
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  return (
    <KBarProvider actions={staticActions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

export default CommandPaletteProvider;
