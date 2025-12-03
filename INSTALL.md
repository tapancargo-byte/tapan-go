# 🚀 Quick Installation Guide

## ⚡ Super Fast Setup (5 Minutes)

### Step 1: Install Core Dependencies (2 minutes)

```bash
npm run install:core
```

Or manually:
```bash
npm install @tanstack/react-table @tanstack/react-query
```

### Step 2: Database Setup (2 minutes)

1. Open [Supabase SQL Editor](https://app.supabase.com)
2. Copy **entire content** of `supabase/migrations/20251201_add_role_and_rls.sql`
3. Paste and execute in SQL Editor
4. Set your admin user:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```

### Step 3: Environment Variables (1 minute)

Make sure `.env.local` has these (required):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Launch! 🚀

```bash
npm run dev
```

Visit `http://localhost:3000/admin` - Should redirect to login ✅

---

## 🎯 What You Have Now

✅ **Security**: Full RBAC, RLS policies, auth middleware  
✅ **Modern UI**: Glassmorphism, animations, advanced tables  
✅ **Real-time**: Live updates, presence detection  
✅ **Customer Portal**: Public tracking at `/track/[awb]`

---

## 🔧 Optional Features

### Background Jobs (Invoice PDFs, Async Processing)

```bash
npm install bullmq ioredis
```

**Setup Redis:**
```bash
# Using Docker
docker run -d -p 6379:6379 redis

# Or use cloud Redis (Upstash, Redis Labs, etc.)
```

**Environment:**
```env
REDIS_URL=redis://localhost:6379
```

### Rate Limiting (API Protection)

```bash
npm install @upstash/ratelimit @upstash/redis
```

**Environment:**
```env
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### WhatsApp Notifications

```bash
npm install twilio
```

**Environment:**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

---

## 📦 All-in-One Installation

Install everything at once:

```bash
npm run install:full
```

This installs both core and optional dependencies.

---

## 🧪 Testing Your Installation

### Test 1: Authentication ✅
```bash
# Visit: http://localhost:3000/admin
# Expected: Redirects to /login (if not logged in)
```

### Test 2: Public Tracking ✅
```bash
# Create a shipment first, then visit:
# http://localhost:3000/track/SHP-12345
# Expected: Beautiful tracking page (no login needed)
```

### Test 3: Real-time Updates ✅
```bash
# 1. Open two browser windows
# 2. Navigate to shipments page in both
# 3. Create/update a shipment in one window
# Expected: Toast notification appears in the other window
```

### Test 4: Advanced Table ✅
```bash
# 1. Update any page to use AdvancedDataTable component
# 2. Test: search, sort, filter, export CSV
# Expected: All features work smoothly
```

---

## 🎨 Using New Components

### Glass Card (Immediate Use)

```tsx
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

<GlassCard variant="elevated">
  <GlassCardContent>
    <h3>Total Revenue</h3>
    <p className="text-3xl font-bold">₹1,45,000</p>
  </GlassCardContent>
</GlassCard>
```

### Advanced Table (Immediate Use)

```tsx
import { AdvancedDataTable } from "@/components/ui/advanced-table";

const columns = [
  { accessorKey: "shipment_ref", header: "Reference" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "origin", header: "Origin" },
];

<AdvancedDataTable
  columns={columns}
  data={shipments}
  searchKey="shipment_ref"
  enableExport
/>
```

### Real-time Updates (Immediate Use)

```tsx
import { useRealtimeShipments } from "@/hooks/useRealtimeShipments";

function ShipmentsPage() {
  const { shipments, loading } = useRealtimeShipments();
  
  return (
    <AdvancedDataTable columns={columns} data={shipments} />
  );
}
```

---

## 🐛 Troubleshooting

### TypeScript Errors: "Cannot find module"

**Issue:** Seeing errors like `Cannot find module '@tanstack/react-table'`

**Solution:**
```bash
# Install the package
npm run install:core

# Restart TypeScript server in VS Code
# Press: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Optional Package Errors

**Issue:** Errors about `bullmq`, `ioredis`, `@upstash/ratelimit`

**Solution:** These are optional! Either:
1. Install them: `npm run install:optional`
2. Or ignore - core features work without them

### Middleware Redirecting Everything

**Issue:** Even public pages redirect to login

**Solution:** Check `PUBLIC_ROUTES` array in `middleware.ts`. Add your route:
```typescript
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/track",  // Add this for tracking pages
];
```

### Real-time Not Working

**Issue:** No live updates appearing

**Solution:**
1. Enable Realtime in Supabase Dashboard → Settings → API
2. Check RLS policies allow SELECT
3. Open browser console for errors

---

## 📚 Next Steps

### Today (1 hour)
1. ✅ Install core dependencies
2. ✅ Run database migration  
3. ✅ Test authentication
4. ✅ Try glass cards on dashboard

### This Week
1. Replace all card components with GlassCard
2. Update main tables to AdvancedDataTable
3. Test public tracking page
4. Add animations to key pages

### Next Week
1. Install optional packages (queues, rate limiting)
2. Configure WhatsApp if needed
3. Deploy to staging
4. Performance testing

---

## 📖 Documentation

- **Quick Start**: `START_HERE.md`
- **Complete Guide**: `FINAL_IMPLEMENTATION_GUIDE.md`
- **Code Examples**: `USAGE_EXAMPLES.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

---

## ✅ Installation Checklist

- [ ] Core dependencies installed (`@tanstack/react-table`, `@tanstack/react-query`)
- [ ] Database migration executed
- [ ] Admin user set
- [ ] Environment variables configured
- [ ] Dev server running
- [ ] Can access `/admin` (redirects to login) ✓
- [ ] Can access `/track/[awb]` (public page) ✓
- [ ] Real-time updates working ✓

**Optional:**
- [ ] Background jobs installed (`bullmq`, `ioredis`)
- [ ] Rate limiting installed (`@upstash/ratelimit`)
- [ ] WhatsApp installed (`twilio`)
- [ ] Redis running (for jobs)
- [ ] Upstash configured (for rate limiting)
- [ ] Twilio configured (for WhatsApp)

---

## 🎉 You're Done!

Your app now has:
- ✅ Enterprise security
- ✅ Modern glassmorphic UI
- ✅ Real-time updates
- ✅ Public customer tracking
- ✅ Production-ready infrastructure

**Time to launch!** 🚀

---

## 💡 Quick Commands Reference

```bash
# Installation
npm run install:core       # Core features only
npm run install:optional   # Optional features
npm run install:full       # Everything
npm run setup              # Interactive installer

# Development
npm run dev                # Start dev server
npm run build              # Production build
npm run start              # Start production server

# Testing
npm run test:smoke         # Run smoke tests
```

---

**Need help?** Check `FINAL_IMPLEMENTATION_GUIDE.md` → Troubleshooting section

**Questions?** All answers are in the documentation files!

**Ready to ship!** 🚢
