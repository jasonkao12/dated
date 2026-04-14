-- ============================================================
-- DATED — Seed Data (Vancouver / BC)
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

  -- Fixed place UUIDs — Vancouver & BC
  p1  uuid := 'bb000001-0000-0000-0000-000000000101'; -- Miku
  p2  uuid := 'bb000001-0000-0000-0000-000000000102'; -- Stanley Park Seawall
  p3  uuid := 'bb000001-0000-0000-0000-000000000103'; -- Granville Island
  p4  uuid := 'bb000001-0000-0000-0000-000000000104'; -- Revolver Coffee
  p5  uuid := 'bb000001-0000-0000-0000-000000000105'; -- Grouse Mountain
  p6  uuid := 'bb000001-0000-0000-0000-000000000106'; -- Kissa Tanto
  p7  uuid := 'bb000001-0000-0000-0000-000000000107'; -- Wreck Beach
  p8  uuid := 'bb000001-0000-0000-0000-000000000108'; -- Published on Main
  p9  uuid := 'bb000001-0000-0000-0000-000000000109'; -- La Taqueria
  p10 uuid := 'bb000001-0000-0000-0000-000000000110'; -- VanDusen Botanical Garden
  p11 uuid := 'bb000001-0000-0000-0000-000000000111'; -- Bao Bei
  p12 uuid := 'bb000001-0000-0000-0000-000000000112'; -- Deep Cove
  p13 uuid := 'bb000001-0000-0000-0000-000000000113'; -- Sea to Sky Gondola
  p14 uuid := 'bb000001-0000-0000-0000-000000000114'; -- Nightingale
  p15 uuid := 'bb000001-0000-0000-0000-000000000115'; -- St. Lawrence Restaurant

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
      bio = 'Documenting every date in Vancouver since 2024 🌊',
      avatar_url = null
  WHERE id = u1;

  UPDATE public.profiles
  SET display_name = 'Sarah Kim',
      bio = 'Outdoor dates > indoor dates, always 🌿',
      avatar_url = null
  WHERE id = u2;

  UPDATE public.profiles
  SET display_name = 'Mike Torres',
      bio = 'Food is my love language 🍜',
      avatar_url = null
  WHERE id = u3;

  -- ============================================================
  -- PLACES — Vancouver & BC
  -- ============================================================
  INSERT INTO public.places (id, name, city, country, place_type, price_level, address, lat, lng)
  VALUES
    (p1,  'Miku',                    'Vancouver', 'CA', 'restaurant', 4, '200 Granville St #70, Vancouver, BC',       49.2873, -123.1117),
    (p2,  'Stanley Park Seawall',    'Vancouver', 'CA', 'experience', 1, 'Stanley Park, Vancouver, BC',               49.3017, -123.1417),
    (p3,  'Granville Island',        'Vancouver', 'CA', 'experience', 2, 'Granville Island, Vancouver, BC',           49.2712, -123.1340),
    (p4,  'Revolver Coffee',         'Vancouver', 'CA', 'cafe',       2, '325 Cambie St, Vancouver, BC',              49.2827, -123.1088),
    (p5,  'Grouse Mountain',         'North Vancouver', 'CA', 'experience', 2, '6400 Nancy Greene Way, North Vancouver, BC', 49.3806, -123.0815),
    (p6,  'Kissa Tanto',             'Vancouver', 'CA', 'restaurant', 4, '263 E Pender St, Vancouver, BC',            49.2810, -123.0960),
    (p7,  'Wreck Beach',             'Vancouver', 'CA', 'experience', 1, 'SW Marine Dr, Vancouver, BC',               49.2622, -123.2616),
    (p8,  'Published on Main',       'Vancouver', 'CA', 'restaurant', 3, '3593 Main St, Vancouver, BC',               49.2559, -123.1009),
    (p9,  'La Taqueria',             'Vancouver', 'CA', 'restaurant', 1, '322 W Hastings St, Vancouver, BC',          49.2831, -123.1102),
    (p10, 'VanDusen Botanical Garden','Vancouver', 'CA', 'experience', 2, '5251 Oak St, Vancouver, BC',               49.2388, -123.1305),
    (p11, 'Bao Bei',                 'Vancouver', 'CA', 'restaurant', 3, '163 Keefer St, Vancouver, BC',             49.2795, -123.1003),
    (p12, 'Deep Cove',               'North Vancouver', 'CA', 'experience', 1, 'Deep Cove, North Vancouver, BC',     49.3299, -122.9499),
    (p13, 'Sea to Sky Gondola',      'Squamish', 'CA', 'experience', 2, '36800 BC-99, Squamish, BC',                  49.6744, -123.1600),
    (p14, 'Nightingale',             'Vancouver', 'CA', 'restaurant', 3, '1017 W Hastings St, Vancouver, BC',         49.2860, -123.1210),
    (p15, 'St. Lawrence Restaurant', 'Vancouver', 'CA', 'restaurant', 4, '269 Powell St, Vancouver, BC',              49.2830, -123.0950)
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
  -- REVIEWS — spread across 12 months, all Vancouver/BC
  -- ============================================================
  INSERT INTO public.reviews (
    id, user_id, place_id, slug, title, body,
    visited_on, is_public,
    rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe,
    view_count, created_at
  ) VALUES

  -- Alex — Jan 2025
  ('cc000001-0000-0000-0000-000000000101', u1, p1,
   'miku-waterfront-omakase-jan25',
   'Aburi sushi with a waterfront sunset',
   'Miku in January might be peak Vancouver dining. We got a window table overlooking the harbour just as the sun was setting behind the North Shore mountains. The aburi salmon oshi was life-changing — that torched top with the perfectly seasoned rice underneath. Split a bottle of sake and watched the seaplanes land. Expensive but worth every penny for a special night.',
   '2025-01-18', true, 5.0, 5.0, 5.0, 5.0, 3.0, 5.0, 142, now() - interval '82 days'),

  -- Alex — Feb 2025
  ('cc000001-0000-0000-0000-000000000102', u1, p6,
   'kissa-tanto-valentines-feb25',
   'Japanese-Italian fusion that actually works',
   'We''d been trying to get a reservation for months and finally scored one for Valentine''s. The upstairs space is gorgeous — dim lighting, vinyl playing, that art deco bar. The pasta with uni was insane. My partner had the sablefish and wouldn''t stop talking about it for days. This is the kind of restaurant that makes you feel like you''re in a movie.',
   '2025-02-14', true, 5.0, 5.0, 5.0, 5.0, 3.0, 5.0, 287, now() - interval '50 days'),

  -- Alex — Mar 2025
  ('cc000001-0000-0000-0000-000000000103', u1, p2,
   'seawall-bike-ride-spring-mar25',
   'Cherry blossoms along the seawall',
   'Rented bikes from Denman and did the full loop. The cherry blossoms near Brockton Point were just starting to pop. Stopped at Third Beach for coffee from a thermos we brought. The mountains still had snow on them. Free and absolutely perfect.',
   '2025-03-22', true, 4.5, 5.0, null, null, 5.0, 4.5, 96, now() - interval '40 days'),

  -- Alex — Apr 2025
  ('cc000001-0000-0000-0000-000000000104', u1, p10,
   'vandusen-cherry-blossoms-apr25',
   'The gardens in full bloom are unreal',
   'VanDusen during peak cherry blossom season is something everyone in Vancouver should experience. We went on a Tuesday afternoon and had whole sections to ourselves. The laburnum walk wasn''t in bloom yet but the cherry trees more than made up for it. Packed a picnic and sat by the lake.',
   '2025-04-08', true, 4.5, 5.0, null, null, 4.0, 4.5, 203, now() - interval '30 days'),

  -- Alex — May 2025
  ('cc000001-0000-0000-0000-000000000105', u1, p4,
   'revolver-lazy-morning-may25',
   'The best coffee in Vancouver, no contest',
   'We grabbed the corner table at Revolver on a rainy Saturday morning. Tried their rotating single origin pour-over — some Kenyan bean that tasted like berries. The space is tiny but the vibe is perfect. We stayed for two hours reading and people-watching through the window.',
   '2025-05-10', true, 4.5, 4.0, 4.5, 4.5, 4.0, 4.5, 78, now() - interval '20 days'),

  -- Alex — Jun 2025
  ('cc000001-0000-0000-0000-000000000106', u1, p7,
   'wreck-beach-sunset-jun25',
   'Sunset at Wreck Beach hits different',
   'Made the trek down the stairs with a blanket and some wine. Watched the sun set behind Vancouver Island. The walk back up is brutal but the whole experience is worth it. One of those Vancouver dates you can only do in summer.',
   '2025-06-21', true, 4.5, 5.0, null, null, 5.0, 5.0, 334, now() - interval '15 days'),

  -- Sarah — Jan 2025
  ('cc000001-0000-0000-0000-000000000107', u2, p12,
   'deep-cove-winter-hike-jan25',
   'Quarry Rock in the rain is actually beautiful',
   'Everyone says don''t hike Quarry Rock in January. They''re wrong. The trail was misty and quiet, the viewpoint was empty, and Deep Cove was dead so we got a table at Honey''s immediately after. Hot chocolate and doughnuts with a view of the inlet. A+ winter date.',
   '2025-01-11', true, 4.5, 5.0, null, null, 5.0, 4.5, 167, now() - interval '75 days'),

  -- Sarah — Feb 2025
  ('cc000001-0000-0000-0000-000000000108', u2, p11,
   'bao-bei-lunar-new-year-feb25',
   'Chinatown vibes at their finest',
   'Bao Bei during Lunar New Year week. The mantou with pork belly was incredible, the cocktails were creative without being pretentious. The room itself is beautiful — that brick wall with the neon sign. We sat at the bar and watched them work. Pure Chinatown magic.',
   '2025-02-02', true, 5.0, 5.0, 5.0, 4.5, 3.5, 5.0, 122, now() - interval '55 days'),

  -- Sarah — Mar 2025
  ('cc000001-0000-0000-0000-000000000109', u2, p3,
   'granville-island-market-day-mar25',
   'The market is a whole date by itself',
   'We spent four hours just wandering Granville Island. Started at the market — oysters from the fish counter, pastries from Terra Breads, cheese samples from everywhere. Then walked through the art studios and ended up at the improv comedy show. An entire day of fun for under $50.',
   '2025-03-15', true, 4.5, 4.0, 4.5, 4.0, 5.0, 4.5, 189, now() - interval '45 days'),

  -- Sarah — Apr 2025
  ('cc000001-0000-0000-0000-000000000110', u2, p13,
   'sea-to-sky-gondola-apr25',
   'The views are worth the drive to Squamish',
   'Drove up the Sea to Sky Highway on a clear April morning. The gondola ride up was stunning — you can see Howe Sound, the Chief, and the snow-capped mountains all at once. Did the Sky Pilot suspension bridge and the loop trail. Grabbed tacos in Squamish on the way back. Perfect day trip date.',
   '2025-04-19', true, 5.0, 5.0, null, null, 4.0, 5.0, 411, now() - interval '28 days'),

  -- Sarah — May 2025
  ('cc000001-0000-0000-0000-000000000111', u2, p14,
   'nightingale-birthday-dinner-may25',
   'The pizza and cocktails carry this place',
   'Came here for my birthday. The space is gorgeous — high ceilings, open kitchen, buzzy energy. The burrata pizza with honey was the highlight. Cocktails were strong and creative. Service was a little slow on a Friday night but the food made up for it.',
   '2025-05-24', true, 4.0, 4.5, 4.5, 3.5, 3.5, 4.0, 93, now() - interval '18 days'),

  -- Mike — Jan 2025
  ('cc000001-0000-0000-0000-000000000112', u3, p9,
   'la-taqueria-rainy-day-jan25',
   'The best $5 you can spend in Vancouver',
   'La Taqueria on a rainy Tuesday. Two tacos each, a couple of horchatas. We were in and out in 30 minutes and it was one of the best dates of the month. Sometimes you don''t need a fancy restaurant. The carnitas taco is perfect.',
   '2025-01-14', true, 4.5, 3.5, 5.0, 4.0, 5.0, 4.0, 88, now() - interval '78 days'),

  -- Mike — Feb 2025
  ('cc000001-0000-0000-0000-000000000113', u3, p5,
   'grouse-mountain-snowshoe-feb25',
   'Snowshoeing under the stars at Grouse',
   'Did the evening snowshoe tour at Grouse Mountain. The city lights from up top are incredible — you can see all of Vancouver lit up below you. The trail was well-marked and the guide was great. Grabbed beers at the lodge after. A winter date that actually gets you outside.',
   '2025-02-15', true, 4.5, 5.0, 3.0, 4.5, 3.5, 5.0, 145, now() - interval '48 days'),

  -- Mike — Mar 2025
  ('cc000001-0000-0000-0000-000000000114', u3, p15,
   'st-lawrence-anniversary-mar25',
   'French-Canadian fine dining done right',
   'We saved up for this one — our anniversary dinner at St. Lawrence. The duck confit was unbelievable, the wine pairings were perfect, and the room has this old-world charm that makes you forget you''re in Gastown. Chef deserves every award. Worth every penny.',
   '2025-03-29', true, 5.0, 5.0, 5.0, 5.0, 3.5, 5.0, 276, now() - interval '35 days'),

  -- Mike — May 2025
  ('cc000001-0000-0000-0000-000000000115', u3, p8,
   'published-on-main-brunch-may25',
   'Brunch with a side of Main Street people-watching',
   'Published on Main for Saturday brunch. The Dutch baby pancake is absurd — it arrives puffed up like a pillow and deflates while you stare at it. Great coffee, cool space, and Main Street on a sunny morning is prime people-watching. Solid neighbourhood date.',
   '2025-05-17', true, 4.5, 4.0, 4.5, 4.0, 4.0, 4.0, 198, now() - interval '18 days'),

  -- Mike — Jun 2025
  ('cc000001-0000-0000-0000-000000000116', u3, p2,
   'seawall-sunset-bike-jun25',
   'The seawall at golden hour never gets old',
   'Biked the seawall from Science World to English Bay just as the sun was going down. Stopped at Second Beach for ice cream. The mountains were pink. This city is absurd sometimes. Free date, 10/10.',
   '2025-06-14', true, 5.0, 5.0, null, null, 5.0, 5.0, 198, now() - interval '8 days')

  ON CONFLICT (id) DO NOTHING;

  -- ============================================================
  -- REVIEW TAGS
  -- ============================================================
  INSERT INTO public.review_tags (review_id, tag_id)
  SELECT r, t FROM (VALUES
    ('cc000001-0000-0000-0000-000000000101'::uuid, tag_special),
    ('cc000001-0000-0000-0000-000000000102'::uuid, tag_anniversary),
    ('cc000001-0000-0000-0000-000000000102'::uuid, tag_special),
    ('cc000001-0000-0000-0000-000000000103'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000104'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000105'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000106'::uuid, tag_spontaneous),
    ('cc000001-0000-0000-0000-000000000107'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000108'::uuid, tag_celebration),
    ('cc000001-0000-0000-0000-000000000109'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000110'::uuid, tag_spontaneous),
    ('cc000001-0000-0000-0000-000000000111'::uuid, tag_celebration),
    ('cc000001-0000-0000-0000-000000000112'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000113'::uuid, tag_first),
    ('cc000001-0000-0000-0000-000000000114'::uuid, tag_anniversary),
    ('cc000001-0000-0000-0000-000000000114'::uuid, tag_special),
    ('cc000001-0000-0000-0000-000000000115'::uuid, tag_casual),
    ('cc000001-0000-0000-0000-000000000116'::uuid, tag_casual)
  ) AS x(r, t)
  WHERE t IS NOT NULL
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- REACTIONS
  -- ============================================================
  INSERT INTO public.reactions (review_id, user_id, reaction_type)
  VALUES
    ('cc000001-0000-0000-0000-000000000102', u2, 'heart'),
    ('cc000001-0000-0000-0000-000000000102', u3, 'heart'),
    ('cc000001-0000-0000-0000-000000000102', u2, 'fire'),
    ('cc000001-0000-0000-0000-000000000106', u1, 'heart'),
    ('cc000001-0000-0000-0000-000000000106', u2, 'fire'),
    ('cc000001-0000-0000-0000-000000000108', u1, 'heart'),
    ('cc000001-0000-0000-0000-000000000108', u3, 'want_to_go'),
    ('cc000001-0000-0000-0000-000000000110', u1, 'want_to_go'),
    ('cc000001-0000-0000-0000-000000000110', u3, 'want_to_go'),
    ('cc000001-0000-0000-0000-000000000114', u1, 'heart'),
    ('cc000001-0000-0000-0000-000000000114', u2, 'want_to_go'),
    ('cc000001-0000-0000-0000-000000000116', u2, 'been_here'),
    ('cc000001-0000-0000-0000-000000000101', u3, 'fire'),
    ('cc000001-0000-0000-0000-000000000109', u1, 'heart')
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- BOOKMARKS & FAVOURITES
  -- ============================================================
  INSERT INTO public.bookmarks (user_id, review_id)
  VALUES
    (u1, 'cc000001-0000-0000-0000-000000000108'),
    (u2, 'cc000001-0000-0000-0000-000000000102'),
    (u3, 'cc000001-0000-0000-0000-000000000106')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.favourites (user_id, review_id)
  VALUES
    (u1, 'cc000001-0000-0000-0000-000000000102'),
    (u2, 'cc000001-0000-0000-0000-000000000110'),
    (u3, 'cc000001-0000-0000-0000-000000000114')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed complete: 3 users, 15 Vancouver/BC places, 16 reviews, reactions, bookmarks and favourites inserted.';

END $$;


-- ============================================================
-- CLEANUP (run this first if you want a fresh re-seed)
-- ============================================================
-- DELETE FROM public.favourites  WHERE review_id::text LIKE 'cc000001%';
-- DELETE FROM public.bookmarks   WHERE review_id::text LIKE 'cc000001%';
-- DELETE FROM public.reactions   WHERE review_id::text LIKE 'cc000001%';
-- DELETE FROM public.review_tags WHERE review_id::text LIKE 'cc000001%';
-- DELETE FROM public.reviews     WHERE id::text  LIKE 'cc000001%';
-- DELETE FROM public.places      WHERE id::text  LIKE 'bb000001%';
-- DELETE FROM public.profiles    WHERE id::text  LIKE 'aa000001%';
-- DELETE FROM auth.users         WHERE id::text  LIKE 'aa000001%';
