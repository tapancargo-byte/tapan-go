# 📖 Usage Examples - New Components

This guide shows how to use the newly implemented components in your existing pages.

---

## Example 1: Upgrade Dashboard with Glassmorphism + Animations

**Before**: `app/page.tsx` (existing)

```tsx
// Old approach with basic cards
<div className="grid gap-6 md:grid-cols-3">
  <Card>
    <CardHeader>
      <CardTitle>Revenue</CardTitle>
    </CardHeader>
    <CardContent>
      <p>₹1,45,000</p>
    </CardContent>
  </Card>
</div>
```

**After**: Enhanced with glassmorphism + stagger animations

```tsx
"use client";

import { StaggerContainer, StaggerItem } from "@/components/ui/stagger-container";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";
import { TrendingUp, Package, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
      <StaggerItem>
        <GlassCard variant="elevated" className="hover:scale-105 transition-transform">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>Total Revenue</GlassCardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold">₹1,45,000</p>
            <p className="text-sm text-muted-foreground mt-2">
              +12.5% from last month
            </p>
          </GlassCardContent>
        </GlassCard>
      </StaggerItem>

      <StaggerItem>
        <GlassCard variant="elevated" className="hover:scale-105 transition-transform">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>Active Shipments</GlassCardTitle>
              <Package className="h-5 w-5 text-blue-500" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold">247</p>
            <p className="text-sm text-muted-foreground mt-2">
              18 out for delivery
            </p>
          </GlassCardContent>
        </GlassCard>
      </StaggerItem>

      <StaggerItem>
        <GlassCard variant="elevated" className="hover:scale-105 transition-transform">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>Pending Issues</GlassCardTitle>
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-3xl font-bold">5</p>
            <p className="text-sm text-muted-foreground mt-2">
              3 require attention
            </p>
          </GlassCardContent>
        </GlassCard>
      </StaggerItem>
    </StaggerContainer>
  );
}
```

**Result**: Cards fade in with stagger effect, glassmorphic blur, hover scale animation

---

## Example 2: Upgrade Shipments Page with Advanced Table + Real-time

**File**: `app/shipments/page.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { AdvancedDataTable, SortableHeader } from "@/components/ui/advanced-table";
import { useRealtimeShipments } from "@/hooks/useRealtimeShipments";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardPageLayout from "@/components/dashboard/layout";
import { Package } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface Shipment {
  id: string;
  shipment_ref: string;
  customer_id: string;
  origin: string;
  destination: string;
  weight: number;
  status: string;
  created_at: string;
}

const columns: ColumnDef<Shipment>[] = [
  {
    accessorKey: "shipment_ref",
    header: ({ column }) => <SortableHeader column={column} title="Reference" />,
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
    accessorKey: "weight",
    header: ({ column }) => <SortableHeader column={column} title="Weight" />,
    cell: ({ row }) => {
      const weight = parseFloat(row.getValue("weight"));
      return <span>{weight.toFixed(1)} kg</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        delivered: "default",
        "in-transit": "secondary",
        pending: "outline",
      };
      return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <SortableHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString();
    },
  },
];

export default function ShipmentsPage() {
  const router = useRouter();
  const { shipments, loading, error } = useRealtimeShipments();
  const { onlineUsers, count } = useRealtimePresence("shipments");

  if (loading) {
    return (
      <DashboardPageLayout
        header={{
          title: "Shipments",
          description: "Manage and track all shipments",
          icon: Package,
        }}
      >
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardPageLayout>
    );
  }

  if (error) {
    return (
      <DashboardPageLayout
        header={{
          title: "Shipments",
          description: "Manage and track all shipments",
          icon: Package,
        }}
      >
        <div className="text-center py-12">
          <p className="text-destructive">Error loading shipments: {error.message}</p>
        </div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Shipments",
        description: "Manage and track all shipments",
        icon: Package,
      }}
    >
      {/* Online users indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 3).map((user) => (
            <Avatar key={user.user_id} className="border-2 border-background h-8 w-8">
              <AvatarFallback className="text-xs">
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span>
          {count} {count === 1 ? "user" : "users"} online
        </span>
      </div>

      {/* Advanced table with real-time data */}
      <AdvancedDataTable
        columns={columns}
        data={shipments}
        searchKey="shipment_ref"
        searchPlaceholder="Search by reference, origin, or destination..."
        onRowClick={(shipment) => router.push(`/shipments/${shipment.id}`)}
        enableExport
        enableFilters
        enablePagination
        pageSize={20}
      />
    </DashboardPageLayout>
  );
}
```

**Features Added**:
- ✅ Real-time shipment updates (see changes instantly)
- ✅ Online presence indicator (see who else is viewing)
- ✅ Advanced table (sort, filter, search, export)
- ✅ Click row to view details
- ✅ Loading and error states

---

## Example 3: Protected API Route

**File**: `app/api/shipments/create/route.ts`

