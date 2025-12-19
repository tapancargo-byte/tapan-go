-- ============================================================
-- MIGRATION: 20251220_create_barcode_ops
-- DESCRIPTION: Implements core tables for Barcode Cargo Ops
-- TABLES: barcodes, scan_events, manifests, manifest_items
-- ============================================================

-- 1. BARCODES TABLE
-- Tracks individual physical items (boxes/pieces) linked to a shipment
create table if not exists public.barcodes (
  id uuid primary key default gen_random_uuid(),
  barcode text not null unique, -- Format: TAC-YYYYMMDD-SEQ
  shipment_id uuid references public.shipments(id) on delete cascade,
  status text not null default 'CREATED', -- CREATED, PICKED_UP, WAREHOUSE_IN, MANIFESTED, etc.
  current_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. SCAN EVENTS TABLE
-- Immutable log of every scan action
create table if not exists public.scan_events (
  id uuid primary key default gen_random_uuid(),
  barcode_id uuid references public.barcodes(id) on delete cascade,
  previous_status text,
  new_status text,
  location text,
  operator_id uuid references auth.users(id),
  device_id text,
  meta jsonb, -- Extra data (session_id, battery_level, etc.)
  created_at timestamptz not null default now()
);

-- 3. MANIFESTS TABLE
-- Groups barcodes for a specific transport leg (e.g., Flight)
create table if not exists public.manifests (
  id uuid primary key default gen_random_uuid(),
  manifest_ref text not null unique,
  flight_number text,
  flight_date date,
  origin text,
  destination text,
  status text not null default 'OPEN', -- OPEN, LOCKED, DEPARTED, ARRIVED
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. MANIFEST ITEMS TABLE
-- Link table between Manifests and Barcodes
create table if not exists public.manifest_items (
  manifest_id uuid references public.manifests(id) on delete cascade,
  barcode_id uuid references public.barcodes(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  operator_id uuid references auth.users(id),
  primary key (manifest_id, barcode_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_barcodes_shipment_id on public.barcodes(shipment_id);
create index if not exists idx_barcodes_barcode on public.barcodes(barcode);
create index if not exists idx_barcodes_status on public.barcodes(status);

create index if not exists idx_scan_events_barcode_id on public.scan_events(barcode_id);
create index if not exists idx_scan_events_created_at on public.scan_events(created_at desc);
create index if not exists idx_scan_events_operator_id on public.scan_events(operator_id);

create index if not exists idx_manifests_status on public.manifests(status);
create index if not exists idx_manifests_flight_date on public.manifests(flight_date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.barcodes enable row level security;
alter table public.scan_events enable row level security;
alter table public.manifests enable row level security;
alter table public.manifest_items enable row level security;

-- POLICIES: BARCODES

-- Admins/Operators: Full Access
create policy "ops_manage_barcodes" on public.barcodes
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'operator'))
  );

-- Customers: View Own Barcodes (via Shipment)
create policy "cust_view_own_barcodes" on public.barcodes
  for select using (
    exists (
      select 1 from public.shipments s
      join public.customers c on s.customer_id = c.id
      where s.id = public.barcodes.shipment_id
      and c.user_id = auth.uid()
    )
  );

-- POLICIES: SCAN EVENTS

-- Admins/Operators: Full Access (Insert/Select mainly, immutable log)
create policy "ops_manage_scan_events" on public.scan_events
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'operator'))
  );

-- Customers: View Own Scan Events (via Barcode -> Shipment)
create policy "cust_view_own_scan_events" on public.scan_events
  for select using (
    exists (
      select 1 from public.barcodes b
      join public.shipments s on b.shipment_id = s.id
      join public.customers c on s.customer_id = c.id
      where b.id = public.scan_events.barcode_id
      and c.user_id = auth.uid()
    )
  );

-- POLICIES: MANIFESTS

-- Admins/Operators: Full Access
create policy "ops_manage_manifests" on public.manifests
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'operator'))
  );

-- Customers: No access to internal manifests usually, or read-only if specific logic required.
-- Defined: No customer access for now.

-- POLICIES: MANIFEST ITEMS

-- Admins/Operators: Full Access
create policy "ops_manage_manifest_items" on public.manifest_items
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'operator'))
  );

-- ============================================================
-- FUNCTIONS (RPC)
-- ============================================================

-- Function: process_scan_event
-- Purpose: Atomically update barcode status and log the event
create or replace function public.process_scan_event(
  p_barcode_id uuid,
  p_new_status text,
  p_location text,
  p_operator_id uuid,
  p_device_id text default null,
  p_meta jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_old_status text;
  v_barcode_exists boolean;
  v_result jsonb;
begin
  -- 1. Check if barcode exists and lock it
  select status into v_old_status
  from public.barcodes
  where id = p_barcode_id
  for update; -- Lock the row

  if not found then
    return jsonb_build_object('success', false, 'error', 'Barcode not found');
  end if;

  -- 2. Insert Scan Event
  insert into public.scan_events (
    barcode_id,
    previous_status,
    new_status,
    location,
    operator_id,
    device_id,
    meta
  ) values (
    p_barcode_id,
    v_old_status,
    p_new_status,
    p_location,
    p_operator_id,
    p_device_id,
    p_meta
  );

  -- 3. Update Barcode Status
  update public.barcodes
  set 
    status = p_new_status,
    current_location = p_location,
    updated_at = now()
  where id = p_barcode_id;

  -- 4. Return success
  return jsonb_build_object(
    'success', true,
    'barcode_id', p_barcode_id,
    'old_status', v_old_status,
    'new_status', p_new_status
  );

exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;
