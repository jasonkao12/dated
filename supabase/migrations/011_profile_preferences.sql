-- Profile date preferences + onboarding tracking

alter table public.profiles
  add column if not exists preferences jsonb default '{}'::jsonb,
  add column if not exists onboarding_completed boolean not null default false;

comment on column public.profiles.preferences is
  'Date-planning preferences: transport_mode, max_travel_minutes, home_neighbourhood, '
  'travel_beyond_vancouver, dietary, drinks_alcohol, activity_level, date_length, '
  'date_timing, relationship_stage, partner_name, repetition_preference (-2=only new … 2=only familiar)';
