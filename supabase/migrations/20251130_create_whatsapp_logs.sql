create table if not exists public.whatsapp_logs (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null
    references public.invoices (id) on delete cascade,
  phone text,
  mode text,
  status text not null,
  error_message text,
  provider_message_id text,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists whatsapp_logs_invoice_id_idx
  on public.whatsapp_logs (invoice_id);

create index if not exists whatsapp_logs_created_at_idx
  on public.whatsapp_logs (created_at);
