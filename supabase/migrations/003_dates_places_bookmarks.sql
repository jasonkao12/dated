-- ============================================================
-- DATE PLANS (multi-stop itineraries)
-- ============================================================
create table public.date_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  description text,
  status text not null default 'completed'
    check (status in ('saved', 'planned', 'completed')),
  visited_on date,
  is_public boolean not null default true,
  rating_overall numeric(2,1) check (rating_overall between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.date_plans(user_id);
create index on public.date_plans(is_public, created_at desc);
create index on public.date_plans(status);

-- ============================================================
-- DATE STOPS (individual stops within a date plan)
-- ============================================================
create table public.date_stops (
  id uuid primary key default uuid_generate_v4(),
  date_plan_id uuid references public.date_plans(id) on delete cascade not null,
  place_id uuid references public.places(id) on delete set null,
  stop_order int not null default 0,
  duration_minutes int,                   -- how long you plan to stay
  travel_time_to_next_minutes int,        -- Google Distance Matrix API result
  notes text,
  created_at timestamptz not null default now()
);

create index on public.date_stops(date_plan_id);

-- ============================================================
-- BOOKMARKS (saved for later — reviews or places)
-- ============================================================
create table public.bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  review_id uuid references public.reviews(id) on delete cascade,
  place_id uuid references public.places(id) on delete cascade,
  date_plan_id uuid references public.date_plans(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (
    (review_id is not null)::int +
    (place_id is not null)::int +
    (date_plan_id is not null)::int = 1
  )
);

-- Partial unique indexes so one user can't bookmark the same item twice
create unique index bookmarks_user_review  on public.bookmarks(user_id, review_id)    where review_id    is not null;
create unique index bookmarks_user_place   on public.bookmarks(user_id, place_id)     where place_id     is not null;
create unique index bookmarks_user_date    on public.bookmarks(user_id, date_plan_id) where date_plan_id is not null;

-- ============================================================
-- FAVOURITES
-- ============================================================
create table public.favourites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  review_id uuid references public.reviews(id) on delete cascade,
  place_id uuid references public.places(id) on delete cascade,
  date_plan_id uuid references public.date_plans(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (
    (review_id is not null)::int +
    (place_id is not null)::int +
    (date_plan_id is not null)::int = 1
  )
);

create unique index favourites_user_review  on public.favourites(user_id, review_id)    where review_id    is not null;
create unique index favourites_user_place   on public.favourites(user_id, place_id)     where place_id     is not null;
create unique index favourites_user_date    on public.favourites(user_id, date_plan_id) where date_plan_id is not null;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- date_plans
alter table public.date_plans enable row level security;
create policy "Public date plans viewable by everyone"
  on public.date_plans for select
  using (is_public = true or auth.uid() = user_id);
create policy "Users can insert their own date plans"
  on public.date_plans for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own date plans"
  on public.date_plans for update
  using (auth.uid() = user_id);
create policy "Users can delete their own date plans"
  on public.date_plans for delete
  using (auth.uid() = user_id);

-- date_stops
alter table public.date_stops enable row level security;
create policy "Date stops viewable if plan is viewable"
  on public.date_stops for select
  using (
    exists (
      select 1 from public.date_plans dp
      where dp.id = date_plan_id
        and (dp.is_public = true or dp.user_id = auth.uid())
    )
  );
create policy "Users can manage stops on their own date plans"
  on public.date_stops for insert
  with check (
    exists (select 1 from public.date_plans dp where dp.id = date_plan_id and dp.user_id = auth.uid())
  );
create policy "Users can update stops on their own plans"
  on public.date_stops for update
  using (
    exists (select 1 from public.date_plans dp where dp.id = date_plan_id and dp.user_id = auth.uid())
  );
create policy "Users can delete stops on their own plans"
  on public.date_stops for delete
  using (
    exists (select 1 from public.date_plans dp where dp.id = date_plan_id and dp.user_id = auth.uid())
  );

-- bookmarks
alter table public.bookmarks enable row level security;
create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);
create policy "Users can create bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);
create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- favourites
alter table public.favourites enable row level security;
create policy "Users can view their own favourites"
  on public.favourites for select
  using (auth.uid() = user_id);
create policy "Users can create favourites"
  on public.favourites for insert
  with check (auth.uid() = user_id);
create policy "Users can delete their own favourites"
  on public.favourites for delete
  using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-update updated_at on date_plans
-- ============================================================
create trigger set_updated_at before update on public.date_plans
  for each row execute procedure public.set_updated_at();
