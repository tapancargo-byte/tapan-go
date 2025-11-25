# Tapan Go – Logistics & Cargo Management Dashboard

Tapan Go is a logistics and cargo management dashboard built on **Next.js 14** and **React 19**. It is designed as an operations console for managing:

- Warehouse capacity and health
- Shipments and inventory
- Customer accounts and invoices
- Air cargo manifests
- Barcode-based shipment tracking
- Real-time notifications and in-app chat

The application now uses **Supabase** as a backend for core logistics entities (shipments, barcodes, manifests, invoices, warehouses, inventory, customers) and server-side APIs, but it is intended to run as an **internal operations tool** behind your own network or proxy (see [Operations & Security](#operations--security)).

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
  - [High-Level Flow](#high-level-flow)
  - [Core Layout & Shell](#core-layout--shell)
  - [Routing & Pages](#routing--pages)
- [Logistics Domain Model](#logistics-domain-model)
  - [Warehouses](#warehouses)
  - [Shipments](#shipments)
  - [Inventory](#inventory)
  - [Customers](#customers)
  - [Invoices](#invoices)
  - [Air Cargo Manifests](#air-cargo-manifests)
  - [Barcodes](#barcodes)
  - [Dashboard Metrics & Analytics](#dashboard-metrics--analytics)
  - [Chat & Notifications](#chat--notifications)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
  - [Top-Level Layout](#top-level-layout)
  - [Key Directories](#key-directories)
- [Environment & Configuration](#environment--configuration)
  - [Supabase Environment Variables](#supabase-environment-variables)
  - [Next.js / TypeScript / Tooling](#nextjs--typescript--tooling)
- [Operations & Security](#operations--security)
  - [Internal-only deployment](#internal-only-deployment)
  - [Key handling](#key-handling)
  - [Future auth & RLS](#future-auth--rls)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Dev Server](#running-the-dev-server)
  - [Build & Production](#build--production)
  - [Linting](#linting)
- [Working With the Codebase](#working-with-the-codebase)
  - [Path Aliases](#path-aliases)
  - [UI Components & Styling](#ui-components--styling)
  - [Adding a New Route / Page](#adding-a-new-route--page)
  - [Extending the Logistics Domain](#extending-the-logistics-domain)
- [Future Work & Supabase Integration](#future-work--supabase-integration)
- [License](#license)

---

## Features

### Core Logistics Operations

- **Dashboard Overview (/)**
  - High-level widgets for:
    - Warehouse capacity utilization
    - Items in transit
    - Warehouse health
  - Time-series charts (weekly/monthly/yearly) for revenue, shipments, distance.
  - Rebel ranking and security status panels.

- **Warehouse Management (/warehouse)**
  - Grid of warehouses showing:
    - Location and operational status
    - Capacity used, items stored, items in transit
    - Staff count, number of docks
    - Last updated timestamp
  - Search by warehouse name or location.

- **Shipment Tracking (/shipments)**
  - Table of shipments with:
    - Shipment ID, customer, origin, destination
    - Weight, status, and progress bar
  - Text search by shipment ID or customer.
  - Status filter (delivered, in-transit, pending, at-warehouse, etc.).

- **Inventory Management (/inventory)**
  - Inventory table with:
    - SKU, description, location
    - Current stock, minimum stock level
    - Computed stock status (OK / LOW / CRITICAL)
    - Last updated timestamp
  - Location filter and search by SKU or description.
  - Summary cards for total SKUs, low stock, critical stock.

### Management & Billing

- **Customers (/customers)**
  - Customer cards showing:
    - Name, ID, status (active/inactive)
    - Email, phone, city
    - Total shipment count and total revenue
  - Search by name, email, or customer ID.

- **Invoices (/invoices)**
  - Invoices table with:
    - Invoice ID, customer name
    - Amount, status (paid/pending/overdue)
    - Due date, related shipment count
  - Search by invoice ID or customer name.
  - Status filter with color-coded badges.

### Extended Operations

- **Aircargo Manifesto (/aircargo)**
  - List of air cargo manifests, each showing:
    - Reference code and manifest ID
    - Origin, destination, airline code
    - Manifest date, estimated delivery
    - Total weight, pieces, and shipment count
    - Status (scheduled, dispatched, in-transit, at-terminal, delivered)
  - Search by manifest ID, reference, origin, or destination.
  - Status filter for manifest status.

- **Barcode Tracking (/barcodes)**
  - End-to-end barcode management:
    - Search by barcode number, shipment ID, customer, or route.
    - Table of active barcodes with:
      - Barcode number, shipment ID
      - Customer name, origin → destination
      - Status, last scanned date, weight
    - Inline filter and clear actions.
  - Integrated scanner UI (`BarcodeScanner` component).
  - Barcode generation UI (`BarcodeGenerator` component) for creating new barcodes.

### System & Analytics

- **Reports & Analytics (/reports)**
  - Tabbed analytics view (`overview`, `revenue`, `warehouse`, `performance`).
  - Uses **Recharts** for visualizations:
    - Bar chart for revenue vs shipments by month.
    - Pie chart for warehouse distribution by location.
    - Line chart for on-time vs delayed shipments by week.

- **Settings (/settings)**
  - Tabs for `general`, `notifications`, `security`, `integrations`.
  - UI for:
    - Organization profile (name, email, phone, address).
    - Display settings (dark mode, compact view).
    - Notification preferences (shipments, warehouse, invoices, daily summary).
    - Security settings (password update, two-factor authentication toggle).
    - Integration placeholders (email, SMS, payment gateway, GPS tracking).

### Communication & UX

- **Chat**
  - In-app chat module with mock conversations and users.
  - Right-rail chat on desktop (in global layout).
  - Floating mobile chat with drawer on small screens.

- **Notifications & Widget**
  - Global notifications sidebar showing shipment/warehouse events.
  - Location widget displaying current hub, timezone, weather, and date.

---

## Architecture Overview

### High-Level Flow

The app is built using **Next.js App Router** (`app/` directory) with a single global layout and multiple feature pages:

1. User navigates to a route (e.g. `/shipments`).
2. **`app/layout.tsx`** provides the global HTML shell, sidebar, mobile header, right-rail widget + notifications + chat, and wraps all pages.
3. Each page (e.g. `app/shipments/page.tsx`) uses **`DashboardPageLayout`** to define its header and content.
4. Components in `components/dashboard/` and `components/ui/` render cards, tables, badges, charts, and forms.
5. Data is pulled from **`mock.json`** (and `data/chat-mock.ts` for chat) and mapped into typed interfaces (where defined).

### Core Layout & Shell

- **`app/layout.tsx`**
  - Imports global styles (`app/globals.css`).
  - Loads fonts via `next/font` (Google `Roboto_Mono` and local `Rebels-Fett.woff2`).
  - Wraps the app with:
    - `V0Provider` (from `lib/v0-context`).
    - `SidebarProvider` (from `components/ui/sidebar`).
  - Defines a 3-column desktop grid:
    - Left: `DashboardSidebar` (navigation and account card).
    - Center: route-specific content (`{children}`).
    - Right: sticky column with `Widget`, `Notifications`, and `Chat`.
  - On mobile:
    - `MobileHeader` is shown at the top.
    - `MobileChat` provides a floating CTA and drawer.
  - Sets **Next.js metadata** (title, description, generator).

- **`components/dashboard/layout/index.tsx`**
  - Exports `DashboardPageLayout` (also aliased as `DashboardLayout`).
  - Takes a `header` prop with `title`, `description`, and `icon` component.
  - Renders a sticky header bar plus a content area with consistent padding and ring styling.

### Routing & Pages

The app uses the App Router with the following primary routes (each with a `page.tsx`):

- `/` → `app/page.tsx` – Dashboard overview
- `/aircargo` → `app/aircargo/page.tsx` – Air cargo manifests
- `/barcodes` → `app/barcodes/page.tsx` – Barcode tracking and scanner
- `/customers` → `app/customers/page.tsx` – Customer accounts
- `/inventory` → `app/inventory/page.tsx` – Inventory & stock
- `/invoices` → `app/invoices/page.tsx` – Billing & invoices
- `/reports` → `app/reports/page.tsx` – Analytics
- `/settings` → `app/settings/page.tsx` – System settings
- `/shipments` → `app/shipments/page.tsx` – Shipment tracking
- `/warehouse` → `app/warehouse/page.tsx` – Warehouse management

There are currently **no API routes** (`app/**/route.ts`) defined; the app consumes only local mock data.

Navigation is driven by **`components/dashboard/sidebar/index.tsx`**, which defines three navigation groups:

- **Core Operations**: Dashboard, Warehouse, Shipments, Inventory
- **Management & Billing**: Customers, Invoices, Aircargo Manifesto, Barcode Tracking
- **System**: Reports & Analytics, Settings

---

## Logistics Domain Model

All logistics entities are modeled in **`mock.json`**, with some aspects additionally typed in `types/` and in page-level interfaces.

### Warehouses

- **Source**: `mock.json → warehouses[]`
- **Used in**: `app/warehouse/page.tsx`
- **Fields** (representative):
  - `id`, `name`, `location`
  - `status` (`operational`, etc.)
  - `capacityUsed` (percentage)
  - `itemsStored`, `itemsInTransit`
  - `staff`, `docks`
  - `lastUpdated`

### Shipments

- **Source**: `mock.json → shipments[]`
- **Used in**: `app/shipments/page.tsx`
- **Fields** (representative):
  - `shipmentId`
  - `customer`
  - `origin`, `destination`
  - `weight`
  - `status` (`delivered`, `in-transit`, `pending`, `at-warehouse`, etc.)
  - `progress` (percentage of journey completed)
  - `lastUpdate`

### Inventory

- **Source**: `mock.json → inventory[]`
- **Used in**: `app/inventory/page.tsx`
- **Fields**:
  - `sku`
  - `description`
  - `location`
  - `currentStock`, `minStock`
  - `lastUpdated`

- **Derived logic**:
  - `getStockStatus(current, min)` → `critical | low | ok`.
  - Color-coded status badges based on stock health.

### Customers

- **Source**: `mock.json → customers[]`
- **Used in**: `app/customers/page.tsx`
- **Fields**:
  - `id`, `name`, `status` (`active` | `inactive`)
  - `email`, `phone`, `city`
  - `shipments`, `totalRevenue`
  - `joinDate`

### Invoices

- **Source**: `mock.json → invoices[]`
- **Used in**: `app/invoices/page.tsx`
- **Fields**:
  - `id`
  - `customerId`, `customerName`
  - `amount`
  - `status` (`paid`, `pending`, `overdue`)
  - `invoiceDate`, `dueDate`
  - `shipments`
  - `description`

### Air Cargo Manifests

- **Source**: `mock.json → aircargoManifests[]`
- **Used in**: `app/aircargo/page.tsx`
- **Fields**:
  - `id`, `reference`
  - `manifestDate`, `estimatedDelivery`
  - `airlineCode`
  - `origin`, `destination`
  - `totalWeight`, `totalPieces`
  - `status` (`scheduled`, `dispatched`, `in-transit`, `at-terminal`, `delivered`)
  - `shipments`

### Barcodes

- **Source**: `mock.json → barcodes[]`
- **Used in**: `app/barcodes/page.tsx`
- **Fields**:
  - `id`, `barcodeNumber`
  - `shipmentId`
  - `customerName`
  - `origin`, `destination`
  - `weight`, `pieces`
  - `status` (`delivered`, `in-transit`, `pending`, ...)
  - `scannedAt`, `lastScannedLocation`
  - `createdDate`, `expiryDate`
  - `contents`

### Dashboard Metrics & Analytics

- **Stats, charts, and rankings**
  - **Source**: `mock.json`
  - **Types**: `types/dashboard.ts`
    - `DashboardStat`
    - `ChartData` (currently typed as `spendings`, `sales`, `coffee` but used with revenue/shipments/distance data in JSON)
    - `RebelRanking`, `SecurityStatus`, `Notification`, `WidgetData`
    - `MockData` – wraps dashboard-specific slices (`dashboardStats`, `chartData`, etc.).

### Chat & Notifications

- **Chat types**: `types/chat.ts`
  - `ChatUser`, `ChatMessage`, `ChatConversation`, `ChatData`, `ChatState`.
- **Chat data**: `data/chat-mock.ts`
  - `mockChatData` provides `currentUser` and `conversations`.
- **Notifications & widget**:
  - `mock.json → notifications[]`, `widgetData`.
  - Used in `app/layout.tsx` to populate right-rail components.

---

## Tech Stack

### Framework & Language

- **Next.js 14.2.25** (App Router – `app/` directory)
- **React ^19** and **React DOM ^19**
- **TypeScript ^5** with `moduleResolution: "bundler"` and `@/*` path aliases

### Styling & UI

- **Tailwind CSS ^4.1.9**
- **tailwindcss-animate**, **tw-animate-css** for animations
- **Radix UI** primitives (`@radix-ui/react-*`)
- Custom UI component library (similar to **shadcn/ui**) in `components/ui/`
- **geist** typography and custom local font (`Rebels-Fett.woff2`)

### Forms, State & Validation

- **React Hook Form** (`react-hook-form`)
- **Zod** for schema validation
- **@hookform/resolvers** bridge
- **Zustand** for state management (available, not heavily used yet)
- **Immer** for immutable updates (available as a utility)

### Data & Visualization

- **Recharts** for charts in `/reports` and dashboard
- **date-fns** for date formatting and manipulation

### Other

- **next-themes** for theme toggling
- **lucide-react** for icons
- **cmdk**, **embla-carousel-react**, and other utility libraries available via dependencies

---

## Project Structure

### Top-Level Layout

```text
c:\project-tapango
├─ app/                 # Next.js App Router (pages & layouts)
├─ components/          # Reusable UI & feature components
├─ data/                # Local data mocks (chat)
├─ hooks/               # Custom React hooks
├─ lib/                 # Utilities & context
├─ public/              # Static assets (images, fonts, icons)
├─ styles/              # Additional global styles
├─ types/               # TypeScript type definitions
├─ mock.json            # Main logistics mock data
├─ package.json         # Dependencies & scripts
├─ tsconfig.json        # TypeScript configuration
├─ next.config.mjs/ts   # Next.js configuration
└─ README.md            # Project documentation (this file)
```

### Key Directories

- **`app/`**
  - `layout.tsx` – global HTML shell, sidebar, header, right rail, chat.
  - `page.tsx` – main dashboard overview.
  - Route folders:
    - `aircargo/page.tsx`
    - `barcodes/page.tsx`
    - `customers/page.tsx`
    - `inventory/page.tsx`
    - `invoices/page.tsx`
    - `reports/page.tsx`
    - `settings/page.tsx`
    - `shipments/page.tsx`
    - `warehouse/page.tsx`
  - `globals.css`, `favicon.ico`, `opengraph-image.png`, `not-found.tsx`.

- **`components/`**
  - `dashboard/`
    - `layout/` – `DashboardPageLayout` / `DashboardLayout`.
    - `sidebar/` – `DashboardSidebar` and helpers (quick stats, status badge).
    - `stat/`, `chart/`, `rebels-ranking/`, `security-status/`, `widget/`, `mobile-header/`, `notifications/`.
  - `chat/` – chat main component, mobile chat, message list, etc.
  - `barcode/` – `BarcodeScanner`, `BarcodeGenerator`.
  - `icons/` – custom SVG icons (brackets, gear, processor, boom, warehouse, truck, box, etc.).
  - `ui/` – low-level UI primitives (buttons, inputs, cards, tabs, sidebar, toast, etc.).
  - `theme-provider.tsx` – theming context.

- **`lib/`**
  - `utils.ts` – helper utilities (e.g. `cn` for class merging).
  - `v0-context.tsx` – `V0Provider` and `useIsV0` hook.

- **`hooks/`**
  - `use-mobile.ts` – responsive/mobile-related logic.
  - `use-toast.ts` – toast notification hook.

- **`types/`**
  - `dashboard.ts` – dashboard-level types (`MockData`, stats, charts, notifications, etc.).
  - `chat.ts` – chat-related types (`ChatUser`, `ChatMessage`, `ChatConversation`, `ChatData`).

- **`data/`**
  - `chat-mock.ts` – `mockChatData` for chat UI.

- **`public/`**
  - `avatars/` – user avatars for rankings and chat.
  - `fonts/` – custom fonts.
  - Placeholder images and SVG icons.

---

## Environment & Configuration

### Supabase Environment Variables

Supabase-related environment variables are used to power **live reads and writes** for logistics data (shipments, barcodes, manifests, invoices, etc.). Both a browser client and a server-only admin client are configured in `lib/` and consumed by pages and API routes.

To prepare for integration and keep secrets safe:

1. **Create a local env file** (recommended):

   ```bash
   # at project root
   touch .env.local
   ```

2. **Add your Supabase configuration** using your own values:

   ```bash
   # Public URL (safe for browser usage)
   NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"

   # Public anon key (safe in browser, but keep in env files)
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-public-anon-key>"

   # Service role key (NEVER expose to the browser or commit to git)
   # Use only in server-side code (API routes, server actions, cron jobs).
   SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"

   # Optional: storage bucket name
   SUPABASE_STORAGE_BUCKET="<your-storage-bucket-name>"

   # Optional: JWT secret (for Edge/runtime usage or custom auth)
   SUPABASE_JWT_SECRET="<your-jwt-secret>"

   # Optional: public site URL (used by auth/callback flows)
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"

   # Optional: Slack webhook URL for invoice generation failure alerts
   # If set, the app will post to this webhook when the last 3 attempts for an invoice all fail.
   INVOICE_ALERT_SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
   ```

> **Security note**: Never commit real Supabase keys (especially `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_JWT_SECRET`) to your repository. Prefer `.env.local` which is ignored by default in most setups.

### Next.js / TypeScript / Tooling

Key config files:

- **`next.config.mjs` / `next.config.ts`**
  - Enables unoptimized images.
  - Configures TypeScript to ignore build errors (can be tightened for production).

- **`tsconfig.json`**
  - `@/*` alias mapping to `./*` for clean imports (`@/components/...`).
  - Includes `next-env.d.ts`, `**/*.ts`, `**/*.tsx`, `.next/types/**/*.ts`.
  - Excludes `node_modules`.

- **`eslint.config.mjs`**
  - ESLint configuration (flat config) for TypeScript and Next.js.

- **`postcss.config.mjs`**
  - Tailwind + PostCSS pipeline.

- **`components.json`**
  - Configuration for the UI component system (e.g., shadcn-style tooling).

---

## Getting Started

### Prerequisites

- **Node.js**: Recommended **v18+** (Next.js 14 requirement).
- **Package manager**: `npm` (a `package-lock.json` is present). A `pnpm-lock.yaml` also exists, but you should stick to **one** package manager to avoid conflicts.

### Installation

```bash
# Install dependencies (recommended)
npm install

# OR, if you prefer pnpm and keep it consistent
yarn # or pnpm install
```

> If you switch package managers, delete the other lockfile to avoid confusion.

### Running the Dev Server

```bash
npm run dev
```

Then open:

- `http://localhost:3000` – main dashboard

You can navigate through the sidebar to access all logistics routes:

- `/warehouse`, `/shipments`, `/inventory`
- `/customers`, `/invoices`
- `/aircargo`, `/barcodes`
- `/reports`, `/settings`

### Build & Production

```bash
# Build for production
npm run build

# Start the production server
npm start
```

### Linting

```bash
npm run lint
```

---

## Working With the Codebase

### Path Aliases

The project uses `@/*` as a root alias (configured in `tsconfig.json`):

- `@/components/...` → `./components/...`
- `@/app/...` → `./app/...`
- `@/lib/...` → `./lib/...`
- `@/types/...` → `./types/...`
- `@/data/...` → `./data/...`

This keeps imports clean and avoids deep relative paths.

### UI Components & Styling

- Prefer components from **`components/ui/`** for primitives:
  - Buttons, Inputs, Cards, Tabs, Sidebar, Popover, Switch, Badge, etc.
- Use **`components/dashboard/`** for higher-level dashboards constructs:
  - `DashboardLayout`, `DashboardSidebar`, `Widget`, `Notifications`, `stat`, `chart`, etc.
- Icons are in **`components/icons/`**.
- Tailwind classes provide layout and utility styling; `lib/utils.ts` contains helpers like `cn` for merging `className` values.

### Adding a New Route / Page

To add a new logistics view (e.g., `/drivers`):

1. **Create a new folder and page**:

   ```text
   app/drivers/page.tsx
   ```

2. **Wrap with `DashboardPageLayout`**:

   ```tsx
   // app/drivers/page.tsx
   'use client';

   import { DashboardLayout } from '@/components/dashboard/layout';
   import TruckIcon from '@/components/icons/truck';

   export default function DriversPage() {
     return (
       <DashboardLayout
         header={{
           title: 'Drivers',
           description: 'Manage your driver network and assignments',
           icon: TruckIcon,
         }}
       >
         {/* Your content here */}
       </DashboardLayout>
     );
   }
   ```

3. **Add a navigation entry** in `components/dashboard/sidebar/index.tsx` inside the appropriate group (`Core Operations`, `Management & Billing`, or `System`).

4. **Add data & types** (optional initially):
   - Extend `mock.json` with a `drivers` array.
   - Add a `Driver` interface in `types/` and wire the new page to use it.

### Extending the Logistics Domain

Right now, all logistics entities are stored in `mock.json` and partially typed. A recommended path to evolve the domain is:

1. **Centralize domain types**
   - Create or extend a `types/logistics.ts` file (or extend `types/dashboard.ts`) with:
     - `Warehouse`, `Shipment`, `InventoryItem`, `Customer`, `Invoice`, `AircargoManifest`, `Barcode`.
   - Extend the `MockData` interface to include these arrays so `mockData` is fully typed.

2. **Refactor pages to use centralized types**
   - Replace inline interfaces declared in pages (e.g., `interface Customer`) with shared types.
   - Avoid `(mockData as any).customers` and instead use strongly typed access.

3. **Introduce domain hooks (optional)**
   - Example hooks:
     - `useShipments()` → returns shipments and encapsulates filtering logic.
     - `useInventory()` → returns inventory items and stock status helpers.
     - `useWarehouses()` → returns warehouses and computed metrics.
   - Initially, these hooks can read from `mock.json` directly.

4. **Prepare for backend integration**
   - Once types are in place, they can serve as the single source of truth for schema design in a real database or API.

---

## Operations & Security

This project is currently designed and implemented as an **internal operations tool**, not a public-facing SaaS. The security model is intentionally simple but assumes you control access to the app.

### Internal-only deployment

For production-style usage today, you should:

- **Run the app behind your own network boundary**:
  - Put the Next.js app behind a **VPN**, office network, or VPC.
  - Alternatively, place a **reverse proxy** (Nginx, Traefik, Cloudflare, etc.) in front of the app and restrict access to known IP ranges.
- **Add a simple auth layer at the proxy if needed**:
  - HTTP Basic Auth or SSO at the reverse proxy is usually enough for internal tools.
  - The app itself does not yet implement per-user auth.

### Key handling

Supabase keys should be treated as follows:

- **Service role key (`SUPABASE_SERVICE_ROLE_KEY`)**
  - Must **never** be exposed to the browser or to other untrusted clients.
  - Should only be used in server-only contexts (API routes under `app/api`, server actions, cron jobs) via `lib/supabaseAdmin.ts`.

- **Anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)**
  - Is considered a **powerful read key** in this app:
    - RLS is enabled, but there are permissive read policies (e.g. `USING (true)`) that allow broad read access.
  - Only embed this key in **this Next.js app** and only deploy the app in controlled environments (VPN/office IPs/proxy auth).
  - Do not share the anon key with arbitrary third-party frontends or scripts.

- **URL (`NEXT_PUBLIC_SUPABASE_URL`)**
  - Is safe to be public, but in practice only this app should talk directly to your Supabase project.

In short: treat the whole app (and its anon key) as **privileged internal tooling**.

### Future auth & RLS

When you are ready to move beyond internal-only and add proper per-user access control, you will not need to undo the current work. You will primarily:

1. **Enable Supabase Auth** and map users:
   - Use Supabase Auth to manage operators and managers.
   - Link `auth.uid()` to rows in your `users` table.

2. **Tighten RLS policies**:
   - Replace `USING (true)` policies with role-aware rules, for example:
     - Operators can only see data for their warehouse or tenant.
     - Managers can see everything.
   - Apply stricter policies on write-heavy tables like `package_scans`, `manifests`, `invoices` if you ever write from the browser.

3. **Add a login flow and route guards**:
   - Introduce a sign-in page (email/password, magic link, or SSO).
   - Protect routes in the App Router (e.g. a layout that enforces auth) so only authenticated users can access the dashboard.

Until then, you can continue to run the app as an internal console, with network/proxy-level controls and server-only use of the service role key.

## Future Work & Supabase Integration

Supabase is now integrated for core logistics entities and server APIs. Remaining Supabase-related work is mostly about **hardening and authorization** rather than basic CRUD:

1. **Refine database schema & indexes** as real load and data patterns emerge.
2. **Add more targeted RLS policies** once user roles and responsibilities are defined.
3. **Introduce Supabase Auth** and map roles (operator, supervisor, admin) to row-level access.
4. **Add observability** – logs and metrics around scans, manifest creation, and invoice generation.

---

## License

This project does not currently specify a license. If you plan to open-source or distribute it, consider adding a `LICENSE` file (e.g., MIT, Apache 2.0) at the repository root.
