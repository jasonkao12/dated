-- ============================================================
-- DATED — Seed Data
-- ============================================================
-- HOW TO RUN:
--   1. Go to your Supabase project → SQL Editor
--   2. Paste this entire file and click Run
--   3. To reset: run the cleanup block at the bottom first,
--      then re-run the full file
--
-- Test account password for all seed users: TestPass123!
-- ============================================================

DO $$
DECLARE
  -- Fixed user UUIDs (deterministic across runs)
  u1 uuid := 'aa000001-0000-0000-0000-000000000001'; -- Alex Chen
  u2 uuid := 'aa000001-0000-0000-0000-000000000002'; -- Sarah Kim
  u3 uuid := 'aa000001-0000-0000-0000-000000000003'; -- Mike Torres

  -- Fixed place UUIDs
  p1 uuid := 'bb000001-0000-0000-0000-000000000001'; -- Balthazar, NYC
  p2 uuid := 'bb000001-0000-0000-0000-000000000002'; -- The High Line, NYC
  p3 uuid := 'bb000001-0000-0000-0000-000000000003'; -- Roberta's, Brooklyn
  p4 uuid := 'bb000001-0000-0000-0000-000000000004'; -- Bemelman's Bar, NYC
  p5 uuid := 'bb000001-0000-0000-0000-000000000005'; -- Brooklyn Botanic Garden
  p6 uuid := 'bb000001-0000-0000-0000-000000000006'; -- Russ & Daughters Cafe, NYC
  p7 uuid := 'bb000001-0000-0000-0000-000000000007'; -- Monkey Town, Brooklyn
  p8 uuid := 'bb000001-0000-0000-0000-000000000008'; -- Café Amelie, New Orleans
  p9 uuid := 'bb000001-0000-0000-0000-000000000009'; -- Le Méac, Montreal

  -- Tag IDs (fetched below)
  tag_first       uuid;
  tag_anniversary uuid;
  tag_casual      uuid;
  tag_celebration uuid;
  tag_spontaneous uuid;
  tag_special     uuid;

