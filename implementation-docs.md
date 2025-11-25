Implementation & Enhancement Plan — Tapan Go Cargo App

Author: Arra-Core — Implementation plan for Mr. O
Purpose: Add barcode tracking, invoice + WhatsApp delivery, manifesto batch scanning, search/filters, and choose a backend with practical implementation details.

1 — Quick analysis of current screenshots & README summary

What I see (from screenshots + README):

A polished dark-dashboard UX with three-column layout: left nav, main content (charts, rankings), right rail with widget/notifications/chat.

Routes and features already scaffolded: /invoices, /barcodes, /aircargo, /shipments, /customers, /warehouse, etc.

Frontend uses mock data; environment variables for Supabase are prepared but not wired up.

Nice UI components exist (cards, charts, tables, scanner & generator components seem planned).

Opportunities / Concerns:

Great visual foundation. Next steps are wiring to a real backend, implementing barcode scanning & offline-first scanning workflows, robust search/filter indexes, manifest batching, invoice PDF generation, and a WhatsApp sending mechanism for the admin account.

Need clear domain model, audit trails for scans, security around WhatsApp automation/service keys, and a plan for scaling (real-time updates, storage).

2 — High-level product flow (MVP → Full)

MVP scope (must-have):

Customer create & edit (name, addr, phone, email).

Create invoice that contains one or more shipment packages; each package gets a barcode (Code128 recommended).

Generate invoice PDF with embedded barcode(s) and store it (Supabase Storage).

Manual "Send via WhatsApp" button that opens pre-filled WH message or automates via admin browser (WhatsApp Web approach).

Scanning: simple web-based barcode scanner (camera) that resolves barcode → shows package & status; scanning at air cargo terminal adds scan event and groups scans into a Manifest entry (manifest record listing all scanned packages and counts).

Manifesto view: list manifests by date, origin, total pieces, total weight, shipments and customer details.

Post-MVP / Full features (next wave):

Realtime status updates (on-scan event publishes to dashboard via Supabase Realtime).

Offline mobile scanning (queue when offline, sync when connected).

Two-way WhatsApp integration using Meta/WhatsApp Business API (for automated file sending).

Driver tracking (GPS), ETA predictions, automated notifications (WhatsApp/SMS), analytics and SLA/delay reports.

Role-based auth & audit trail (operators vs manager).

Barcode hardware integration (dedicated scanners) + web socket/keyboard-emulate scanning support.

3 — Barcode strategy & recommended technologies

Symbology (recommendation):

Primary barcode: Code 128 (compact, high density, widely used for package IDs).

Alternate / 2D: QR (if you need to embed URLs or more metadata).

Human-readable short id + barcode image on invoice/label.

Barcode generation (server or client):

Open-source: bwip-js (can generate many barcode types server-side), or JsBarcode (client).

Use server-side generation for PDFs so you have deterministic images to store in invoice file.

Barcode scanning libraries (web):

Free/Open:

@zxing/browser (ZXing wrapper) — reliable for Code128, works in browsers.

QuaggaJS — older, good for 1D codes but less maintained.

Commercial (better performance): Scandit, Dynamsoft — faster, better low-light/tilt tolerance (paid).

React wrappers: react-qr-reader, lightweight camera access with ZXing.

Mobile scanning (React Native):

react-native-camera + react-native-vision-camera + MLKit plugin, or Scandit SDK for production-grade scanning.

Hardware scanners:

For warehouses: USB Bluetooth keyboard-emulating scanners are simplest — scanning acts like typing the code and pressing Enter (works with any web text input).

Optionally integrate networked industrial scanners that push to an API.

Recommended approach for MVP:

Use @zxing/browser for web scanner component and bwip-js for generating barcodes on the server (or client if you prefer).

Support keyboard-emulated scanner input for warehouse operators (fast & robust).

4 — Manifesto workflow & scan flow

Definitions

Package — the physical parcel with barcode_number referencing a shipment or invoice.

Scan Event — when a barcode is scanned at a location, create package_scans row (timestamp, user/operator, location, scan_type).

Manifest — a batch created for a transfer to air cargo terminal (manifest groups many package_scans and references shipments)

MVP Scan Flow

Operator scans barcode(s) at handoff point (e.g., hub). Each scan creates a package_scan with location and status scanned_for_manifest.

The system groups scans by operator session or a selected manifest_id and can finalize them into a Manifest record (manifests.create).

When manifest is created/finalized:

Manifest contains date, origin hub, destination (airport), airline, total_pieces, total_weight, list of shipment_ids.

Manifest record is visible in Aircargo page and exportable (CSV/PDF).

Tallying / Audit

Each manifest shows counts per date and a breakdown by customer. You can reconcile with airport acceptance logs.

Edge cases

Duplicate scans: mark duplicates and show a warning.

Missing barcode or damaged: operator can create temporary manual entry with photo attachment.

Offline scanning: queue scans locally, sync when network returns.

5 — Searching, filtering, indexes & UX improvements

Search needs

Unified search box (global) for: shipments, barcode numbers, invoice IDs, customer name, phone, manifest ID.

Channel-specific search in each page with quick filters.

Filtering & faceting

Shipments: status, origin, destination, date range, weight range, customer.

Barcodes: status (in-transit, at-warehouse, scanned-for-manifest, delivered), lastScannedLocation, date range.

Manifests: date, airline, origin hub, status.

Implementation details

Use Postgres full-text search + GIN indexes on text fields for Supabase. Example fields: customer_name, address, shipment_reference, barcode_number.

Indexes:

CREATE INDEX ON shipments (shipment_id);

CREATE INDEX ON barcodes (barcode_number);

GIN index for the search_vector column: tsvector combining customer_name, shipment_reference, barcode_number.

For small scale, Supabase’s Postgres is great for this; when queries grow, use materialized search fields or a search engine (Meilisearch / Algolia) — Meilisearch is an easy open source self-managed option with blazing speed.

UX suggestions

Debounced typeahead suggestions (limit results).

Permalinked search results (URL query params).

Save filters as presets for operators.

6 — Invoice + WhatsApp sending (MVP and robust options)
Invoice generation

Options:

Server-side rendering to PDF:

Use Puppeteer or Playwright on a server function to render an HTML invoice template (with invoice data + barcode images) to PDF. Store PDF to Supabase Storage.

Client-side (simpler but inconsistent):

Generate a PDF with jsPDF and embedded barcode images; less control over print layout.

Recommendation: Use server-side HTML → PDF (Puppeteer) for clean, template-controlled invoices. Save PDF URL and store metadata in invoices table.

WhatsApp Delivery (MVP)

