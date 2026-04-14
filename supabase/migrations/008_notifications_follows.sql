-- Notifications table: stores in-app + email notification records
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  actor_id    uuid references profiles(id) on delete set null,
  type        text not null check (type in ('comment', 'reaction', 'couple_accepted', 'new_follower')),
  review_id   uuid references reviews(id) on delete cascade,
  body        text,
  read        boolean not null default false,
  emailed     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, created_at desc);

-- Notification preferences
create table if not exists notification_preferences (
  user_id             uuid primary key references profiles(id) on delete cascade,
  email_comments      boolean not null default true,
  email_reactions     boolean not null default true,
  email_couple        boolean not null default true,
  email_followers     boolean not null default true,
  updated_at          timestamptz not null default now()
);

create trigger set_notification_preferences_updated
  before update on notification_preferences
  for each row execute function moddatetime(updated_at);

-- Follows table
create table if not exists follows (
  id          uuid primary key default gen_random_uuid(),
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint follows_unique unique (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index idx_follows_following on follows(following_id);
create index idx_follows_follower on follows(follower_id);

-- RLS
alter table notifications enable row level security;
alter table notification_preferences enable row level security;
alter table follows enable row level security;

-- Notifications: users can only see their own
create policy "Users can view own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = user_id);

-- Allow service role to insert notifications (via API route)
create policy "Service can insert notifications"
  on notifications for insert with check (true);

-- Notification preferences: users manage their own
create policy "Users can view own preferences"
  on notification_preferences for select using (auth.uid() = user_id);

create policy "Users can upsert own preferences"
  on notification_preferences for insert with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on notification_preferences for update using (auth.uid() = user_id);

-- Follows: anyone can see, authenticated users can follow/unfollow
create policy "Anyone can view follows"
  on follows for select using (true);

create policy "Authenticated users can follow"
  on follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete using (auth.uid() = follower_id);
