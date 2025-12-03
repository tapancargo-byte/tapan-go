# 🔧 Installation Guide - Tapan Go Upgrades

## Step 1: Install Required Dependencies

Run this command to install all new packages:

```bash
npm install @tanstack/react-table @tanstack/react-query framer-motion sonner
```

### Package Details

- **@tanstack/react-table** - Advanced data tables with sorting, filtering, pagination
- **@tanstack/react-query** - Server state management and caching
- **framer-motion** - Animation library (already installed)
- **sonner** - Toast notifications (already installed)

## Step 2: Verify Existing Packages

These should already be installed (verify in package.json):
- ✅ `zod` - Schema validation
- ✅ `@supabase/ssr` - Supabase SSR client
- ✅ `@supabase/supabase-js` - Supabase client
- ✅ `next-themes` - Theme management

## Step 3: Environment Variables

Make sure these are set in your `.env.local`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Redis for rate limiting and queues
REDIS_URL=redis://localhost:6379

# Optional: For production monitoring
SENTRY_DSN=your_sentry_dsn
```

## Step 4: Database Setup

Run these SQL commands in your Supabase SQL Editor:

### 1. Add `role` column to users table (if not exists)

```sql
-- Add role column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users (optional - set your admin)
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-admin@email.com';
```

### 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcodes ENABLE ROW LEVEL SECURITY;

-- Example policy: Operators see shipments from their warehouse
CREATE POLICY "operators_view_warehouse" ON shipments
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'operator' 
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- Admins see everything
CREATE POLICY "admins_view_all" ON shipments
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

## Step 5: Test the Implementation

### Test 1: Check Middleware

```bash
# Start dev server
npm run dev

# Try accessing protected route without login
# Should redirect to /login
curl http://localhost:3000/shipments
```

### Test 2: Test Real-time Updates

1. Open two browser windows
2. Create a shipment in one
3. Should see toast notification in the other

### Test 3: Test Advanced Table

Navigate to any page using the new table component (e.g., /shipments)
- Try searching
- Try sorting columns
- Try exporting to CSV
- Try changing page size

## Step 6: TypeScript Check

Run type checking to ensure everything compiles:

```bash
npm run type-check
```

If you see errors about `@tanstack/react-table`, make sure it's installed:

```bash
npm install @tanstack/react-table
```

## What's Been Implemented

### ✅ Security Layer
- **Enhanced middleware** with RBAC (`middleware.ts`)
- **Auth helpers** (`lib/auth.ts`)
- **API middleware** (`lib/api/withAuth.ts`, `lib/api/withValidation.ts`)

### ✅ UI Components
- **Glass Card** (`components/ui/glass-card.tsx`) - Glassmorphism effects
- **Animated Card** (`components/ui/animated-card.tsx`) - Motion design
- **Stagger Container** (`components/ui/stagger-container.tsx`) - List animations
- **Advanced Table** (`components/ui/advanced-table.tsx`) - Full-featured data table

### ✅ Real-time Hooks
- **useRealtimeShipments** (`hooks/useRealtimeShipments.ts`) - Live shipment updates
- **useRealtimePresence** (`hooks/useRealtimePresence.ts`) - Online users

## Next Steps

### Immediate (Today)
1. Install dependencies: `npm install @tanstack/react-table @tanstack/react-query`
2. Set up environment variables
3. Run database migrations (add `role` column)
4. Test middleware by accessing protected routes

### This Week
1. Update existing pages to use new components
2. Implement real-time updates in dashboard
3. Add glassmorphism to cards
4. Test RBAC with different user roles

### Next Week
1. Create unauthorized page (`app/unauthorized/page.tsx`)
2. Add more RLS policies
3. Implement rate limiting
4. Add error monitoring (Sentry)

## Troubleshooting

### Problem: "Cannot find module '@tanstack/react-table'"
**Solution**: Run `npm install @tanstack/react-table`

### Problem: "Middleware redirecting to /login for public routes"
**Solution**: Check that `/` is in PUBLIC_ROUTES array in `middleware.ts`

### Problem: "Real-time not working"
**Solution**: 
1. Check Supabase Realtime is enabled in project settings
2. Verify RLS policies allow SELECT
3. Check browser console for connection errors

### Problem: "TypeScript errors in advanced-table.tsx"
**Solution**: This is normal until `@tanstack/react-table` is installed

## Support

If you encounter issues:
1. Check the console for errors
2. Verify all dependencies are installed
3. Ensure environment variables are set
4. Check Supabase project is running
5. Refer to `PRODUCTION_UPGRADE_MASTER_PLAN.md` for detailed explanations

## Files Created

```
✅ middleware.ts (updated)
✅ lib/auth.ts
✅ lib/api/withAuth.ts
✅ lib/api/withValidation.ts
✅ components/ui/glass-card.tsx
✅ components/ui/animated-card.tsx
✅ components/ui/stagger-container.tsx
✅ components/ui/advanced-table.tsx
✅ hooks/useRealtimeShipments.ts
✅ hooks/useRealtimePresence.ts
```

## Ready to Use!

Once dependencies are installed, you can start using these components:

```tsx
// Example: Using AdvancedDataTable
import { AdvancedDataTable } from "@/components/ui/advanced-table";

<AdvancedDataTable
  columns={columns}
  data={data}
  searchKey="shipment_ref"
  enableExport
/>
```

```tsx
// Example: Using GlassCard
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";

<GlassCard variant="elevated">
  <GlassCardHeader>
    <GlassCardTitle>Revenue</GlassCardTitle>
  </GlassCardHeader>
  <GlassCardContent>
    ₹1,45,000
  </GlassCardContent>
</GlassCard>
```

```tsx
// Example: Using real-time hooks
import { useRealtimeShipments } from "@/hooks/useRealtimeShipments";

const { shipments, loading } = useRealtimeShipments();
```

**You're now ready to build production-grade features!** 🚀