Quick approach: Clicking “Send via WhatsApp” opens https://web.whatsapp.com/send?phone=<phone>&text=<encoded> in a new tab with a prefilled message and a secure link to the invoice PDF stored in Supabase Storage. The admin (logged in to WhatsApp Web) clicks send.

Pros: No API keys, quick MVP.

Cons: Requires manual click to attach file (can't attach file via URL prefill). Many browsers allow sending just text with link; customers can click to download invoice.

Semi-automated approach (admin-controlled automation):

Use a headless browser automation (Puppeteer) running on the admin machine (or server with persistent session/cookie) to simulate file attach & send via WhatsApp Web.

This is brittle and violates WhatsApp ToS if abused — use cautiously for internal admin flows.

Production approach (recommended):

WhatsApp Business API / Meta Cloud API (official): supports sending templates, media (PDF), and automation. Requires business verification and costs.

This is the correct long-term route for automated sending of invoices and notifications.

Flow for MVP → Production

MVP: prefill message with link to invoice PDF using wa.me or https://web.whatsapp.com/send?... and optionally open in a browser window for admin to click send.

Prod: integrate WhatsApp Business API to send PDF directly using server-side API and store message logs.

Security & compliance note: Always get customer consent for WhatsApp messages and comply with local messaging laws. Secure storage of PDF links via expiring signed URLs is recommended.

7 — Backend recommendation (Supabase vs Convex vs Others)

Short answer: Use Supabase for this project.

Why Supabase

Postgres + real-time via replication / Realtime server — fits manifest & scan events.

Storage buckets for invoice PDFs & attachments.

Auth & row-level security for roles (operators, managers).

Good ecosystem & mature tooling; straightforward to integrate with Next.js.

Supports server functions / serverless edge functions (for privileged ops with service_role key).

When to consider Convex

Convex simplifies serverless business logic for real-time apps — nice developer DX, but less mature, less control over Postgres schema and relational queries.

Good if you want to offload a lot of backend logic, but Supabase gives you a more production-ready database & storage.

Other options

Firebase (Firestore) lacks relational power for joins (manifests link many shipments) — doable but less natural.

Traditional Node backend with Postgres (e.g., hosted via Railway / Fly) — more control, more work.

Conclusion: Start with Supabase for speed, flexibility, and migration options.

8 — Database schema (Supabase/Postgres) — example SQL

Below is a starter schema to create core tables. (You can paste to Supabase SQL editor.)

-- customers
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  city text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- warehouses
CREATE TABLE warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  location text,
  capacity_used numeric, -- percentage
  items_stored int,
  items_in_transit int,
  status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- shipments
CREATE TABLE shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_ref text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  origin text,
  destination text,
  weight numeric,
  status text,
  progress int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- barcodes (a barcode maps to a package/shipment)
CREATE TABLE barcodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode_number text UNIQUE NOT NULL,
  shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE,
  status text,
  last_scanned_at timestamptz,
  last_scanned_location text,
  created_at timestamptz DEFAULT now()
);

-- package_scans (audit trail)
CREATE TABLE package_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode_id uuid REFERENCES barcodes(id) ON DELETE CASCADE,
  scanned_at timestamptz DEFAULT now(),
  scanned_by uuid, -- operator user id
  location text,
  scan_type text, -- scanned_for_manifest, arrived_warehouse, left_warehouse, delivered
  manifest_id uuid NULL,
  metadata jsonb
);

-- manifests (air cargo manifest)
CREATE TABLE manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_ref text UNIQUE NOT NULL,
  origin_hub text,
  destination text,
  airline_code text,
  manifest_date date,
  total_weight numeric,
  total_pieces int,
  status text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- manifest_items (link shipments to manifest)
CREATE TABLE manifest_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id uuid REFERENCES manifests(id) ON DELETE CASCADE,
  shipment_id uuid REFERENCES shipments(id) ON DELETE SET NULL,
  barcode_id uuid REFERENCES barcodes(id) ON DELETE SET NULL,
  weight numeric
);

-- invoices
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_ref text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  amount numeric,
  status text, -- paid/pending/overdue
  invoice_date date DEFAULT now(),
  due_date date,
  pdf_path text, -- supabase storage path
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- users (operators)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  name text,
  role text, -- operator | manager | admin
  created_at timestamptz DEFAULT now()
);


Indexes & search

-- example: combined tsvector for search
ALTER TABLE shipments ADD COLUMN search_vector tsvector;
UPDATE shipments SET search_vector = to_tsvector(coalesce(shipment_ref,'') || ' ' || coalesce(origin,'') || ' ' || coalesce(destination,''));
CREATE INDEX idx_shipments_search ON shipments USING GIN(search_vector);

-- barcodes index
CREATE INDEX idx_barcodes_number ON barcodes(barcode_number);

9 — API & server architecture (Next.js + Supabase)

Where to run logic

Use server-side Next.js API routes or Server Actions (App Router) for privileged operations.

Store Supabase SERVICE_ROLE_KEY only in server-side env and use server endpoints to mutate sensitive data.

Recommended endpoints

GET /api/shipments?query=... — search shipments (server function returning filtered results)

POST /api/customers — create customer

POST /api/invoices — create invoice & return PDF URL (invokes server-side invoice generation)

POST /api/barcodes/generate — create barcode record (server-side)

POST /api/scans — record a scan event (called by scanner UI or keyboard input)

POST /api/manifests — finalize a manifest (aggregates scans into manifest, computes totals)

GET /api/manifests/:id/export — export manifest as CSV or PDF

Realtime

Use Supabase Realtime to broadcast new scan events and manifest finalization to clients.

Client subscribes to package_scans changes and updates UI in real-time.

10 — Offline & robustness (practical notes)

Offline scanning

Browser/local: store scans to IndexedDB or localStorage queue with timestamp & operator id.

Sync worker: when network detected, POST queued scans to /api/scans with retry logic and dedup checks (server side checks barcode_id + scanned_at window).

Dedup & idempotency

Use unique scan_session_id or check last scan time to avoid duplicates.

Allow operator to mark a scan as manual if barcode unreadable.

11 — UX & UI improvements (quick list)

Add a single top search (global) that searches shipments, invoices, customers, barcodes, manifests (typeahead & keyboard shortcut).

Add a manifest "quick-scan session" UI: operator selects origin & manifest (or creates new), scans packages, sees running totals (pieces/weight) and can finalize.

For barcodes list add columns: last scanned location, last scanned time, scan count, current status.

Make the scanner component support both camera and keyboard-emulated scanner input.

Add “Reconcile Manifest” modal: compare manifest contents vs scanned items and highlight missing packages.

Exportable CSV/PDF for manifests and invoices (one-click).

Bulk actions: select multiple shipments → create invoice / add to manifest / mark as dispatched.

Add audit trail view per shipment: list all package_scans, who scanned, when, and where.

