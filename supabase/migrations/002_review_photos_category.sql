-- Add category column to review_photos to track which rating section a photo belongs to
alter table public.review_photos
  add column if not exists category text check (
    category in ('overall', 'ambiance', 'food', 'service', 'value', 'vibe')
  );

-- Create Supabase Storage buckets (run via Supabase dashboard if this errors)
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('review-photos', 'review-photos', true)
  on conflict (id) do nothing;

-- Storage policies for avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for review photos
create policy "Review photos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'review-photos');

create policy "Users can upload review photos"
  on storage.objects for insert
  with check (bucket_id = 'review-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own review photos"
  on storage.objects for delete
  using (bucket_id = 'review-photos' and auth.uid()::text = (storage.foldername(name))[1]);
