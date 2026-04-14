-- Categories: canonical list for tagging reviews and places
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  emoji      text not null,
  created_at timestamptz not null default now()
);

insert into categories (name, emoji) values
  ('Restaurants',           '🍽️'),
  ('Cafes',                 '☕'),
  ('Nature & Outdoors',     '🌿'),
  ('Indoor Activities',     '🏛️'),
  ('Arts & Culture',        '🎨'),
  ('Games & Entertainment', '🎮'),
  ('Nightlife',             '🌙'),
  ('Wellness',              '🧘'),
  ('Day Trip',              '🌅'),
  ('Road Trip',             '🚗'),
  ('Vacation',              '✈️'),
  ('First Date',            '✨'),
  ('Anniversary',           '💍'),
  ('Romantic',              '🕯️'),
  ('Budget-friendly',       '💸'),
  ('Experiences',           '🌟')
on conflict (name) do nothing;

-- Join table: many reviews ↔ many categories
create table if not exists review_categories (
  review_id   uuid not null references reviews(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (review_id, category_id)
);