12 — Security considerations

Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.

Use RLS (row-level security) in Supabase to restrict data per operator role.

Signed URLs for invoice PDFs that expire (prevent public leak).

Audit logs for all major actions (create invoice, finalize manifest, scans).

For WhatsApp Business API usage, secure credentials and rate-limit to avoid spam and account bans.

13 — Prioritized implementation checklist (concrete next steps)

Phase 0 — Prep

Wire Supabase client (server & client), add env variables .env.local.

Create DB schema on Supabase (paste SQL).

Implement typed domain models in types/.

Phase 1 — MVP

Customer CRUD UI -> persist to Supabase customers table.

Invoice creation: invoice UI -> create invoice row; server generates barcode numbers and stores PDF in Supabase Storage.

Barcode generation: call bwip-js server function to produce barcode image stored on Supabase storage and link to barcodes table.

Scanner UI: implement @zxing/browser scanner and keyboard input support; POST scans to /api/scans.

Manifest creation: allow grouping scanned items into manifests and show manifesto page.

WhatsApp MVP: "Send via WhatsApp" opens web.whatsapp.com/send?... with prefilled message + invoice link. (Admin must click to send.)

Add full-text search and GIN indexes for key tables.

Phase 2 — Production hardening

Implement server-side invoice PDF generation (Puppeteer).

Integrate WhatsApp Business API (Meta Cloud) for sending PDF & message templates.

Add realtime subscriptions (Supabase Realtime).

Add offline queue sync.

Add role-based auth & RLS.

14 — Example Next.js server action snippet (invoice create + barcode generation)

(Pseudo-code idea — implement in app/api/invoices/route.ts or server action)

// server-side action
import { createInvoiceRow, generateBarcodeImage, uploadToStorage } from '@/lib/server';

export async function createInvoice(payload) {
  // 1. insert invoice row in DB
  const invoice = await createInvoiceRow(payload);

  // 2. for each package generate barcode image
  for (const pkg of payload.packages) {
    const barcode = await generateBarcodeImage(pkg.barcode_number);
    const path = await uploadToStorage(`invoices/${invoice.id}/${pkg.barcode_number}.png`, barcode);
    // create barcode record referencing invoice/shipment in db
  }

  // 3. generate PDF invoice using Puppeteer
  const pdfBuffer = await renderInvoiceToPDF(invoice, packagesAndImages);
  const pdfPath = await uploadToStorage(`invoices/${invoice.id}/invoice.pdf`, pdfBuffer);

  // 4. update invoice row with pdfPath
  await updateInvoicePdfPath(invoice.id, pdfPath);

  return { invoiceId: invoice.id, pdfUrl: signedUrl(pdfPath) };
}

15 — Final recommendations & next action for you (Tom)

Start wiring Supabase now: create project, run the SQL schema, and add NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and the SUPABASE_SERVICE_ROLE_KEY to server-only env.

Implement barcodes & scans MVP:

Add barcodes table + generation endpoint.

Add scanner component using @zxing/browser.

Add package_scans table and API to POST scans.

Add manifest finalize flow: UI for grouping scans and creating manifest row + manifest_items.

Invoice PDF server generation (Puppeteer) + store in Supabase Storage.

WhatsApp MVP: implement open web.whatsapp.com/send with prefilled link; plan to move to WhatsApp Business API later.

Search: add Postgres GIN index for search and a server search endpoint; optionally add Meili/Algolia later for very fast search.

If you want, I can:

generate the exact SQL file with the schema above,

scaffold the Supabase client lib/supabaseClient.ts and a sample server/invoice server action,

produce the scanner React component code (using @zxing/browser or keyboard fallback),

or create an IMPLEMENTATION.md file in the repo via the canvas.

Which of those would you like me to produce next? (I can start by generating the SQL + Supabase client and the barcode scanner component code.)8 — Database schema (Supabase/Postgres) — example SQL

Below is a starter schema to create core tables. (You can paste to Supabase SQL editor.)

-- customers
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  city text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- warehouses
CREATE TABLE warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  location text,
  capacity_used numeric, -- percentage
  items_stored int,
  items_in_transit int,
  status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- shipments
CREATE TABLE shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_ref text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  origin text,
  destination text,
  weight numeric,
  status text,
  progress int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- barcodes (a barcode maps to a package/shipment)
CREATE TABLE barcodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode_number text UNIQUE NOT NULL,
  shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE,
  status text,
  last_scanned_at timestamptz,
  last_scanned_location text,
  created_at timestamptz DEFAULT now()
);

-- package_scans (audit trail)
CREATE TABLE package_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode_id uuid REFERENCES barcodes(id) ON DELETE CASCADE,
  scanned_at timestamptz DEFAULT now(),
  scanned_by uuid, -- operator user id
  location text,
  scan_type text, -- scanned_for_manifest, arrived_warehouse, left_warehouse, delivered
  manifest_id uuid NULL,
  metadata jsonb
);

-- manifests (air cargo manifest)
CREATE TABLE manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_ref text UNIQUE NOT NULL,
  origin_hub text,
  destination text,
  airline_code text,
  manifest_date date,
  total_weight numeric,
  total_pieces int,
  status text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- manifest_items (link shipments to manifest)
CREATE TABLE manifest_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manifest_id uuid REFERENCES manifests(id) ON DELETE CASCADE,
  shipment_id uuid REFERENCES shipments(id) ON DELETE SET NULL,
  barcode_id uuid REFERENCES barcodes(id) ON DELETE SET NULL,
  weight numeric
);

-- invoices
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_ref text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  amount numeric,
  status text, -- paid/pending/overdue
  invoice_date date DEFAULT now(),
  due_date date,
  pdf_path text, -- supabase storage path
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- users (operators)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  name text,
  role text, -- operator | manager | admin
  created_at timestamptz DEFAULT now()
);


Indexes & search

-- example: combined tsvector for search
ALTER TABLE shipments ADD COLUMN search_vector tsvector;
UPDATE shipments SET search_vector = to_tsvector(coalesce(shipment_ref,'') || ' ' || coalesce(origin,'') || ' ' || coalesce(destination,''));
CREATE INDEX idx_shipments_search ON shipments USING GIN(search_vector);

-- barcodes index
CREATE INDEX idx_barcodes_number ON barcodes(barcode_number);

9 — API & server architecture (Next.js + Supabase)

Where to run logic

Use server-side Next.js API routes or Server Actions (App Router) for privileged operations.

Store Supabase SERVICE_ROLE_KEY only in server-side env and use server endpoints to mutate sensitive data.

Recommended endpoints

GET /api/shipments?query=... — search shipments (server function returning filtered results)

POST /api/customers — create customer

POST /api/invoices — create invoice & return PDF URL (invokes server-side invoice generation)

