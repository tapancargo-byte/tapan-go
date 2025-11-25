# Production Readiness & Feature Roadmap

## 1. Production Readiness Enhancements
These are critical technical improvements needed before going live.

### Security & Authentication
- **Middleware Implementation**: Create `middleware.ts` to protect all `/app/*` and `/api/*` routes (except public tracking/hooks).
- **Role-Based Access Control (RBAC)**: Enforce 'admin' vs 'operator' roles in middleware and API routes.
- **RLS Policies**: Ensure Supabase Row Level Security policies are strict.

### Reliability & Code Quality
- **Input Validation**: Implement `Zod` schemas for all API routes (scans, invoices, customers) to prevent bad data.
- **Error Handling**: Replace `console.error` with a structured logging solution (or at least a standardized error response helper).
- **Type Safety**: Remove `any` types, especially in API error handling.

### Offline Capability
- **Robust Sync Queue**: Improve `lib/offlineScanQueue.ts` to handle batch syncing, retries with exponential backoff, and user feedback (toast notifications on sync).

## 2. Missing Cargo Features
These are functional additions required for a competitive cargo service.

### 🚚 Operations & Logistics
- **Proof of Delivery (POD)**: Add ability to capture a signature or photo when marking a status as "Delivered".
- **Driver Mobile View**: A simplified view for drivers to see assigned deliveries and capture POD.
- **Label Printing**: Generate ZPL or 4x6 PDF labels for thermal printers (Zebra/Brother).
- **Rate Calculator**: A tool to estimate shipping costs based on weight, dimensions, and destination.

### 📢 Customer Experience
- **Public Tracking Page**: A public route (e.g., `/track/[awb]`) where customers can see status without logging in.
- **Customer Portal**: Allow customers to login, view history, download invoices, and book shipments.
- **WhatsApp Business API**: Upgrade from the "Link to Web" MVP to full API integration for automated status updates (Order Received, Out for Delivery, Delivered).

### 💰 Finance & Admin
- **Dashboard Analytics**: Real widgets for "Revenue this Month", "Active Shipments", "Top Customers".
- **Aging Report**: Track overdue invoices.

## 3. Recommended Immediate Next Steps
1.  **Create Middleware**: Secure the application.
2.  **Zod Validation**: secure the `scans` and `invoices` endpoints.
3.  **Public Tracking**: Build a simple tracking page.
