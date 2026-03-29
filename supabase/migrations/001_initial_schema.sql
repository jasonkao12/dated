-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy search on place names

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  tos_accepted_at timestamptz,
  tos_version text,
  privacy_policy_accepted_at timestamptz,
  privacy_policy_version text,
  marketing_opt_in boolean not null default false,
  marketing_opt_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PLACES (venues / restaurants)
-- ============================================================
create table public.places (
  id uuid primary key default uuid_generate_v4(),
  google_place_id text unique,
  name text not null,
  address text,
  city text,
  country text,
  lat double precision,
  lng double precision,
  place_type text, -- 'restaurant', 'bar', 'activity', 'experience', etc.
  hours_json jsonb,           -- raw hours from Google Places
  website text,
  phone text,
  price_level int,            -- 1-4 (Google's scale)
  last_refreshed_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.places using gin(name gin_trgm_ops);
create index on public.places(google_place_id);

-- ============================================================
-- DATE TAGS
-- ============================================================
create table public.date_tags (
  id uuid primary key default uuid_generate_v4(),
  label text unique not null,   -- e.g. 'first date', 'anniversary', 'group', 'proposal'
  emoji text,
  created_at timestamptz not null default now()
);

insert into public.date_tags (label, emoji) values
  ('First Date', '✨'),
  ('Anniversary', '💍'),
  ('Casual', '☕'),
  ('Special Occasion', '🎉'),
  ('Group', '👥'),
  ('Proposal', '💎'),
  ('Spontaneous', '⚡'),
  ('Celebration', '🥂');

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,          -- public URL slug
  user_id uuid references public.profiles(id) on delete cascade not null,
  place_id uuid references public.places(id) on delete set null,
  title text not null,
  body text,
  visited_on date,

  -- Ratings (1-5)
  rating_overall numeric(2,1) check (rating_overall between 1 and 5),
  rating_ambiance numeric(2,1) check (rating_ambiance between 1 and 5),
  rating_food numeric(2,1) check (rating_food between 1 and 5),
  rating_service numeric(2,1) check (rating_service between 1 and 5),
  rating_value numeric(2,1) check (rating_value between 1 and 5),
  rating_vibe numeric(2,1) check (rating_vibe between 1 and 5),   -- "date-worthiness"

  is_public boolean not null default true,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.reviews(user_id);
create index on public.reviews(place_id);
create index on public.reviews(slug);
create index on public.reviews(is_public, created_at desc);

-- ============================================================
-- REVIEW PHOTOS
-- ============================================================
create table public.review_photos (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references public.reviews(id) on delete cascade not null,
  storage_path text not null,   -- Supabase Storage path
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- REVIEW TAGS (join)
-- ============================================================
create table public.review_tags (
  review_id uuid references public.reviews(id) on delete cascade,
  tag_id uuid references public.date_tags(id) on delete cascade,
  primary key (review_id, tag_id)
);

-- ============================================================
-- REACTIONS (others reacting to a review)
-- ============================================================
create table public.reactions (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references public.reviews(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction_type text not null check (reaction_type in ('heart', 'fire', 'want_to_go', 'been_here')),
  created_at timestamptz not null default now(),
  unique (review_id, user_id, reaction_type)
);

-- ============================================================
-- PLACE STALE FLAGS (user-reported)
-- ============================================================
create table public.place_refresh_requests (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid references public.places(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  reason text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Places
alter table public.places enable row level security;
create policy "Places are viewable by everyone" on public.places for select using (true);
create policy "Authenticated users can insert places" on public.places for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update places" on public.places for update using (auth.role() = 'authenticated');

-- Reviews
alter table public.reviews enable row level security;
create policy "Public reviews are viewable by everyone" on public.reviews for select using (is_public = true or auth.uid() = user_id);
create policy "Authenticated users can insert reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can update their own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Users can delete their own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- Review photos
alter table public.review_photos enable row level security;
create policy "Review photos follow review visibility" on public.review_photos for select using (
  exists (select 1 from public.reviews r where r.id = review_id and (r.is_public = true or r.user_id = auth.uid()))
);
create policy "Review owners can manage photos" on public.review_photos for insert with check (
  exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid())
);
create policy "Review owners can delete photos" on public.review_photos for delete using (
  exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid())
);

-- Review tags
alter table public.review_tags enable row level security;
create policy "Review tags are public" on public.review_tags for select using (true);
create policy "Review owners can manage tags" on public.review_tags for insert with check (
  exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid())
);
create policy "Review owners can delete tags" on public.review_tags for delete using (
  exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid())
);

-- Date tags
alter table public.date_tags enable row level security;
create policy "Date tags are public" on public.date_tags for select using (true);

-- Reactions
alter table public.reactions enable row level security;
create policy "Reactions are viewable by everyone" on public.reactions for select using (true);
create policy "Authenticated users can react" on public.reactions for insert with check (auth.uid() = user_id);
create policy "Users can remove their own reactions" on public.reactions for delete using (auth.uid() = user_id);

-- Place refresh requests
alter table public.place_refresh_requests enable row level security;
create policy "Authenticated users can flag places" on public.place_refresh_requests for insert with check (auth.role() = 'authenticated');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at before update on public.reviews
  for each row execute procedure public.set_updated_at();