POST /api/barcodes/generate — create barcode record (server-side)

POST /api/scans — record a scan event (called by scanner UI or keyboard input)

POST /api/manifests — finalize a manifest (aggregates scans into manifest, computes totals)

GET /api/manifests/:id/export — export manifest as CSV or PDF

Realtime

Use Supabase Realtime to broadcast new scan events and manifest finalization to clients.

Client subscribes to package_scans changes and updates UI in real-time.

10 — Offline & robustness (practical notes)

Offline scanning

Browser/local: store scans to IndexedDB or localStorage queue with timestamp & operator id.

Sync worker: when network detected, POST queued scans to /api/scans with retry logic and dedup checks (server side checks barcode_id + scanned_at window).

Dedup & idempotency

Use unique scan_session_id or check last scan time to avoid duplicates.

Allow operator to mark a scan as manual if barcode unreadable.

11 — UX & UI improvements (quick list)

Add a single top search (global) that searches shipments, invoices, customers, barcodes, manifests (typeahead & keyboard shortcut).

Add a manifest "quick-scan session" UI: operator selects origin & manifest (or creates new), scans packages, sees running totals (pieces/weight) and can finalize.

For barcodes list add columns: last scanned location, last scanned time, scan count, current status.

Make the scanner component support both camera and keyboard-emulated scanner input.

Add “Reconcile Manifest” modal: compare manifest contents vs scanned items and highlight missing packages.

Exportable CSV/PDF for manifests and invoices (one-click).

Bulk actions: select multiple shipments → create invoice / add to manifest / mark as dispatched.

Add audit trail view per shipment: list all package_scans, who scanned, when, and where.

12 — Security considerations

Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.

Use RLS (row-level security) in Supabase to restrict data per operator role.

Signed URLs for invoice PDFs that expire (prevent public leak).

Audit logs for all major actions (create invoice, finalize manifest, scans).

For WhatsApp Business API usage, secure credentials and rate-limit to avoid spam and account bans.

13 — Prioritized implementation checklist (concrete next steps)

Phase 0 — Prep

Wire Supabase client (server & client), add env variables .env.local.

Create DB schema on Supabase (paste SQL).

Implement typed domain models in types/.

Phase 1 — MVP

Customer CRUD UI -> persist to Supabase customers table.

Invoice creation: invoice UI -> create invoice row; server generates barcode numbers and stores PDF in Supabase Storage.

Barcode generation: call bwip-js server function to produce barcode image stored on Supabase storage and link to barcodes table.

Scanner UI: implement @zxing/browser scanner and keyboard input support; POST scans to /api/scans.

Manifest creation: allow grouping scanned items into manifests and show manifesto page.

WhatsApp MVP: "Send via WhatsApp" opens web.whatsapp.com/send?... with prefilled message + invoice link. (Admin must click to send.)

Add full-text search and GIN indexes for key tables.

Phase 2 — Production hardening

Implement server-side invoice PDF generation (Puppeteer).

Integrate WhatsApp Business API (Meta Cloud) for sending PDF & message templates.

Add realtime subscriptions (Supabase Realtime).

Add offline queue sync.

Add role-based auth & RLS.

14 — Example Next.js server action snippet (invoice create + barcode generation)

(Pseudo-code idea — implement in app/api/invoices/route.ts or server action)

// server-side action
import { createInvoiceRow, generateBarcodeImage, uploadToStorage } from '@/lib/server';

export async function createInvoice(payload) {
  // 1. insert invoice row in DB
  const invoice = await createInvoiceRow(payload);

  // 2. for each package generate barcode image
  for (const pkg of payload.packages) {
    const barcode = await generateBarcodeImage(pkg.barcode_number);
    const path = await uploadToStorage(`invoices/${invoice.id}/${pkg.barcode_number}.png`, barcode);
    // create barcode record referencing invoice/shipment in db
  }

  // 3. generate PDF invoice using Puppeteer
  const pdfBuffer = await renderInvoiceToPDF(invoice, packagesAndImages);
  const pdfPath = await uploadToStorage(`invoices/${invoice.id}/invoice.pdf`, pdfBuffer);

  // 4. update invoice row with pdfPath
  await updateInvoicePdfPath(invoice.id, pdfPath);

  return { invoiceId: invoice.id, pdfUrl: signedUrl(pdfPath) };
}

15 — Final recommendations & next action for you (Tom)

Start wiring Supabase now: create project, run the SQL schema, and add NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and the SUPABASE_SERVICE_ROLE_KEY to server-only env.

Implement barcodes & scans MVP:

Add barcodes table + generation endpoint.

Add scanner component using @zxing/browser.

Add package_scans table and API to POST scans.

Add manifest finalize flow: UI for grouping scans and creating manifest row + manifest_items.

Invoice PDF server generation (Puppeteer) + store in Supabase Storage.

WhatsApp MVP: implement open web.whatsapp.com/send with prefilled link; plan to move to WhatsApp Business API later.

Search: add Postgres GIN index for search and a server search endpoint; optionally add Meili/Algolia later for very fast search.

If you want, I can:

generate the exact SQL file with the schema above,

scaffold the Supabase client lib/supabaseClient.ts and a sample server/invoice server action,

produce the scanner React component code (using @zxing/browser or keyboard fallback),

or create an IMPLEMENTATION.md file in the repo via the canvas.

Which of those would you like me to produce next? (I can start by generating the SQL + Supabase client and the barcode scanner component code.)

1) app/api/resolve-barcodes/route.ts

Resolves an array of barcode_number → { id, barcode_number, shipment_id }. Drop at app/api/resolve-barcodes/route.ts.

// app/api/resolve-barcodes/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { barcodes } = body;
    if (!barcodes || !Array.isArray(barcodes)) {
      return NextResponse.json({ error: 'barcodes must be an array' }, { status: 400 });
    }

    // Query barcodes table for matching barcode_number values
    const { data, error } = await supabaseAdmin
      .from('barcodes')
      .select('id, barcode_number, shipment_id')
      .in('barcode_number', barcodes);

    if (error) throw error;

    // Build mapping: barcode_number -> id
    const map = (data ?? []).reduce((acc: Record<string, any>, row: any) => {
      acc[row.barcode_number] = row;
      return acc;
    }, {});

    // Ensure we return ids in the same order as input
    const ids = barcodes.map((b: string) => (map[b] ? map[b].id : null));
    const resolved = barcodes.map((b: string) => map[b] ?? null);

    return NextResponse.json({ success: true, ids, resolved });
  } catch (err: any) {
    console.error('resolve-barcodes error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

2) app/api/invoices/generate/route.ts

Generates barcode images (via bwip-js), renders invoice HTML → PDF (via puppeteer), uploads barcode images + PDF to Supabase Storage, updates invoices.pdf_path. Drop at app/api/invoices/generate/route.ts.

Important: Puppeteer and bwip-js are Node packages and must run server-side. Puppeteer requires extra dependencies in some environments (fonts, Chromium). If you deploy to Vercel, consider @vercel/chromium or a headless PDF generation service.

// app/api/invoices/generate/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bwipjs from 'bwip-js';
import puppeteer from 'puppeteer';

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'invoices';

async function generateBarcodePngBuffer(code: string) {
  // bwip-js returns a Promise-buffer when using toBuffer
  return new Promise<Buffer>((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'code128',       // Barcode type
      text: code,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: 'center',
    }, (err: any, png: Buffer) => {
      if (err) return reject(err);
      resolve(png);
    });
  });
}

