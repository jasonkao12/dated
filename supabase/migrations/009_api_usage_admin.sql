-- API usage logging
create table if not exists api_usage_logs (
  id          uuid primary key default gen_random_uuid(),
  service     text not null check (service in ('gemini', 'google_places', 'resend')),
  endpoint    text,
  status      text not null default 'success' check (status in ('success', 'error')),
  tokens_in   integer,
  tokens_out  integer,
  cost_cents  numeric(10, 4),
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index idx_api_usage_service_date on api_usage_logs(service, created_at desc);

-- Admin flag on profiles
alter table profiles add column if not exists is_admin boolean not null default false;

-- RLS
alter table api_usage_logs enable row level security;

-- Only service role can insert (via admin client)
create policy "Service can insert usage logs"
  on api_usage_logs for insert with check (true);

-- Only admins can read
create policy "Admins can view usage logs"
  on api_usage_logs for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
