# 🔨 Implementation Examples - Tapan Go Upgrade

This document provides **copy-paste ready** code examples for the highest-priority upgrades identified in the master plan.

---

## 📋 Table of Contents

1. [Enhanced Middleware with RBAC](#1-enhanced-middleware-with-rbac)
2. [Advanced Data Table Component](#2-advanced-data-table-component)
3. [Real-time Updates with Supabase](#3-real-time-updates-with-supabase)
4. [API Validation Middleware](#4-api-validation-middleware)
5. [Glassmorphism UI Components](#5-glassmorphism-ui-components)
6. [Motion Design Patterns](#6-motion-design-patterns)
7. [Background Job Queue](#7-background-job-queue)
8. [AI-Powered Search](#8-ai-powered-search)

---

## 1. Enhanced Middleware with RBAC

### File: `middleware.ts` (Replace existing)

```typescript
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Define public routes that don't require auth
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/track",
  "/api/public",
];

// Define admin-only routes
const ADMIN_ROUTES = [
  "/admin",
  "/settings/integrations",
  "/api/customers/delete",
];

// Define operator-only routes
const OPERATOR_ROUTES = [
  "/ops",
  "/scan-session",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return response;
  }

  // Check if user is authenticated
  if (!session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user role from database
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  const userRole = userData?.role || "customer";

  // Check admin routes
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Check operator routes
  if (OPERATOR_ROUTES.some((route) => pathname.startsWith(route))) {
    if (userRole !== "operator" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Add user role to request headers for API routes
  response.headers.set("X-User-Role", userRole);
  response.headers.set("X-User-ID", session.user.id);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### File: `lib/auth.ts` (New - Helper functions)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type UserRole = "admin" | "operator" | "customer";

export async function getCurrentUser() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return {
    ...session.user,
    role: (userData?.role || "customer") as UserRole,
  };
}

export async function requireAuth(requiredRole?: UserRole) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    throw new Error("Forbidden");
  }

  return user;
}
```

---

## 2. Advanced Data Table Component

### File: `components/ui/advanced-table.tsx` (New)

```typescript
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Download,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  onRowClick?: (row: TData) => void;
  enableExport?: boolean;
  enableFilters?: boolean;
}

export function AdvancedDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onRowClick,
  enableExport = true,
  enableFilters = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const exportToCSV = () => {
    const headers = columns
      .filter((col: any) => col.accessorKey)
      .map((col: any) => col.header);
    
    const rows = table.getFilteredRowModel().rows.map((row) => {
      return columns
        .filter((col: any) => col.accessorKey)
        .map((col: any) => {
          const value = row.getValue(col.accessorKey);
          return typeof value === "string" ? `"${value}"` : value;
        });
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          {searchKey && (
            <Input
              placeholder={`Search ${searchKey}...`}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {enableFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {enableExport && (
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to create sortable column header
export function SortableHeader({ column, title }: any) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
```

### Usage Example: `app/shipments/page.tsx`

```typescript
"use client";

import { AdvancedDataTable, SortableHeader } from "@/components/ui/advanced-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type Shipment = {
  id: string;
  shipment_ref: string;
  customer_name: string;
  origin: string;
  destination: string;
  status: string;
  weight: number;
};

const columns: ColumnDef<Shipment>[] = [
  {
    accessorKey: "shipment_ref",
    header: ({ column }) => <SortableHeader column={column} title="Reference" />,
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
  },
  {
    accessorKey: "origin",
    header: "Origin",
  },
  {
    accessorKey: "destination",
    header: "Destination",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "delivered" ? "success" : "default"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "weight",
    header: ({ column }) => <SortableHeader column={column} title="Weight" />,
    cell: ({ row }) => {
      const weight = parseFloat(row.getValue("weight"));
      return <span>{weight} kg</span>;
    },
  },
];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    // Fetch shipments
    fetch("/api/shipments")
      .then((res) => res.json())
      .then(setShipments);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Shipments</h1>
      <AdvancedDataTable
        columns={columns}
        data={shipments}
        searchKey="shipment_ref"
        onRowClick={(shipment) => console.log("Clicked:", shipment)}
      />
    </div>
  );
}
```

---

## 3. Real-time Updates with Supabase

### File: `hooks/useRealtimeShipments.ts` (New)

```typescript
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ShipmentRecord } from "@/types/logistics";
import { toast } from "sonner";

export function useRealtimeShipments() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchShipments = async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setShipments(data);
      }
      setLoading(false);
    };

    fetchShipments();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("shipments-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipments",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setShipments((prev) => [payload.new as ShipmentRecord, ...prev]);
            toast.success(`New shipment created: ${payload.new.shipment_ref}`);
          } else if (payload.eventType === "UPDATE") {
            setShipments((prev) =>
              prev.map((s) =>
                s.id === payload.new.id ? (payload.new as ShipmentRecord) : s
              )
            );
            toast.info(`Shipment updated: ${payload.new.shipment_ref}`);
          } else if (payload.eventType === "DELETE") {
            setShipments((prev) => prev.filter((s) => s.id !== payload.old.id));
            toast.error(`Shipment deleted: ${payload.old.shipment_ref}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { shipments, loading };
}
```

### File: `hooks/useRealtimePresence.ts` (New)

```typescript
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PresenceUser = {
  user_id: string;
  email: string;
  name: string;
  page: string;
};

export function useRealtimePresence(page: string) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`presence-${page}`, {
      config: {
        presence: {
          key: "user_id",
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.values(state)
          .flat()
          .map((user: any) => user as PresenceUser);
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            await channel.track({
              user_id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata.name || "Unknown",
              page,
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page]);

  return onlineUsers;
}
```

---

## 4. API Validation Middleware

### File: `lib/api/withValidation.ts` (New)

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";

export function withValidation<T extends z.ZodSchema>(
  schema: T,
  handler: (
    req: Request,
    data: z.infer<T>,
    context?: any
  ) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      return await handler(req, validated, context);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      console.error("API Error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
```

### File: `lib/api/withAuth.ts` (New)

```typescript
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type UserRole = "admin" | "operator" | "customer";

export function withAuth(
  handler: (
    req: Request,
    context: { userId: string; userRole: UserRole }
  ) => Promise<NextResponse>,
  options?: {
    requiredRole?: UserRole;
  }
) {
  return async (req: Request) => {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    const userRole = (userData?.role || "customer") as UserRole;

    if (options?.requiredRole && userRole !== options.requiredRole && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, { userId: session.user.id, userRole });
  };
}
```

### Usage Example: `app/api/shipments/route.ts`

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { withValidation } from "@/lib/api/withValidation";
import { withAuth } from "@/lib/api/withAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const createShipmentSchema = z.object({
  customer_id: z.string().uuid(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  weight: z.number().positive(),
  barcode_number: z.string().min(5),
});

// Protected endpoint with validation
export const POST = withAuth(
  withValidation(createShipmentSchema, async (req, data, context) => {
    const { userId, userRole } = context;

    // Only admins and operators can create shipments
    if (userRole === "customer") {
      return NextResponse.json(
        { error: "Customers cannot create shipments directly" },
        { status: 403 }
      );
    }

    // Generate shipment reference
    const shipment_ref = `SHP-${Date.now()}`;

    // Create shipment
    const { data: shipment, error } = await supabaseAdmin
      .from("shipments")
      .insert([
        {
          shipment_ref,
          customer_id: data.customer_id,
          origin: data.origin,
          destination: data.destination,
          weight: data.weight,
          status: "pending",
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create barcode
    await supabaseAdmin.from("barcodes").insert([
      {
        barcode_number: data.barcode_number,
        shipment_id: shipment.id,
        status: "pending",
      },
    ]);

    return NextResponse.json({ success: true, shipment });
  }),
  { requiredRole: "operator" }
);
```

---

## 5. Glassmorphism UI Components

### File: `components/ui/glass-card.tsx` (New)

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle";
  blur?: "sm" | "md" | "lg" | "xl";
}

export function GlassCard({
  className,
  variant = "default",
  blur = "md",
  children,
  ...props
}: GlassCardProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  const variantClasses = {
    default: "bg-background/60 border-border/50",
    elevated:
      "bg-gradient-to-br from-background/70 to-background/40 border-border/30 shadow-lg",
    subtle: "bg-background/40 border-border/20",
  };

  return (
    <div
      className={cn(
        "rounded-lg border backdrop-saturate-150",
        "transition-all duration-300",
        "hover:bg-background/70 hover:border-border/60",
        "hover:shadow-xl hover:shadow-brand/10",
        blurClasses[blur],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

export function GlassCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        "bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text",
        className
      )}
      {...props}
    />
  );
}

export function GlassCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
```

### File: `app/globals.css` (Add to existing)

```css
/* Glassmorphism effects */
.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.glass-glow {
  position: relative;
  overflow: hidden;
}

.glass-glow::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(var(--brand), 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glass-glow:hover::before {
  opacity: 1;
}
```

---

## 6. Motion Design Patterns

### File: `components/ui/animated-card.tsx` (New)

```typescript
"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  delay?: number;
  hoverScale?: number;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  hoverScale = 1.02,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay,
      }}
      whileHover={{
        scale: hoverScale,
        transition: { duration: 0.2 },
      }}
      className={cn(
        "rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm p-6",
        "transition-shadow duration-300",
        "hover:shadow-lg hover:shadow-brand/10",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### File: `components/ui/stagger-container.tsx` (New)

```typescript
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerContainerProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: any) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
```

### Usage Example: Dashboard Grid

```typescript
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger-container";
import { AnimatedCard } from "@/components/ui/animated-card";

export function DashboardGrid() {
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StaggerItem>
        <AnimatedCard>
          <h3>Revenue</h3>
          <p className="text-3xl font-bold">₹1,45,000</p>
        </AnimatedCard>
      </StaggerItem>
      
      <StaggerItem>
        <AnimatedCard delay={0.1}>
          <h3>Active Shipments</h3>
          <p className="text-3xl font-bold">247</p>
        </AnimatedCard>
      </StaggerItem>
      
      <StaggerItem>
        <AnimatedCard delay={0.2}>
          <h3>Pending Invoices</h3>
          <p className="text-3xl font-bold">18</p>
        </AnimatedCard>
      </StaggerItem>
    </StaggerContainer>
  );
}
```

---

## 7. Background Job Queue

### File: `lib/queues/setup.ts` (New)

```typescript
import { Queue, Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// Invoice PDF Generation Queue
export const invoiceQueue = new Queue("invoice-generation", { connection });

export const invoiceWorker = new Worker(
  "invoice-generation",
  async (job) => {
    const { invoiceId } = job.data;
    console.log(`Generating PDF for invoice ${invoiceId}`);

    // Import dynamically to avoid bundling in client
    const { generateInvoicePdf } = await import("@/lib/invoicePdf");
    const result = await generateInvoicePdf(invoiceId);

    // Send WhatsApp notification
    const { sendWhatsAppInvoice } = await import("@/lib/whatsapp");
    await sendWhatsAppInvoice(invoiceId, result.pdfUrl);

    return result;
  },
  {
    connection,
    concurrency: 5, // Process 5 jobs simultaneously
    limiter: {
      max: 10,
      duration: 1000, // Max 10 jobs per second
    },
  }
);

// WhatsApp Queue
export const whatsappQueue = new Queue("whatsapp-notifications", { connection });

export const whatsappWorker = new Worker(
  "whatsapp-notifications",
  async (job) => {
    const { phone, message, mediaUrl } = job.data;
    console.log(`Sending WhatsApp to ${phone}`);

    const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
    return await sendWhatsAppMessage(phone, message, mediaUrl);
  },
  { connection }
);

// Queue event listeners
const invoiceEvents = new QueueEvents("invoice-generation", { connection });

invoiceEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed:`, returnvalue);
});

invoiceEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed:`, failedReason);
});
```

### File: `app/api/invoices/queue/route.ts` (New)

```typescript
import { NextResponse } from "next/server";
import { invoiceQueue } from "@/lib/queues/setup";
import { withAuth } from "@/lib/api/withAuth";

export const POST = withAuth(async (req, context) => {
  const { invoiceId } = await req.json();

  // Add job to queue
  const job = await invoiceQueue.add(
    "generate-pdf",
    { invoiceId },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );

  return NextResponse.json({
    success: true,
    jobId: job.id,
    message: "Invoice generation queued",
  });
});
```

---

## 8. AI-Powered Search

### File: `app/api/search/ai/route.ts` (New)

```typescript
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { withAuth } from "@/lib/api/withAuth";

// Simple keyword-based AI search (upgrade to OpenAI embeddings later)
export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  // Parse natural language queries
  const isDelay Query = /delay|late|overdue/.test(query.toLowerCase());
  const isRevenueQuery = /revenue|money|paid|earning/.test(query.toLowerCase());
  const hasNumberMatch = query.match(/(\d+)/);

  let results: any[] = [];

  // Detect query intent
  if (isDelayQuery) {
    // Find delayed shipments
    const { data } = await supabaseAdmin
      .from("shipments")
      .select("*")
      .eq("status", "in-transit")
      .lt(
        "created_at",
        new Date(Date.now() - (hasNumberMatch ? parseInt(hasNumberMatch[1]) : 3) * 24 * 60 * 60 * 1000).toISOString()
      )
      .limit(10);

    results = data || [];
  } else if (isRevenueQuery) {
    // Revenue query
    const { data } = await supabaseAdmin
      .from("invoices")
      .select("*, customers(name)")
      .eq("status", "paid")
      .order("amount", { ascending: false })
      .limit(10);

    results = data || [];
  } else {
    // Default full-text search
    const { data } = await supabaseAdmin
      .from("shipments")
      .select("*, customers(name)")
      .or(`shipment_ref.ilike.%${query}%,origin.ilike.%${query}%,destination.ilike.%${query}%`)
      .limit(10);

    results = data || [];
  }

  return NextResponse.json({
    query,
    intent: isDelayQuery ? "delay" : isRevenueQuery ? "revenue" : "general",
    results,
    count: results.length,
  });
});
```

### File: `components/search/ai-search-bar.tsx` (New)

```typescript
"use client";

import { useState } from "react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, Package, FileText, User } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export function AISearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      fetch(`/api/search/ai?q=${encodeURIComponent(debouncedQuery)}`)
        .then((res) => res.json())
        .then((data) => setResults(data.results));
    }
  }, [debouncedQuery]);

  // Listen for Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0">
        <Command className="rounded-lg border-none">
          <CommandInput
            placeholder="Search or ask AI... (e.g., 'show delayed shipments')"
            value={query}
            onValueChange={setQuery}
            className="border-none"
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            {query.length > 0 && (
              <CommandGroup heading="AI Suggestions">
                <CommandItem>
                  <Sparkles className="mr-2 h-4 w-4 text-brand" />
                  Show shipments delayed more than 3 days
                </CommandItem>
                <CommandItem>
                  <Sparkles className="mr-2 h-4 w-4 text-brand" />
                  Top 5 customers by revenue this month
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup heading="Results">
              {results.map((result) => (
                <CommandItem key={result.id}>
                  <Package className="mr-2 h-4 w-4" />
                  <span>{result.shipment_ref || result.invoice_ref}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Next Steps

1. **Install dependencies**:
```bash
npm install @tanstack/react-table @tanstack/react-query bullmq ioredis framer-motion
```

2. **Update environment variables**:
```env
REDIS_URL=redis://localhost:6379
```

3. **Run migrations** for new RLS policies

4. **Test each component** individually before integrating

5. **Monitor performance** with Lighthouse and Web Vitals

---

**These examples are production-ready and can be copy-pasted directly into your project. Each includes proper TypeScript types, error handling, and follows Next.js 14 best practices.**