function invoiceHtmlTemplate({ invoiceRef, customer, items, barcodeUrls, amount }: any) {
  // Simple HTML template. Replace with your styled template as needed.
  const rows = items.map((it: any, idx: number) => `
    <tr>
      <td style="padding:8px;border:1px solid #eee">${idx+1}</td>
      <td style="padding:8px;border:1px solid #eee">${it.description || it.shipment_ref || ''}</td>
      <td style="padding:8px;border:1px solid #eee">${it.weight ?? ''}</td>
      <td style="padding:8px;border:1px solid #eee">${it.amount ?? ''}</td>
      <td style="padding:8px;border:1px solid #eee">${barcodeUrls[idx] ? `<img src="${barcodeUrls[idx]}" style="height:40px" />` : ''}</td>
    </tr>
  `).join('');

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice ${invoiceRef}</title>
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif; color:#222; padding:20px">
        <header style="margin-bottom:20px">
          <h1>Invoice: ${invoiceRef}</h1>
          <div>Customer: ${customer?.name ?? ''}</div>
          <div>Phone: ${customer?.phone ?? ''}</div>
        </header>

        <table style="width:100%; border-collapse:collapse; margin-bottom:12px">
          <thead>
            <tr>
              <th style="text-align:left; padding:8px; border:1px solid #eee">#</th>
              <th style="text-align:left; padding:8px; border:1px solid #eee">Item</th>
              <th style="text-align:left; padding:8px; border:1px solid #eee">Weight</th>
              <th style="text-align:left; padding:8px; border:1px solid #eee">Amount</th>
              <th style="text-align:left; padding:8px; border:1px solid #eee">Barcode</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="margin-top:16px; font-weight:600">Total: ${amount}</div>
      </body>
    </html>
  `;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, customerId, items, amount } = body;
    if (!invoiceId || !customerId) {
      return NextResponse.json({ error: 'invoiceId and customerId required' }, { status: 400 });
    }

    // Fetch customer meta
    const { data: customer } = await supabaseAdmin.from('customers').select('*').eq('id', customerId).maybeSingle();

    // 1) Generate barcode images for each item and upload them
    const barcodeUrls: string[] = [];
    for (const item of items) {
      const code = item.barcodeNumber || `B-${Date.now()}-${Math.floor(Math.random()*9000)+1000}`;
      // generate png
      const pngBuffer = await generateBarcodePngBuffer(code);

      // storage path
      const path = `invoices/${invoiceId}/barcodes/${code}.png`;
      const upload = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(path, pngBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

      if (upload.error) {
        console.warn('upload barcode error', upload.error);
        throw upload.error;
      }

      // create or update barcode row in DB
      await supabaseAdmin.from('barcodes').upsert({
        barcode_number: code,
        shipment_id: item.shipmentId || null,
        status: 'created',
      }, { onConflict: ['barcode_number'] });

      // create public (signed) URL for the template to use
      const { data: publicUrl } = await supabaseAdmin.storage.from(STORAGE_BUCKET).createSignedUrl(path, 60 * 60); // 1 hour
      barcodeUrls.push(publicUrl.signedURL);
      item.barcodeNumber = code; // ensure saved
    }

    // 2) Render invoice HTML to PDF using Puppeteer
    const html = invoiceHtmlTemplate({ invoiceRef: `INV-${invoiceId}`, customer, items, barcodeUrls, amount });

    // Launch Puppeteer - local or server environment: may need special handling for headless
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' } });
    await browser.close();

    // 3) Upload PDF to storage
    const pdfPath = `invoices/${invoiceId}/invoice.pdf`;
    const uploadPdf = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(pdfPath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

    if (uploadPdf.error) {
      console.error('upload pdf err', uploadPdf.error);
      throw uploadPdf.error;
    }

    // 4) Create signed URL for the PDF (short lived) and update invoice row
    const { data: signed } = await supabaseAdmin.storage.from(STORAGE_BUCKET).createSignedUrl(pdfPath, 60 * 60 * 24); // 24h
    const pdfUrl = signed.signedURL;

    const { error: updErr } = await supabaseAdmin.from('invoices').update({ pdf_path: pdfPath }).eq('id', invoiceId);
    if (updErr) console.warn('failed to update invoice pdf_path', updErr);

    return NextResponse.json({ success: true, pdfUrl, barcodeUrls, invoiceId });
  } catch (err: any) {
    console.error('invoice generate error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


Notes / caveats

Install packages: npm i bwip-js puppeteer (or puppeteer-core + chrome binary like @sparticuz/chromium or @vercel/chromium when deploying). Puppeteer can be heavy; pick a deploy plan that supports it.

SUPABASE_STORAGE_BUCKET should be set in .env.local. Create that bucket in Supabase (e.g., invoices).

createSignedUrl returns short-lived signed URL that we used in the invoice template. You can also use public buckets or proxy file downloads through an API.

3) Convert scanner page into App Router page: app/aircargo/manifest-scanner/page.tsx

This is the App Router version of the previous client page (keeps the UI under /aircargo/manifest-scanner).

// app/aircargo/manifest-scanner/page.tsx
'use client';

import React, { useState } from 'react';
import BarcodeScanner from '@/components/barcode/BarcodeScanner';

export default function ManifestScannerPage() {
  const [sessionBarcodes, setSessionBarcodes] = useState<any[]>([]);
  const [origin, setOrigin] = useState('Main Hub');
  const [destination, setDestination] = useState('Airport XYZ');
  const [airline, setAirline] = useState('AI');

  function handleDetected(code: string) {
    // avoid duplicates in the session
    if (sessionBarcodes.find((b) => b.code === code)) return;

    // POST to /api/scans (will create scan row and return scan metadata)
    fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode: code, scanType: 'scanned_for_manifest', location: origin }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.scan) {
          setSessionBarcodes((s) => [...s, { id: data.scan.id, code }]);
        } else {
          setSessionBarcodes((s) => [...s, { id: null, code }]);
        }
      })
      .catch((err) => {
        console.error(err);
        setSessionBarcodes((s) => [...s, { id: null, code }]);
      });
  }

  async function finalizeManifest() {
    // Resolve barcode ids for any entries without scan id
    const barcodeNumbers = sessionBarcodes.map((b) => b.code);
    const res = await fetch('/api/resolve-barcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcodes: barcodeNumbers }),
    });
    const { ids = [], resolved = [] } = await res.json();

    // Combine the ids (filter nulls)
    const resolvedIds = ids.filter(Boolean);

    // If some session entries returned null id, try to fetch barcodes by number on server side in manifest creation
    const payload = {
      manifestRef: `MAN-${Date.now()}`,
      originHub: origin,
      destination,
      airlineCode: airline,
      scannedBarcodeIds: resolvedIds,
      createdBy: null,
    };

    const create = await fetch('/api/manifests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const j = await create.json();
    if (j && j.success) {
      alert('Manifest created: ' + j.manifest.id);
      setSessionBarcodes([]);
    } else {
      alert('Failed to create manifest');
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Manifest Quick Scanner</h1>

      <div className="my-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="input" />
        <input value={destination} onChange={(e) => setDestination(e.target.value)} className="input" />
        <input value={airline} onChange={(e) => setAirline(e.target.value)} className="input" />
      </div>

      <BarcodeScanner onDetected={handleDetected} onError={(e) => console.error(e)} />

      <div className="mt-4">
        <h3 className="font-semibold">Session Scans ({sessionBarcodes.length})</h3>
        <ul className="list-disc pl-5">
          {sessionBarcodes.map((b, i) => (
            <li key={i}>
              {b.code} {b.id ? `(scan:${b.id})` : '(pending)'}
            </li>
          ))}
        </ul>

        <div className="mt-3">
          <button className="btn-primary" onClick={finalizeManifest} disabled={sessionBarcodes.length === 0}>
            Finalize Manifest
          </button>
        </div>
      </div>
    </div>
  );
}

Package installs & env checklist

Install these packages if you haven't already:

# scanner & barcode gen & puppeteer
npm install @zxing/browser bwip-js puppeteer


If deploying to serverless/Vercel, prefer puppeteer-core + @vercel/chromium or use a PDF service.

Add / check env vars in .env.local:

NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
SUPABASE_STORAGE_BUCKET=invoices
NEXT_PUBLIC_SITE_URL=http://localhost:3000

1) lib/storageHelpers.ts (server-only helpers)
Create lib/storageHelpers.ts:
// lib/storageHelpers.ts
import { supabaseAdmin } from './supabaseAdmin';

const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'invoices';

/**
 * Upload a Buffer to Supabase Storage (server-only; uses supabaseAdmin).
 * @param path - storage path (e.g. invoices/{invoiceId}/invoice.pdf)
 * @param buffer - Buffer|Uint8Array
 * @param contentType - MIME type
 */
export async function uploadBufferToStorage(path: string, buffer: Buffer | Uint8Array, contentType = 'application/octet-stream') {
  const bucket = DEFAULT_BUCKET;
  const { error, data } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (error) throw error;
  return data;
}

/**
 * Create a signed URL for a stored object (expires in seconds).
 */
export async function createSignedUrl(path: string, expiresSeconds = 60 * 60 * 24) {
  const bucket = DEFAULT_BUCKET;
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, expiresSeconds);
  if (error) throw error;
  return data.signedURL;
}


Note: This file uses supabaseAdmin created earlier. Only call from server-side routes or Server Actions.


2) app/invoices/page.tsx — invoices UI (App Router)
Create app/invoices/page.tsx (client component uses browser supabase client to list invoices and calls API to get signed link / WhatsApp send URL):
// app/invoices/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Invoice = {
  id: string;
  invoice_ref: string;
  customer_id: string | null;
  amount: number | null;
  status: string | null;
  created_at: string | null;
  pdf_path?: string | null;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) {
      console.error('failed fetch invoices', error);
      setLoading(false);
      return;
    }
    setInvoices(data ?? []);
    setLoading(false);
  }

  async function handleDownload(invoice: Invoice) {
    try {
      // ask server for a signed url (server will create signed url using storage helper)
      const res = await fetch(`/api/invoices/signed-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      const j = await res.json();
      if (j?.signedUrl) {
        window.open(j.signedUrl, '_blank');
      } else {
        alert('Failed to get PDF URL');
      }
    } catch (e) {
      console.error(e);
      alert('Error');
    }
  }

  async function handleWhatsAppSend(invoice: Invoice) {
    setActionLoading((s) => ({ ...s, [invoice.id]: true }));
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id, mode: 'mvp' }), // mode: mvp | prod
      });
      const j = await res.json();
      if (j?.waUrl) {
        // open WhatsApp web with prefilled message (admin must click send)
        window.open(j.waUrl, '_blank');
      } else if (j?.success) {
        alert('WhatsApp API responded: ' + JSON.stringify(j));
      } else {
        alert('Failed to prepare WhatsApp send');
        console.warn(j);
      }
    } catch (e) {
      console.error(e);
      alert('Error sending WhatsApp');
    } finally {
      setActionLoading((s) => ({ ...s, [invoice.id]: false }));
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Invoices</h1>
      {loading ? <div>Loading...</div> : null}
      <div className="mt-4 space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="p-3 rounded-md bg-surface flex items-center justify-between">
            <div>
              <div className="font-semibold">{inv.invoice_ref}</div>
              <div className="text-sm text-muted">Amount: {inv.amount ?? '-'}, Status: {inv.status}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={() => handleDownload(inv)}>Download PDF</button>
              <button className="btn-primary" onClick={() => handleWhatsAppSend(inv)} disabled={actionLoading[inv.id]}>
                {actionLoading[inv.id] ? 'Preparing...' : 'Send via WhatsApp'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


This page expects two server routes:


/api/invoices/signed-url (we will add next) — returns signed URL for invoice PDF.


/api/whatsapp/send (we will add next) — returns a waUrl for the MVP or triggers production API.




3) app/api/invoices/signed-url/route.ts — server route to return signed PDF URL
Create app/api/invoices/signed-url/route.ts (server-only):
// app/api/invoices/signed-url/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSignedUrl } from '@/lib/storageHelpers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId } = body;
    if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });

    const { data: inv } = await supabaseAdmin.from('invoices').select('pdf_path, invoice_ref').eq('id', invoiceId).maybeSingle();
    if (!inv || !inv.pdf_path) return NextResponse.json({ error: 'No pdf_path for invoice' }, { status: 404 });

    const signedUrl = await createSignedUrl(inv.pdf_path, 60 * 60); // 1 hour
    return NextResponse.json({ signedUrl });
  } catch (err: any) {
    console.error('signed-url error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


4) app/api/whatsapp/send/route.ts — WhatsApp send route (MVP & prod example)
Create app/api/whatsapp/send/route.ts:
// app/api/whatsapp/send/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSignedUrl } from '@/lib/storageHelpers';

type Body = {
  invoiceId: string;
  mode?: 'mvp' | 'prod';
  toPhone?: string; // optional override
};

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { invoiceId, mode = 'mvp', toPhone } = body;

    if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });

    // fetch invoice & customer details
    const { data: inv } = await supabaseAdmin.from('invoices').select('id, invoice_ref, pdf_path, customer_id, amount').eq('id', invoiceId).maybeSingle();
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const { data: customer } = await supabaseAdmin.from('customers').select('id, name, phone').eq('id', inv.customer_id).maybeSingle();

    // create signed URL for the invoice PDF (short lived)
    const signedUrl = inv.pdf_path ? await createSignedUrl(inv.pdf_path, 60 * 60 * 24) : null;

    // MVP mode: return a WhatsApp Web URL that pre-fills the message (admin must press send)
    if (mode === 'mvp') {
      // choose number to send to: function parameter overrides customer phone
      const phone = (toPhone || customer?.phone || '').replace(/\D/g, ''); // digits only
      // Prepare message: text + signed url
      const message = encodeURIComponent(
        `Hello ${customer?.name ?? ''}, here is your invoice ${inv.invoice_ref}.\nAmount: ${inv.amount ?? ''}\nDownload: ${signedUrl ?? ''}\n\n- ${process.env.NEXT_PUBLIC_SITE_URL ?? 'Tapan Go'}`
      );

      if (!phone) {
        // If no phone, return signedUrl and ask UI to copy link
        return NextResponse.json({ waUrl: `https://web.whatsapp.com/`, signedUrl, note: 'No phone available for customer' });
      }

      // wa.me doesn't accept extra text param for web.whatsapp.com send, so use `https://web.whatsapp.com/send?phone=XXX&text=...`
      const waUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;
      return NextResponse.json({ waUrl });
    }

    // PROD mode: example using WhatsApp Business Cloud API (Meta) - requires business verification & token
    // If env var WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID are configured, attempt to send via API
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID; // from Meta dashboard
    if (!token || !phoneNumberId) {
      return NextResponse.json({ error: 'WhatsApp token or phone number id not configured for prod mode' }, { status: 500 });
    }

    const to = (toPhone || customer?.phone || '').replace(/\D/g, '');
    if (!to) return NextResponse.json({ error: 'Recipient phone missing' }, { status: 400 });

    // Build request to WhatsApp Cloud API: sending a document (PDF)
    // See Meta docs: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-media-messages
    const apiUrl = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'document',
      document: {
        link: signedUrl,
        filename: `${inv.invoice_ref}.pdf`,
      },
    };

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await resp.json();
    if (!resp.ok) {
      console.error('whatsapp api error', json);
      return NextResponse.json({ error: 'WhatsApp API error', detail: json }, { status: 500 });
    }

    // Optionally store message log somewhere; return success
    return NextResponse.json({ success: true, result: json });
  } catch (err: any) {
    console.error('whatsapp send error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

Notes on app/api/whatsapp/send/route.ts


MVP (default): safe, no API keys, returns web.whatsapp.com/send?phone=...&text=... URL for admin to open and click send. Works with WhatsApp Web.


Prod: if you set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID, the route attempts to call the WhatsApp Cloud API (Meta). You must follow Business verification steps, have a paid template for notifications if sending outside of a 24-hour session, and follow Meta policies.


Env vars required for Prod:
WHATSAPP_API_TOKEN=<Meta-Access-Token>
WHATSAPP_PHONE_NUMBER_ID=<your-phone-number-id-from-meta>

Security: store those secrets in server-only environment, never expose in client.

5) Dependencies & env recap
Install packages if not present:
npm install @zxing/browser bwip-js puppeteer
# you might need node-fetch for older Node runtimes, but Next.js has `fetch` available in server runtime

Environment variables (add to .env.local):
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=invoices
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional for WhatsApp Business API (prod)
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...


6) Security & operational notes (short)


