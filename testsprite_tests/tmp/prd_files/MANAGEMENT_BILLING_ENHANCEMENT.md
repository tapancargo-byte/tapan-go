# Management & Billing Enhancement Plan

## 1. UX/UI Deep Dive & Remediation
**Current State Analysis**:
- **Data Handling**: `app/invoices/page.tsx` loads *all* invoices into memory. This will crash the browser once you hit ~1,000 records.
- **Table Component**: Uses a raw HTML `<table>` structure. It lacks column sorting, density control, and column visibility toggles.
- **Filtering**: Only supports simple text search. No Date Range filter (critical for billing cycles).

### Recommended UI Enhancements:
- **Implement TanStack Table**: Replace manual tables with a reusable `<DataTable />` component using `components/ui/table.tsx` for rendering and TanStack Table for logic.
    - **Features**: Server-side pagination, sortable columns (Amount, Due Date), and row selection.
- **Date Range Picker**: Implement a `DateRangePicker` component using `components/ui/calendar.tsx` and `components/ui/popover.tsx` to filter invoices by "Last Month", "This Quarter", etc.
- **Status Badges**: Upgrade the current color-coded text to interactive `components/ui/badge.tsx` elements that can be clicked to quick-filter.

## 2. Rate Engine Overhaul (`/rates`)
**Current State**: Basic `origin` -> `destination` lookup with `base_fee` + `per_kg`.
**Missing**: Volumetric weight logic and Service Types (Air vs Surface).

### Implementation Plan:
1.  **Database**:
    ```sql
    ALTER TABLE rates ADD COLUMN service_type text DEFAULT 'standard';
    ALTER TABLE rates ADD COLUMN min_weight numeric DEFAULT 0;
    ALTER TABLE rates ADD COLUMN volumetric_divisor numeric DEFAULT 5000;
    ```
2.  **UI (`app/rates/page.tsx`)**:
    - Add a **Tabs** component (`components/ui/tabs.tsx`) to switch between `Standard`, `Express`, and `Special` rates.
    - Add a **Test Calculator** sidebar: Inputs for `L x W x H` and `Weight` to preview the calculated cost in real-time.

## 3. Advanced Invoice Workflow
**Current State**: Simple "Paid/Pending" toggle.
**Missing**: Partial payments, Tax breakdown, and Audit trail.

### Implementation Plan:
1.  **Partial Payments Ledger**:
    - Create a new table `invoice_payments` linked to `invoices`.
    - UI: Add a "Record Payment" Sheet (`components/ui/sheet.tsx`) that slides out from the right.
    - Inputs: `Amount`, `Date` (`calendar`), `Reference #`, `Payment Mode` (`select`).
2.  **Invoice PDF**:
    - Enhance `lib/invoicePdf.ts` to include a "Payment History" table at the bottom of the PDF if partial payments exist.
    - Show **IGST/CGST/SGST** breakdown if the company config enables tax.

## 4. Customer Portal (Self-Service)
**Current State**: None.
**Goal**: Reduce support calls by 80%.

### Implementation Plan:
1.  **Route**: Create `/portal/login` and `/portal/dashboard`.
2.  **Auth**: distinct from Admin auth. Use "Magic Link" to email.
3.  **Dashboard Components**:
    - **Stats Cards**: "Unpaid Invoices", "Active Shipments".
    - **Download Center**: A simple list of recent Invoices with a [Download PDF] button.

## 5. Immediate Technical Debt Fixes
1.  **Zod Schemas**: Move `invoiceSchema` and `customerSchema` to `lib/validations` so they can be shared between Client Forms and Server Actions.
2.  **Optimistic Updates**: When changing an invoice status, update the UI immediately before the Supabase call completes to make the app feel "snappy".

## 6. Supabase & MCP Integration
Since we cannot directly access the database via MCP currently, we will enforce these enhancements via **Migration Scripts**:
- Create a standardized migration folder `supabase/migrations`.
- Script 1: `01_add_service_type_to_rates.sql`
- Script 2: `02_create_invoice_payments_table.sql`