```tsx
import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/withAuth";
import { withValidation } from "@/lib/api/withValidation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const createShipmentSchema = z.object({
  customer_id: z.string().uuid(),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  weight: z.number().positive("Weight must be positive"),
  barcode_number: z.string().min(5, "Barcode must be at least 5 characters"),
});

export const POST = withAuth(
  withValidation(createShipmentSchema, async (req, data, context) => {
    const { userId, userRole } = context;

    // Only admins and operators can create shipments
    if (userRole === "customer") {
      return NextResponse.json(
        {
          error: "Customers cannot create shipments directly",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Generate shipment reference
    const shipment_ref = `SHP-${Date.now()}`;

    try {
      // Create shipment
      const { data: shipment, error: shipmentError } = await supabaseAdmin
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

      if (shipmentError) throw shipmentError;

      // Create barcode
      const { error: barcodeError } = await supabaseAdmin
        .from("barcodes")
        .insert([
          {
            barcode_number: data.barcode_number,
            shipment_id: shipment.id,
            status: "pending",
          },
        ]);

      if (barcodeError) throw barcodeError;

      return NextResponse.json({
        success: true,
        shipment,
        message: "Shipment created successfully",
      });
    } catch (error: any) {
      console.error("Error creating shipment:", error);
      return NextResponse.json(
        {
          error: error.message || "Failed to create shipment",
          code: "CREATE_FAILED",
        },
        { status: 500 }
      );
    }
  }),
  { allowedRoles: ["admin", "operator"] }
);
```

**Features**:
- ✅ Automatic authentication check
- ✅ Role-based authorization
- ✅ Zod validation with typed data
- ✅ User context (userId, userRole)
- ✅ Standardized error responses

---

## Example 4: Using Auth in Server Components

**File**: `app/admin/page.tsx`

```tsx
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";

export default async function AdminPage() {
  // Require admin role, will throw if not admin
  let user;
  try {
    user = await requireAuth("admin");
  } catch (error) {
    redirect("/unauthorized");
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <GlassCard variant="elevated">
        <GlassCardHeader>
          <GlassCardTitle>Welcome, {user.name || user.email}</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <p>Role: {user.role}</p>
          <p>User ID: {user.id}</p>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
```

---

## Example 5: Animated Page Transition

**File**: `app/layout.tsx` (add to existing)

```tsx
"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Then wrap children in root layout
<PageTransition>{children}</PageTransition>
```

---

## Example 6: Real-time Presence Badge

**Component**: `components/presence-badge.tsx`

```tsx
"use client";

import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PresenceBadgeProps {
  page: string;
}

export function PresenceBadge({ page }: PresenceBadgeProps) {
  const { onlineUsers, count } = useRealtimePresence(page);

  if (count === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 5).map((user) => (
            <Tooltip key={user.user_id}>
              <TooltipTrigger>
                <Avatar className="border-2 border-background h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name || user.email}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {count} online
        </span>
      </div>
    </TooltipProvider>
  );
}
```

**Usage**:
```tsx
import { PresenceBadge } from "@/components/presence-badge";

<PresenceBadge page="dashboard" />
```

---

## Common Patterns

### Pattern 1: Protected Page with Loading State

```tsx
import { requireAuth } from "@/lib/auth";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ProtectedPage() {
  const user = await requireAuth("operator");

  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <YourContent user={user} />
    </Suspense>
  );
}
```

### Pattern 2: Conditional UI Based on Role

```tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function RoleBasedUI() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setRole(data?.role || "customer");
    };

    getRole();
  }, []);

  if (role === "admin") {
    return <AdminControls />;
  }

  if (role === "operator") {
    return <OperatorControls />;
  }

  return <CustomerView />;
}
```

### Pattern 3: Optimistic Updates with Real-time

```tsx
"use client";

import { useRealtimeShipments } from "@/hooks/useRealtimeShipments";
import { useState } from "react";

export function ShipmentList() {
  const { shipments, setShipments } = useRealtimeShipments();

  const createShipment = async (data: any) => {
    // Optimistically add to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticShipment = { id: tempId, ...data, status: "pending" };
    setShipments(prev => [optimisticShipment, ...prev]);

    try {
      // Make API call
      const res = await fetch("/api/shipments/create", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const { shipment } = await res.json();

      // Replace temp with real data
      setShipments(prev =>
        prev.map(s => s.id === tempId ? shipment : s)
      );
    } catch (error) {
      // Revert on error
      setShipments(prev => prev.filter(s => s.id !== tempId));
      toast.error("Failed to create shipment");
    }
  };

  return <YourUI shipments={shipments} onCreate={createShipment} />;
}
```

---

## Quick Reference

### Available Components

```tsx
// Glassmorphism
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter } from "@/components/ui/glass-card";

// Animations
import { AnimatedCard, FadeIn, ScaleIn } from "@/components/ui/animated-card";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger-container";

// Data Table
import { AdvancedDataTable, SortableHeader } from "@/components/ui/advanced-table";

// Hooks
import { useRealtimeShipments } from "@/hooks/useRealtimeShipments";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";

// Auth (Server-side only)
import { getCurrentUser, requireAuth, hasPermission } from "@/lib/auth";

// API Middleware
import { withAuth } from "@/lib/api/withAuth";
import { withValidation } from "@/lib/api/withValidation";
```

---

**These examples show production-ready patterns you can copy and adapt for your needs!** 🚀