MVP method requires admin to be logged into WhatsApp Web. It’s quick and safe for initial testing.


Production: use WhatsApp Business Cloud API to send documents programmatically — requires business verification, templates for notifications outside 24h windows, and caution with rate limits.


Use signed URLs with short lifetimes for PDFs to avoid leaking invoices publicly.


Keep SUPABASE_SERVICE_ROLE_KEY and WHATSAPP_API_TOKEN strictly server-only.



If you want I can now:


scaffold app/api/invoices/signed-url/route.ts and app/api/whatsapp/send/route.ts into the canvas (I already gave full code above), or


wire the Invoice generation flow to call app/api/invoices/generate to create invoices and PDFs end-to-end, or


fully wire the invoices page to show customer name (join query) and show invoice status with pagination.


I picked the WhatsApp + invoice-download path because it’s the most immediately useful for the company operations (send invoices fast) while leaving the heavy PDF generation already scaffolded earlier. Want me to also auto-wire the invoice page to call invoices/generate so you can generate missing PDFs with one click?

Supabase + Barcode Scanner Implementation

This file contains everything to start wiring Supabase (schema + client helpers) and a production-ready barcode scanner React component (with camera + keyboard-emulated scanner fallback) for your Next.js 14 app.

1) SQL Schema (paste into Supabase SQL editor)


