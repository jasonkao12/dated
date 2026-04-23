-- Track which welcome sequence emails have been sent per user
alter table public.profiles
  add column if not exists welcome_emailed    boolean not null default false,
  add column if not exists nudge_emailed      boolean not null default false,
  add column if not exists discovery_emailed  boolean not null default false;