BEGIN

  -- ============================================================
  -- AUTH USERS
  -- bcrypt hash of 'TestPass123!' (cost 10)
  -- ============================================================
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    aud, role, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
    (u1, '00000000-0000-0000-0000-000000000000', 'alex@seed.dated.app',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     now(), '{"provider":"email","providers":["email"]}',
     '{"username":"alex_chen"}', 'authenticated', 'authenticated',
     now() - interval '200 days', now(), '', '', '', ''),

    (u2, '00000000-0000-0000-0000-000000000000', 'sarah@seed.dated.app',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     now(), '{"provider":"email","providers":["email"]}',
     '{"username":"sarah_kim"}', 'authenticated', 'authenticated',
     now() - interval '150 days', now(), '', '', '', ''),

    (u3, '00000000-0000-0000-0000-000000000000', 'mike@seed.dated.app',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     now(), '{"provider":"email","providers":["email"]}',
     '{"username":"mike_torres"}', 'authenticated', 'authenticated',
     now() - interval '100 days', now(), '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  -- Update profiles (trigger auto-created them on insert above)
  UPDATE public.profiles
  SET display_name = 'Alex Chen',
      bio = 'Documenting every date in NYC since 2023 🌃',
      avatar_url = null
  WHERE id = u1;

  UPDATE public.profiles
  SET display_name = 'Sarah Kim',
      bio = 'Outdoor dates > indoor dates, always 🌿',
      avatar_url = null
  WHERE id = u2;

  UPDATE public.profiles
  SET display_name = 'Mike Torres',
      bio = 'Food is my love language 🍝',
      avatar_url = null
  WHERE id = u3;

  -- ============================================================
  -- PLACES
  -- ============================================================
  INSERT INTO public.places (id, name, city, country, place_type, price_level, address)
  VALUES
    (p1, 'Balthazar',              'New York',    'US', 'restaurant', 3, '80 Spring St, New York, NY'),
    (p2, 'The High Line',          'New York',    'US', 'experience', 1, 'New York, NY 10011'),
    (p3, 'Roberta''s',             'Brooklyn',    'US', 'restaurant', 2, '261 Moore St, Brooklyn, NY'),
    (p4, 'Bemelman''s Bar',        'New York',    'US', 'bar',        3, '35 E 76th St, New York, NY'),
    (p5, 'Brooklyn Botanic Garden','Brooklyn',    'US', 'experience', 1, '990 Washington Ave, Brooklyn, NY'),
    (p6, 'Russ & Daughters Cafe',  'New York',    'US', 'restaurant', 2, '127 Orchard St, New York, NY'),
    (p7, 'House of Yes',           'Brooklyn',    'US', 'activity',   2, '2 Wyckoff Ave, Brooklyn, NY'),
    (p8, 'Café Amelie',            'New Orleans', 'US', 'restaurant', 2, '912 Royal St, New Orleans, LA'),
    (p9, 'Le Méac',                'Montreal',    'CA', 'restaurant', 3, '1415 Rue Laurier E, Montreal, QC')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- DATE TAGS (fetch IDs)
  -- ============================================================
  SELECT id INTO tag_first       FROM public.date_tags WHERE label = 'First Date'        LIMIT 1;
  SELECT id INTO tag_anniversary FROM public.date_tags WHERE label = 'Anniversary'       LIMIT 1;
  SELECT id INTO tag_casual      FROM public.date_tags WHERE label = 'Casual'            LIMIT 1;
  SELECT id INTO tag_celebration FROM public.date_tags WHERE label = 'Celebration'       LIMIT 1;
  SELECT id INTO tag_spontaneous FROM public.date_tags WHERE label = 'Spontaneous'       LIMIT 1;
  SELECT id INTO tag_special     FROM public.date_tags WHERE label = 'Special Occasion'  LIMIT 1;

  -- ============================================================
  -- REVIEWS — spread across 12 months for insights calendar
  -- ============================================================
  INSERT INTO public.reviews (
    id, user_id, place_id, slug, title, body,
    visited_on, is_public,
    rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe,
    view_count, created_at
  ) VALUES

  -- Alex — Jan 2025
  ('cc000001-0000-0000-0000-000000000001', u1, p1,
   'balthazar-brunch-new-years-jan25',
   'Best brunch in the city, no debate',
   'We stumbled into Balthazar on a freezing January morning with no reservation and somehow got a corner booth. The steak frites were perfect, the service flawlessly professional. The whole room felt like Paris.',
   '2025-01-12', true, 5.0, 5.0, 5.0, 5.0, 3.0, 5.0, 142, now() - interval '82 days'),

  -- Alex — Feb 2025
  ('cc000001-0000-0000-0000-000000000002', u1, p4,
   'bemelmans-valentines-night-feb25',
   'Most romantic bar in Manhattan',
   'Bemelman''s is the kind of place that feels like a secret even when it''s packed. The murals, the live piano, the perfect martini — it''s romantic without trying too hard. We stayed for three rounds.',
   '2025-02-14', true, 5.0, 5.0, 4.0, 5.0, 3.0, 5.0, 287, now() - interval '50 days'),

  -- Alex — Mar 2025
  ('cc000001-0000-0000-0000-000000000003', u1, p2,
   'high-line-march-walk-mar25',
   'Cherry blossoms + sunset = perfect',
   'Timed it perfectly — the trees were just starting to bloom. We walked the whole length twice, got coffee from a cart, sat on one of the wooden sunbeds watching the light change. Free and beautiful.',
   '2025-03-22', true, 4.5, 5.0, null, null, 5.0, 4.5, 96, now() - interval '40 days'),

  -- Alex — Apr 2025
  ('cc000001-0000-0000-0000-000000000004', u1, p5,
   'brooklyn-botanic-cherry-blossom-apr25',
   'Worth every minute of the queue',
   'We queued 45 minutes during cherry blossom season and it was completely worth it. The Japanese hill-and-pond garden is unreal. Brought a picnic blanket and stayed for hours.',
   '2025-04-20', true, 4.5, 5.0, null, null, 4.0, 4.5, 203, now() - interval '30 days'),

  -- Alex — May 2025
  ('cc000001-0000-0000-0000-000000000005', u1, p6,
   'russ-daughters-lazy-sunday-may25',
   'The lox plate will ruin all other breakfasts',
   'We split the classic lox platter and one of the smoked fish plates and ate in a comfortable silence. The coffee was excellent. A perfect lazy Sunday morning date.',
   '2025-05-11', true, 4.5, 4.0, 5.0, 4.5, 3.5, 4.0, 78, now() - interval '20 days'),

  -- Alex — Jun 2025
  ('cc000001-0000-0000-0000-000000000006', u1, p7,
   'house-of-yes-burlesque-jun25',
   'Nothing prepares you for this place',
   'I had absolutely no idea what to expect and it was one of the most fun nights of my life. The performers were incredible, the crowd was electric, the drinks were strong. We danced until 2am.',
   '2025-06-07', true, 5.0, 5.0, 3.5, 4.0, 4.0, 5.0, 334, now() - interval '15 days'),

  -- Sarah — Feb 2025
  ('cc000001-0000-0000-0000-000000000007', u2, p5,
   'botanic-garden-winter-feb25',
   'Quiet and underrated in winter',
   'Everyone forgets about the botanic garden in February. It was nearly empty, the glasshouses were warm and humid and full of colour. My favourite date we''ve done.',
   '2025-02-08', true, 5.0, 5.0, null, null, 5.0, 5.0, 167, now() - interval '55 days'),

  -- Sarah — Mar 2025
  ('cc000001-0000-0000-0000-000000000008', u2, p3,
   'robertas-pizza-birthday-mar25',
   'The best pizza in Brooklyn, still',
   'We''ve been coming here for birthdays for three years running. The bee sting pizza is still the greatest thing I''ve ever eaten. Slightly chaotic service but it adds to the charm.',
   '2025-03-15', true, 4.5, 4.0, 5.0, 3.5, 4.5, 4.5, 122, now() - interval '45 days'),

  -- Sarah — Apr 2025
  ('cc000001-0000-0000-0000-000000000009', u2, p2,
   'high-line-spring-evening-apr25',
   'Golden hour on the High Line slaps',
   'Arrived at 6pm as the light was going golden. Grabbed tacos from one of the carts and just walked slowly. The city looks incredible from up there. Free date, 10/10.',
   '2025-04-13', true, 5.0, 5.0, null, null, 5.0, 5.0, 189, now() - interval '28 days'),

  -- Sarah — May 2025
  ('cc000001-0000-0000-0000-000000000010', u2, p8,
   'cafe-amelie-new-orleans-may25',
   'A rainy evening that felt like a movie',
   'We ducked into Café Amelie during a sudden downpour and stayed for three hours. The courtyard with fairy lights reflecting off wet stone, the duck confit, the attentive-but-not-intrusive service. Perfect.',
   '2025-05-03', true, 5.0, 5.0, 4.5, 5.0, 4.0, 5.0, 411, now() - interval '22 days'),

  -- Mike — Jan 2025
  ('cc000001-0000-0000-0000-000000000011', u3, p3,
   'robertas-january-cold-jan25',
   'Pizza as self-care in January',
   'It was -2°C and we walked 20 minutes to get here because nowhere else felt right. The margherita with burrata. A carafe of house red. We barely spoke, just ate. Five stars.',
   '2025-01-26', true, 4.5, 4.0, 5.0, 4.0, 4.5, 4.5, 88, now() - interval '78 days'),

  -- Mike — Feb 2025
  ('cc000001-0000-0000-0000-000000000012', u3, p6,
   'russ-daughters-bagel-brunch-feb25',
   'The bagel that changed everything',
   'I didn''t understand what all the fuss was about until I bit into the everything bagel with whitefish salad. Now I understand. We went back the next day.',
   '2025-02-23', true, 4.5, 4.0, 5.0, 4.0, 3.5, 4.0, 145, now() - interval '48 days'),

  -- Mike — Mar 2025
  ('cc000001-0000-0000-0000-000000000013', u3, p1,
   'balthazar-anniversary-dinner-mar25',
   'Our 3-year anniversary, done right',
   'We saved up for this one. Four courses, the Grand Plateau de Fruits de Mer, a bottle of Chablis. The room was buzzing but our table felt private. Worth every penny.',
   '2025-03-29', true, 5.0, 5.0, 5.0, 5.0, 3.0, 5.0, 276, now() - interval '35 days'),

  -- Mike — May 2025
  ('cc000001-0000-0000-0000-000000000014', u3, p9,
   'le-meac-montreal-trip-may25',
   'The French bistro that makes me miss Montreal',
   'Le Méac on a Tuesday evening. Steak au poivre, a shared cheese plate, espresso. The patio was perfect. Every city needs a restaurant like this.',
   '2025-05-18', true, 5.0, 5.0, 5.0, 5.0, 4.0, 5.0, 93, now() - interval '18 days'),

  -- Mike — Jun 2025
  ('cc000001-0000-0000-0000-000000000015', u3, p4,
   'bemelmans-date-night-jun25',
   'First time here, definitely not the last',
   'My partner had been trying to get me here for a year. I finally caved. The pianist was playing Gershwin. The martini was cold. I owe her an apology for waiting this long.',
   '2025-06-14', true, 5.0, 5.0, 4.0, 5.0, 3.0, 5.0, 198, now() - interval '8 days')

  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- REVIEW TAGS
  -- ============================================================
  INSERT INTO public.review_tags (review_id, tag_id)
  SELECT r, t FROM (VALUES
    ('cc000001-0000-0000-0000-000000000001'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000002'::uuid, tag_anniversary),
    ('cc000001-0000-0000-0000-000000000002'::uuid, tag_special),
    ('cc000001-0000-0000-0000-000000000003'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000004'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000005'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000006'::uuid, tag_celebration),
    ('cc000001-0000-0000-0000-000000000007'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000008'::uuid, tag_celebration),
    ('cc000001-0000-0000-0000-000000000010'::uuid, tag_spontaneous),
    ('cc000001-0000-0000-0000-000000000013'::uuid, tag_anniversary),
    ('cc000001-0000-0000-0000-000000000015'::uuid, tag_first)
  ) AS x(r, t)
  WHERE t IS NOT NULL
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- REACTIONS (heart and fire on popular reviews)
  -- ============================================================
  INSERT INTO public.reactions (review_id, user_id, reaction_type)
  VALUES
    ('cc000001-0000-0000-0000-000000000002', u2, 'heart'),
    ('cc000001-0000-0000-0000-000000000002', u3, 'heart'),
    ('cc000001-0000-0000-0000-000000000002', u2, 'fire'),
    ('cc000001-0000-0000-0000-000000000006', u1, 'heart'),
    ('cc000001-0000-0000-0000-000000000006', u2, 'fire'),
    ('cc000001-0000-0000-0000-000000000010', u1, 'heart'),
    ('cc000001-0000-0000-0000-000000000010', u3, 'want_to_go'),
    ('cc000001-0000-0000-0000-000000000013', u1, 'heart'),
    ('cc000001-0000-0000-0000-000000000013', u2, 'want_to_go'),
    ('cc000001-0000-0000-0000-000000000015', u2, 'been_here')
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- BOOKMARKS & FAVOURITES (for profile section testing)
  -- ============================================================
  INSERT INTO public.bookmarks (user_id, review_id)
  VALUES
    (u1, 'cc000001-0000-0000-0000-000000000010'),
    (u2, 'cc000001-0000-0000-0000-000000000002'),
    (u3, 'cc000001-0000-0000-0000-000000000006')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.favourites (user_id, review_id)
  VALUES
    (u1, 'cc000001-0000-0000-0000-000000000002'),
    (u2, 'cc000001-0000-0000-0000-000000000010'),
    (u3, 'cc000001-0000-0000-0000-000000000013')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed complete: 3 users, 9 places, 15 reviews, reactions, bookmarks and favourites inserted.';

END $$;


-- ============================================================
-- CLEANUP (run this first if you want a fresh re-seed)
-- ============================================================
-- DELETE FROM public.reactions  WHERE review_id LIKE 'cc000001%';
-- DELETE FROM public.review_tags WHERE review_id LIKE 'cc000001%';
-- DELETE FROM public.reviews    WHERE id::text  LIKE 'cc000001%';
-- DELETE FROM public.places     WHERE id::text  LIKE 'bb000001%';
-- DELETE FROM public.profiles   WHERE id::text  LIKE 'aa000001%';
-- DELETE FROM auth.users        WHERE id::text  LIKE 'aa000001%';