1) SQL Schema (paste into Supabase SQL editor)

-- Enable pgcrypto for gen_random_uuid()
status text,
progress int,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);


-- barcodes
CREATE TABLE IF NOT EXISTS barcodes (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
barcode_number text UNIQUE NOT NULL,
shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE,
status text,
last_scanned_at timestamptz,
last_scanned_location text,
created_at timestamptz DEFAULT now()
);


-- package_scans (audit trail)
CREATE TABLE IF NOT EXISTS package_scans (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
barcode_id uuid REFERENCES barcodes(id) ON DELETE CASCADE,
scanned_at timestamptz DEFAULT now(),
scanned_by uuid,
location text,
scan_type text,
manifest_id uuid NULL,
metadata jsonb
);


-- manifests
CREATE TABLE IF NOT EXISTS manifests (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
manifest_ref text UNIQUE NOT NULL,
origin_hub text,
destination text,
airline_code text,
manifest_date date,
total_weight numeric,
total_pieces int,
status text,
created_by uuid,
created_at timestamptz DEFAULT now()
);


-- manifest_items
CREATE TABLE IF NOT EXISTS manifest_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
manifest_id uuid REFERENCES manifests(id) ON DELETE CASCADE,
shipment_id uuid REFERENCES shipments(id) ON DELETE SET NULL,
barcode_id uuid REFERENCES barcodes(id) ON DELETE SET NULL,
weight numeric
);


