create table if not exists public.auth_lockouts (
  email_hash text primary key,
  login_failed_count integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.auth_lockouts enable row level security;

drop policy if exists "admins_all_auth_lockouts" on public.auth_lockouts;
create policy "admins_all_auth_lockouts" on public.auth_lockouts
  for all
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  );
