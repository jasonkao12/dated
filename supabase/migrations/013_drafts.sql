-- Draft support for reviews and date plans
alter table public.reviews
  add column if not exists is_draft boolean not null default false;

alter table public.date_plans
  add column if not exists is_draft boolean not null default false;

-- Fast lookups for draft management pages
create index if not exists reviews_draft_idx    on public.reviews(user_id, is_draft);
create index if not exists date_plans_draft_idx on public.date_plans(user_id, is_draft);