-- invoices
CREATE TABLE IF NOT EXISTS invoices (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
invoice_ref text UNIQUE NOT NULL,
customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
amount numeric,
status text,
invoice_date date DEFAULT now(),
due_date date,
pdf_path text,
created_by uuid,
created_at timestamptz DEFAULT now()
);


-- users
CREATE TABLE IF NOT EXISTS users (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
email text UNIQUE,
name text,
role text,
created_at timestamptz DEFAULT now()
);


-- Search vector example for shipments
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE shipments SET search_vector = to_tsvector(coalesce(shipment_ref,'') || ' ' || coalesce(origin,'') || ' ' || coalesce(destination,''));
CREATE INDEX IF NOT EXISTS idx_shipments_search ON shipments USING GIN(search_vector);


-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_barcodes_number ON barcodes(barcode_number);
CREATE INDEX IF NOT EXISTS idx_package_scans_barcode_id ON package_scans(barcode_id);

2) Supabase client helpers (Next.js)

Create two files in lib/:

lib/supabaseClient.ts (browser-safe)

// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';


const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


if (!url || !anonKey) throw new Error('Missing Supabase env variables');


export const supabase = createClient(url, anonKey, {
realtime: { params: { eventsPerSecond: 10 } }
});

lib/supabaseAdmin.ts (server-only for privileged ops)

// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';


const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;


if (!url || !serviceRole) throw new Error('Missing Supabase admin env variables');


export const supabaseAdmin = createClient(url, serviceRole, {
auth: { persistSession: false }
});

Note: SUPABASE_SERVICE_ROLE_KEY must never be exposed to the browser. Put it only in deployment secrets and server environment.

3) Server endpoint example: create invoice + generate barcode entries

Create app/api/invoices/route.ts (App Router API route). This is a minimal example demonstrating DB writes and generating barcode numbers; it expects supabaseAdmin to be used.

// app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';


export async function POST(req: Request) {
try {
const body = await req.json();
const { customerId, packages, amount } = body;


// Create invoice row
const invoiceRef = `INV-${Date.now()}`;
const { data: invoice, error: invErr } = await supabaseAdmin
.from('invoices')
.insert([{ invoice_ref: invoiceRef, customer_id: customerId, amount, status: 'pending' }])
.select('*')
.single();


if (invErr) throw invErr;


// For each package generate barcode row
const barcodeRecords = packages.map((p: any) => ({
barcode_number: p.barcodeNumber || `B-${Date.now()}-${Math.floor(Math.random()*9999)}`,
shipment_id: p.shipmentId,
status: 'created'
}));


const { data: barcodes, error: bcErr } = await supabaseAdmin.from('barcodes').insert(barcodeRecords).select('*');
if (bcErr) throw bcErr;


return NextResponse.json({ invoice, barcodes });
} catch (err: any) {
console.error(err);
return NextResponse.json({ error: err.message }, { status: 500 });
}
}

This route creates an invoice row and corresponding barcode rows. In production you'll also:

Generate barcode image assets (server-side via bwip-js or similar) and upload to Supabase Storage.

Render invoice HTML → PDF (Puppeteer) and upload PDF to Supabase Storage, then update invoices.pdf_path.

4) Barcode scanner React component (camera + keyboard fallback)

File: components/barcode/BarcodeScanner.tsx

// components/barcode/BarcodeScanner.tsx


// collect printable characters
if (e.key.length === 1) {
kbBufferRef.current += e.key;
// clear buffer if no keys for 100ms (likely user typing)
if (kbTimerRef.current) window.clearTimeout(kbTimerRef.current);
kbTimerRef.current = window.setTimeout(() => {
kbBufferRef.current = '';
}, 120);
}
}


window.addEventListener('keydown', onKey);
return () => window.removeEventListener('keydown', onKey);
}, [onDetected]);


async function startScanner() {
setScanning(true);
try {
const video = videoRef.current!;
await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });


// ask ZXing to decode from the video element
codeReaderRef.current!.decodeFromVideoDevice(undefined, video, (result: Result | undefined, err) => {
if (result) {
onDetected(result.getText());
}
if (err && !(err as any).message?.includes('No multi-format readers were able')) {
// ignore common "not found" messages
console.debug('zxing error', err);
}
});
} catch (err) {
setScanning(false);
onError?.(err);
}
}


function stopScanner() {
setScanning(false);
try {
codeReaderRef.current?.reset();
// stop tracks
const video = videoRef.current;
if (video && video.srcObject) {
(video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
video.srcObject = null;
}
} catch (e) {
console.warn(e);
}
}


return (
<div className="p-2 bg-surface rounded-md">
<div className="flex gap-2 items-center">
<button
className="btn"
onClick={() => (scanning ? stopScanner() : startScanner())}
>
{scanning ? 'Stop Camera' : 'Start Camera'}
</button>
<div className="text-sm text-muted">Or scan with a handheld keyboard scanner (focus any input) — it auto-detects Enter.</div>
</div>


<div className="mt-2">
<video
ref={videoRef}
style={{ width: '100%', maxHeight: 360, borderRadius: 8 }}
muted
playsInline
/>
</div>


<div className="mt-2 text-xs text-muted">
Tip: Use a high-contrast label (code128) printed on the package for better read rates. If camera does not work, use your USB/Bluetooth scanner — it will type into active input and send Enter.
</div>
</div>
);
}

Usage (example page snippet):

import React from 'react';
import BarcodeScanner from '@/components/barcode/BarcodeScanner';


export default function ScanPage() {
function handleDetected(code: string) {
// call API to register scan
fetch('/api/scans', {

Done — I added an invoice-generation audit trail and the accompanying pieces into the implementation document:

What I implemented (and where to find them in the repo):

SQL to create invoice_generation_logs (run in Supabase).

lib/invoiceGenerator.ts updated to create/update log rows (pending → success/failed) with timestamps, duration, message, and JSON details.

New API route POST /api/invoices/logs to list logs for an invoice (supports pagination).

Small App Router UI page app/invoices/logs/page.tsx to view logs, inspect failed details, and re-run generation for a selected invoice.

Next steps for you:

Run the SQL migration in Supabase to create the invoice_generation_logs table.

Deploy the updated server code (the generator and API routes).

Test generation via the invoices UI and inspect logs in the new logs page.

Extras I can add (pick any, or I’ll choose next): automated Slack/email alerts on repeated failures, retry/backoff for transient Puppeteer errors, or a bulk admin tool to re-generate failed invoices.
I’ll pick automated failure alerts (Slack) next if you want me to proceed — it catches errors early and is very useful for ops. Should I add Slack alerts?