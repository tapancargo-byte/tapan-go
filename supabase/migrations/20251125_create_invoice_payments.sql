-- Migration: create invoice_payments table used by /api/payments and /api/finance/ar

create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null
    references public.invoices (id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  payment_date timestamptz not null default now(),
  payment_mode text,
  reference text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index if not exists invoice_payments_invoice_id_idx
  on public.invoice_payments (invoice_id);

create index if not exists invoice_payments_invoice_id_payment_date_idx
  on public.invoice_payments (invoice_id, payment_date);
