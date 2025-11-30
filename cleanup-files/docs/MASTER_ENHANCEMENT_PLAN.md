# Tapan Go - Master Enhancement Plan

**Goal**: Transition the codebase from a functional MVP to a robust, scalable, and secure production-grade Logistics Management System.

This master plan consolidates all technical, operational, and financial requirements into a phased execution strategy.

---

## Phase 1: The "Ironclad" Foundation (Security & Stability)
*Critical for protecting data and preventing crashes.*

### 1.1 Security & Authentication
- **Middleware Implementation**: Create `middleware.ts` to intercept every request.
    - Enforce Authentication: No access to `/app/*` without a session.
    - **RBAC (Role-Based Access Control)**: Restrict `/admin/*`, `/rates`, and Invoice Deletion to `role='admin'`. Operators see only `/ops` and `/scans`.
- **Supabase RLS (Row Level Security)**: Audit all tables (`shipments`, `invoices`, `customers`) to ensure users can't read/write data they shouldn't.

### 1.2 Data Integrity & Validation
- **Zod Schemas**: Centralize validation logic in `lib/validations`.
    - Apply to all API routes (`POST /api/*`) to prevent corrupt data.
    - Apply to all Client Forms (`react-hook-form`) for consistent UX.
- **Type Safety**: Eliminate `any` types in API responses and database helpers.

### 1.3 DevOps & Quality
- **Error Logging**: Integrate Sentry or a logging service to catch crashes in production.
- **CI/CD**: Set up a GitHub Action to run type checks (`tsc`) and linting on every push.

---

## Phase 2: Core Operations & Logistics
*The heart of the cargo business. Focus on speed and tracking.*

### 2.1 Scanning & Tracking
- **Offline-First Scanner**:
    - Upgrade `lib/offlineScanQueue.ts` to handle batch processing.
    - UI: Add a "Sync Status" indicator (e.g., "5 scans pending upload").
    - **Manifest Mode**: Allow "Group Scanning" where all subsequent scans are added to a specific Manifest ID until closed.
- **Public Tracking Page**:
    - Create `app/track/[awb]/page.tsx`.
    - Publicly accessible (no auth).
    - Shows timeline: `Booked` -> `In Transit` -> `Out for Delivery` -> `Delivered`.

### 2.2 Driver & Delivery
- **Proof of Delivery (POD)**:
    - Add `delivery_proof` column (image URL) and `signee_name` to `shipments`.
    - UI: Mobile-optimized view for drivers to upload a photo/signature upon delivery.
- **Label Printing**:
    - Integrate a library (like `react-to-print` or server-side PDF) to generate 4x6" thermal labels with ZPL support.

---

## Phase 3: Financial Engine (Billing & Rates)
*Turning operations into revenue.*

### 3.1 Advanced Rate Engine
- **Schema Upgrade**:
    - Add `service_type` (Standard, Express, Air).
    - Add `min_weight` and `volumetric_divisor` (e.g., L*W*H / 5000).
- **Calculator UI**:
    - Add a "Quote Calculator" widget for operators to quickly estimate costs before booking.

### 3.2 Invoice & Payments
- **Partial Payments**:
    - Create `invoice_payments` table to track installments.
    - Logic: `Unpaid` -> `Partially Paid` -> `Paid`.
- **Tax Compliance**:
    - Add GST/Tax configuration to `companyConfig.ts`.
    - Display detailed tax breakdown (IGST/SGST/CGST) on Invoice PDFs.
- **Bulk Invoicing**:
    - "Unbilled Shipments" view: Select 50 shipments -> Create 1 Invoice.

---

## Phase 4: Customer Experience (CX)
*Reducing support overhead and empowering clients.*

### 4.1 Customer Portal
- **Self-Service Dashboard**:
    - Route: `/portal`.
    - Auth: Magic Link (Passwordless) via Email.
    - Features: View Shipments, Download Invoices, Statement of Account.

### 4.2 Automated Notifications (WhatsApp)
- **WhatsApp Business API**:
    - Replace "Click to Chat" with server-side API calls.
    - **Triggers**:
        - `Shipment Booked` -> Send Tracking Link.
        - `Out for Delivery` -> Send Driver Name.
        - `Invoice Generated` -> Send PDF.

---

## Phase 5: UI/UX Modernization
*Professional polish and performance.*

### 5.1 High-Performance Data Tables
- **TanStack Table Implementation**:
    - Replace static tables in `Invoices`, `Shipments`, and `Customers`.
    - Enable **Server-Side Pagination** (load 20 rows, not 2000).
    - Enable **Column Sorting** and **Filtering** (Date Ranges, Status).

### 5.2 Dashboard Analytics
- **Real Metrics**:
    - "Revenue MTD" (Month to Date).
    - "Active Deliveries" (Map View).
    - "Top Customers" (by Revenue).

---

## Execution Roadmap

| Phase | Priority | Estimated Timeline | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **1** | **High** | Week 1 | Middleware, RBAC, Zod Validation |
| **2** | **High** | Week 2 | Offline Sync, Public Tracking, POD |
| **3** | **Medium** | Week 3 | Rate Engine, Partial Payments, Tax |
| **4** | **Medium** | Week 4 | Customer Portal, WhatsApp API |
| **5** | **Low** | Week 5 | TanStack Table, Advanced Dashboards |

