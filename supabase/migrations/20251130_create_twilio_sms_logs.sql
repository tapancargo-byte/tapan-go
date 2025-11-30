create table if not exists public.twilio_sms_logs (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null
    references public.invoices (id) on delete cascade,
  to_phone text not null,
  status text not null,
  error_message text,
  provider_message_id text,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists twilio_sms_logs_invoice_id_idx
  on public.twilio_sms_logs (invoice_id);

create index if not exists twilio_sms_logs_provider_message_id_idx
  on public.twilio_sms_logs (provider_message_id);
