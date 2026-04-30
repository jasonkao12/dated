-- Link reviews back to a date plan (optional — venue-only reviews have no plan)
alter table public.reviews
  add column if not exists plan_id uuid references public.date_plans(id) on delete set null;

create index if not exists reviews_plan_id_idx on public.reviews(plan_id);

comment on column public.reviews.plan_id is
  'Optional link to the date_plan this review is about. Null for standalone venue reviews.';
