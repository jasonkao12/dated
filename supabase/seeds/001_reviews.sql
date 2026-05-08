-- Seed: 22 real date reviews written by the app owner
-- Run this once in the Supabase SQL Editor.
-- Each review is tied to a real Vancouver (or nearby) venue.
-- Two reviews have no venue (stargazing, backyard movie night) — place_id is NULL.

DO $$
DECLARE
  v_user_id uuid;
  p1  uuid; p2  uuid; p3  uuid; p4  uuid; p5  uuid;
  p6  uuid; p7  uuid; p8  uuid; p9  uuid; p10 uuid;
  p11 uuid; p12 uuid; p13 uuid; p14 uuid; p15 uuid;
  p17 uuid; p18 uuid; p19 uuid; p20 uuid; p21 uuid; p22 uuid;
BEGIN

  -- ── Get app owner's user ID ─────────────────────────────────────────────────
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'jkao@changepain.ca';
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found. Check the email address in this script.';
  END IF;

  -- Helper pattern for each place:
  --   1. Try to find existing row by name + city
  --   2. If not found, insert it
  -- This avoids needing a unique constraint.

  -- ── 1. Cactus Club Cafe Coal Harbour ───────────────────────────────────────
  SELECT id INTO p1 FROM public.places WHERE name = 'Cactus Club Cafe Coal Harbour' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Cactus Club Cafe Coal Harbour', 'Vancouver', 'Canada', 'restaurant',
            49.28887, -123.12138, '1085 Canada Pl, Vancouver, BC V6E 3L1', 3)
    RETURNING id INTO p1;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'cactus-club-coal-harbour-sunset-patio-x7k',
    'The patio here at sunset is everything the photos promise',
    'We came for dinner and stayed for two extra rounds of drinks just to watch the light change over the harbour. The Coal Harbour location has this rare thing going where the food is genuinely good and the setting is genuinely beautiful — usually it''s one or the other. Service was polished without being stiff, and the tuna stack is worth ordering even if you''re the kind of person who thinks ordering tuna at a casual restaurant is a red flag. Book a patio table in advance and aim for a 7pm arrival in summer — the timing makes the whole thing.',
    p1, 5, 5, 4, 5, 3, 5, '2024-08-15', true, false);

  -- ── 2. Fired Up Pottery Studio ─────────────────────────────────────────────
  SELECT id INTO p2 FROM public.places WHERE name = 'Fired Up Pottery Studio' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Fired Up Pottery Studio', 'Vancouver', 'Canada', 'experience',
            49.27330, -123.10850, '428 W 8th Ave, Vancouver, BC', 2)
    RETURNING id INTO p2;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'fired-up-pottery-couples-wheel-throwing-m3p',
    'We made genuinely terrible mugs and they are our most prized possessions',
    'We booked a wheel-throwing class expecting to be bad at it, and were not disappointed — but the instructor was patient, funny, and very good at framing failure as part of the point. The studio has great energy: the lighting is low, clay is everywhere, there''s a playlist you can''t quite place but immediately like. There''s something surprisingly revealing about struggling through something new together — you learn things. We picked up our glazed mugs three weeks later and they are permanently on display. Strongly recommend as a date regardless of where you are in a relationship.',
    p2, 5, 4, 5, 4, 5, '2024-02-14', true, false);

  -- ── 3. Granville Island Public Market ──────────────────────────────────────
  SELECT id INTO p3 FROM public.places WHERE name = 'Granville Island Public Market' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Granville Island Public Market', 'Vancouver', 'Canada', 'market',
            49.27210, -123.13450, '1669 Johnston St, Vancouver, BC V6H 3R9', 1)
    RETURNING id INTO p3;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_food, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'granville-island-market-picnic-date-q9j',
    'Saturday market, Sunday energy — the best two hours you can spend in Vancouver for $40',
    'We went in with no plan: picked up sourdough from Terra, aged cheddar and prosciutto from one of the cheese stalls, a bag of cherries, and two lavender lemonades from the Market Bar. Ended up at Sunset Beach and ate everything on a blanket watching paddleboarders attempt increasingly ambitious manoeuvres. The market is obviously a tourist destination but there''s a reason locals still go — the produce and prepared food quality is genuinely high. Come before 10am for the best selection and bring a tote. The seagulls at the outdoor seating areas are aggressive and should not be engaged.',
    p3, 5, 5, 5, 5, 5, '2024-05-18', true, false);

  -- ── 4. Marquis Wine Cellars ────────────────────────────────────────────────
  SELECT id INTO p4 FROM public.places WHERE name = 'Marquis Wine Cellars' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Marquis Wine Cellars', 'Vancouver', 'Canada', 'bar',
            49.26680, -123.14520, '1034 Davie St, Vancouver, BC V6E 1M3', 3)
    RETURNING id INTO p4;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'marquis-wine-cellars-private-tasting-b2n',
    'Two hours, eight wines, and a lot of opinions we hadn''t had before',
    'We booked a private tasting and came in knowing roughly nothing about Burgundy. The sommelier — clearly someone who has found their exact right job — walked us through eight wines without ever being condescending about our obvious gaps in knowledge. The pacing was good, the pours were generous, and the cheese pairing they put together turned what we thought would be a 90-minute date into a full evening. We left with two bottles and a mild evangelical zeal about Pinot. A solid choice for someone who wants to feel like an adult on a date.',
    p4, 4, 4, 5, 4, 4, '2024-10-12', true, false);

  -- ── 5. The Dirty Apron Cooking School ─────────────────────────────────────
  SELECT id INTO p5 FROM public.places WHERE name = 'The Dirty Apron Cooking School' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('The Dirty Apron Cooking School', 'Vancouver', 'Canada', 'experience',
            49.27990, -123.10190, '540 Beatty St, Vancouver, BC V6B 2L3', 2)
    RETURNING id INTO p5;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'dirty-apron-cooking-school-couples-night-k5r',
    'We learned to make gnocchi and it was the best date we''d had all year',
    'The couples cooking class runs about three hours and you eat everything you make at the end, which is the right incentive structure. We did a pasta night — gnocchi, cacio e pepe, a simple green salad — and both came away with skills we''ve actually used since. The chef instructors are funny and efficient: they keep the energy up without turning it into a performance. Kitchen stations are well-equipped and the wine pours are relaxed. It''s on the pricier side but it''s a full evening of activity, dinner, and something to talk about — better value than most restaurants at the same price point.',
    p5, 5, 4, 5, 5, 4, 5, '2024-03-22', true, false);

  -- ── 6. Stargazing — no venue ───────────────────────────────────────────────
  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'cypress-mountain-stargazing-road-trip-w1h',
    'Drove above the city on a clear night and saw more stars than I knew existed',
    'There''s a pull-off on the Cypress Mountain road, about 20 minutes from downtown, where on a clear night you can see the Milky Way in a way that doesn''t feel real when you spend most of your time in a lit-up city. We brought a sleeping bag, a thermos of tea, and a star map app that we half-used and half-ignored. The cold arrives faster than you expect — bring more layers than feels reasonable. We were back home by midnight and talked about it for three days. No setup, no booking, no budget — just timing, weather, and the right person.',
    NULL, 5, 5, '2024-07-20', true, false);

  -- ── 7. Vancouver Art Gallery ───────────────────────────────────────────────
  SELECT id INTO p6 FROM public.places WHERE name = 'Vancouver Art Gallery' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Vancouver Art Gallery', 'Vancouver', 'Canada', 'gallery',
            49.28268, -123.12071, '750 Hornby St, Vancouver, BC V6Z 2H7', 2)
    RETURNING id INTO p6;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'vancouver-art-gallery-afternoon-date-c4m',
    'Three hours in the VAG and we still had things to argue about at dinner',
    'The VAG is reliably underrated as a date venue. The permanent Emily Carr collection alone justifies the admission, and the rotating exhibitions have been consistently interesting for the past year. We did our usual thing: each pick one piece to defend to the other person. It generates the best conversations and reveals a surprising amount about how two people see the world. The café downstairs is decent for a post-gallery debrief. Go on a Tuesday when the crowd is lighter — Sundays are packed and the energy changes. First Friday of the month is free, but plan accordingly.',
    p6, 4, 5, 3, 3, 4, '2024-11-03', true, false);

  -- ── 8. Absolute Spa at Century Plaza ──────────────────────────────────────
  SELECT id INTO p7 FROM public.places WHERE name = 'Absolute Spa at Century Plaza' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Absolute Spa at Century Plaza', 'Vancouver', 'Canada', 'wellness',
            49.28228, -123.12112, '1015 Burrard St, Vancouver, BC V6Z 1Y5', 4)
    RETURNING id INTO p7;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'absolute-spa-century-plaza-couples-massage-p8q',
    'Two hours in robes and we didn''t check our phones once',
    'We booked a couples massage package for an anniversary and neither of us had any complaints about any part of it. The facility is genuinely nice: eucalyptus steam room, pool, a quiet lounge area where they bring you tea and fruit while you wait. The massage therapists were skilled and the transition from treatment to the lounge afterward was handled well — no rush, no sudden pivot to the gift shop. It''s expensive, and it should be, and it''s worth it for the right occasion. We went for a simple dinner after and were both approximately 40% more agreeable than usual.',
    p7, 5, 5, 5, 3, 5, '2024-09-07', true, false);

  -- ── 9. Richmond Night Market ──────────────────────────────────────────────
  SELECT id INTO p8 FROM public.places WHERE name = 'Richmond Night Market' AND city = 'Richmond';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Richmond Night Market', 'Richmond', 'Canada', 'market',
            49.16870, -123.13780, '8351 River Rd, Richmond, BC V6X 1Y4', 1)
    RETURNING id INTO p8;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_food, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'richmond-night-market-summer-date-f6t',
    'We ate twelve things and agreed on eleven of them — that''s a great date',
    'The Richmond Night Market runs from May to October and if you haven''t been, it''s one of the most underrated date options in the Lower Mainland. We shared beef skewers, takoyaki, mango sticky rice, a smoked salmon bao, grilled corn, three different bubble teas, and something involving tornado potatoes that we can''t fully explain but would order again immediately. The crowd is big but the vibe is genuinely festive. Budget $40–60 for two people eating well. Arrive by 8pm for manageable lineups; after 9pm the best stalls have sold out. Parking is a disaster — take the SkyTrain.',
    p8, 5, 5, 5, 5, '2024-06-29', true, false);

  -- ── 10. Deep Cove Kayak Centre ────────────────────────────────────────────
  SELECT id INTO p9 FROM public.places WHERE name = 'Deep Cove Kayak Centre' AND city = 'North Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Deep Cove Kayak Centre', 'North Vancouver', 'Canada', 'experience',
            49.32850, -122.94890, '2156 Banbury Rd, North Vancouver, BC V7G 1W7', 2)
    RETURNING id INTO p9;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'deep-cove-kayak-centre-indian-arm-date-r2s',
    'We paddled into Indian Arm and felt like we''d actually discovered something',
    'We rented single kayaks for three hours and paddled down into Indian Arm, which opens up into something that doesn''t look like it should be 30 minutes from downtown Vancouver. The kayak centre staff are efficient and thorough with the safety briefing without making it feel clinical. Deep Cove itself is worth building an afternoon around — Honey Doughnuts afterward is the obvious and correct move. We went on a Tuesday in early September and had significant stretches of the inlet to ourselves. Don''t attempt the tandem kayak unless you have strong feelings about leadership dynamics.',
    p9, 5, 5, 4, 5, '2024-09-13', true, false);

  -- ── 11. Frankie's Jazz Club ───────────────────────────────────────────────
  SELECT id INTO p10 FROM public.places WHERE name = 'Frankie''s Jazz Club' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Frankie''s Jazz Club', 'Vancouver', 'Canada', 'bar',
            49.28006, -123.11818, '765 Beatty St, Vancouver, BC V6B 2M4', 2)
    RETURNING id INTO p10;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'frankies-jazz-club-tuesday-night-date-e9v',
    'Frankie''s on a Tuesday is the best-kept secret in Vancouver',
    'We stumbled into a Tuesday night set expecting a mostly empty room and got a packed house and a quartet that played for two and a half hours without a weak moment. The room is small, the tables are close together in the way that actually encourages conversation, and the old-fashioned is properly made. There''s a cover charge on weekends that''s completely worth it — but Tuesday sets are often free or cheap and the quality doesn''t drop. This is the kind of place that makes you feel like you''re in a different city, in a good way. Arrive early; there''s no reserving tables.',
    p10, 5, 5, 4, 4, 5, '2024-10-22', true, false);

  -- ── 12. Long Beach Lodge Resort, Tofino ───────────────────────────────────
  SELECT id INTO p11 FROM public.places WHERE name = 'Long Beach Lodge Resort' AND city = 'Tofino';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Long Beach Lodge Resort', 'Tofino', 'Canada', 'hotel',
            49.10950, -125.77320, '1441 Pacific Rim Hwy, Tofino, BC V0R 2Z0', 4)
    RETURNING id INTO p11;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'tofino-long-beach-lodge-weekend-date-u3b',
    'Three days in Tofino with no agenda — the best decision we made all year',
    'We drove up in May, which turned out to be the right call: the weather was moody in exactly the right way, the town wasn''t overrun, and the lodge had availability we couldn''t have gotten in July. Long Beach at low tide in fog is one of those things you have to see to understand. We surfed badly, ate well at Wolf in the Fog, drank wine in the room while it rained, and slept more than we had in months. The drive back is four and a half hours and worth every minute of it. Shoulder season (May or September) is the move — you get the coast without the lineup for everything.',
    p11, 5, 5, 4, 5, 3, 5, '2024-05-03', true, false);

  -- ── 13. Escape Hour Vancouver ─────────────────────────────────────────────
  SELECT id INTO p12 FROM public.places WHERE name = 'Escape Hour Vancouver' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Escape Hour Vancouver', 'Vancouver', 'Canada', 'experience',
            49.28220, -123.11510, '570 Dunsmuir St, Vancouver, BC V6B 1Y1', 2)
    RETURNING id INTO p12;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'escape-hour-vancouver-heist-room-date-g4w',
    'We escaped in 43 minutes and were insufferably smug about it for a week',
    'We booked the heist-themed room, which the staff correctly described as medium difficulty, and it turned out to be a perfect level — challenging enough that we had to actually work together, not so hard that anyone got frustrated. The game master gave a good briefing and the hint system was unobtrusive. The room design was more detailed than we expected and the lock puzzles actually made sense when you solved them, which isn''t always true of escape rooms. Strong date activity for couples who are competitive in a compatible way. If you split immediately into independent problem-solving without communicating, learn something from that.',
    p12, 4, 4, 4, 5, '2024-01-27', true, false);

  -- ── 14. VanDusen Botanical Garden ─────────────────────────────────────────
  SELECT id INTO p13 FROM public.places WHERE name = 'VanDusen Botanical Garden' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('VanDusen Botanical Garden', 'Vancouver', 'Canada', 'park',
            49.24170, -123.13330, '5251 Oak St, Vancouver, BC V6M 4H1', 1)
    RETURNING id INTO p13;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'vandusen-botanical-garden-october-date-h7c',
    'VanDusen in October has no right to be that beautiful',
    'We went for a Sunday morning walk in mid-October and the autumn colour was genuinely surreal — the Japanese maple section looks like it was art directed. The garden is large enough that you can get away from the main paths and find genuinely quiet corners, which is rare for an attraction this close to the city. The café does a serviceable coffee. Bring your own snacks and find a bench in the Laburnum Walk when it''s empty. Admission is reasonable and the annual pass pays for itself after two visits. This is one of the most underused date spots in Vancouver.',
    p13, 5, 5, 4, 4, '2024-10-05', true, false);

  -- ── 15. Brassneck Brewery ─────────────────────────────────────────────────
  SELECT id INTO p14 FROM public.places WHERE name = 'Brassneck Brewery' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Brassneck Brewery', 'Vancouver', 'Canada', 'bar',
            49.26350, -123.07940, '2148 Main St, Vancouver, BC V5T 3C4', 2)
    RETURNING id INTO p14;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'brassneck-brewery-main-street-date-n5x',
    'Four flights of beer and a shared conclusion that we''re not really beer people — still a great time',
    'We went in knowing relatively little about craft beer and the staff were good at reading that and steering us toward approachable things without being patronising. The tasting flight system works well — you build your own from whatever''s on that day, and the rotation is genuinely interesting. The taproom is small and loud on weekends but has a good neighbourhood energy. Food options are limited (they do a few snacks) so eat before. The Passive Aggressive is their flagship and worth starting with. Worth noting: they don''t take reservations and the line can be long after 6pm on Fridays.',
    p14, 4, 4, 3, 4, 4, 4, '2024-09-14', true, false);

  -- ── 16. Backyard movie night — no venue ───────────────────────────────────
  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'backyard-projector-movie-night-date-j2f',
    'We set up the projector in the backyard. The neighbour''s dog joined halfway through.',
    'The setup took about 40 minutes longer than it should have because we couldn''t agree on where to point the projector, but once it was running it was genuinely one of the better evenings we''ve had. We picked a film we''d both already seen and loved, which meant we spent as much time quoting it to each other as watching. The dog from next door appeared around the third act, sat down like she''d been invited, and stayed until the credits. You don''t need anything special for this — a decent projector (we borrowed one), a white sheet, and a choice not to stress about the quality. The whole thing cost about $12 including the popcorn.',
    NULL, 5, 5, '2024-08-03', true, false);

  -- ── 17. Harbour Dance Centre ──────────────────────────────────────────────
  SELECT id INTO p17 FROM public.places WHERE name = 'Harbour Dance Centre' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Harbour Dance Centre', 'Vancouver', 'Canada', 'experience',
            49.27990, -123.11410, '927 Granville St, Vancouver, BC V6Z 1L3', 2)
    RETURNING id INTO p17;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'harbour-dance-centre-salsa-beginner-date-d8r',
    'Salsa lesson. We were very bad. We went back the following week.',
    'We signed up for a drop-in beginner salsa class having between us approximately zero dance experience and the instructor managed to be encouraging without lying to us about how it was going. The footwork clicked about 45 minutes in and there was a specific moment — you''ll know it when it happens — where it suddenly makes sense and you stop thinking about your feet. We went back the following Tuesday, then twice the week after that. It''s become a regular thing. Good date activity specifically because it requires you to actually pay attention to another person, which is underrated in the context of dates. Drop-in friendly, no partner required to sign up.',
    p17, 5, 4, 5, 4, 5, '2024-04-19', true, false);

  -- ── 18. Prospect Point – Stanley Park ─────────────────────────────────────
  SELECT id INTO p18 FROM public.places WHERE name = 'Prospect Point' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Prospect Point', 'Vancouver', 'Canada', 'park',
            49.31170, -123.14160, 'Prospect Point, Stanley Park, Vancouver, BC', 1)
    RETURNING id INTO p18;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'prospect-point-stanley-park-picnic-surprise-y6k',
    'I planned everything. She thought we were going for a walk.',
    'I recruited a friend to set up the blanket, wine, flowers, and food 20 minutes before we arrived — told her we were just going for a Sunday walk in Stanley Park. The view from Prospect Point looking over Lions Gate Bridge and the North Shore is one of the better ones in the city, and in late June the evening light stays until nearly 10pm. The reveal landed. The food was a mix of things from Granville Island market — good cheese, good bread, strawberries. The whole thing cost about $80 and took a week of coordination. Planning something elaborate for someone is a statement about how much they''re worth the effort. Recommend.',
    p18, 5, 5, 5, '2024-06-21', true, false);

  -- ── 19. Café Medina ───────────────────────────────────────────────────────
  SELECT id INTO p19 FROM public.places WHERE name = 'Café Medina' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Café Medina', 'Vancouver', 'Canada', 'restaurant',
            49.27910, -123.11620, '780 Richards St, Vancouver, BC V6B 3A4', 2)
    RETURNING id INTO p19;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_food, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'cafe-medina-brunch-bookshop-date-l1z',
    'Medina for brunch, then MacLeod''s Books — we each picked a book for the other',
    'Medina is the obvious Vancouver brunch choice and it''s obvious for good reason. The Belgian waffles are the thing to order and the lavender latte is not a gimmick. We''ve been enough times that the line doesn''t bother us anymore — it moves and the wait is part of the ritual. After brunch we walked to MacLeod''s Books on Pender, which is a proper used bookshop: floor-to-ceiling, slightly chaotic, the kind of place where you can spend an hour looking for nothing in particular. We each picked a book we thought the other should read without asking what they wanted. It''s a small game that reveals a lot. Both books were read.',
    p19, 5, 5, 5, 4, 4, 5, '2024-11-16', true, false);

  -- ── 20. Quarry Rock Trail ─────────────────────────────────────────────────
  SELECT id INTO p20 FROM public.places WHERE name = 'Quarry Rock Trail' AND city = 'North Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Quarry Rock Trail', 'North Vancouver', 'Canada', 'park',
            49.31910, -122.95000, 'Panorama Dr, North Vancouver, BC', 1)
    RETURNING id INTO p20;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'quarry-rock-trail-deep-cove-hike-date-a4p',
    'Quarry Rock is a 45-minute hike with a view that has no business existing that close to the city',
    'The trailhead is in Deep Cove, which is worth the drive on its own. The hike to the rock takes about 45 minutes at a comfortable pace through second-growth forest, then you climb a short rocky section and you''re suddenly looking out over Indian Arm fjord from a height that feels disproportionate to the effort. We went on a Saturday in late September and the crowds were manageable — weekday mornings are apparently ideal but we''re not people who hike before work. Get Honey Doughnuts in Deep Cove before or after. Both are correct answers. This is the best free date in the Lower Mainland.',
    p20, 5, 5, 5, 5, '2024-09-28', true, false);

  -- ── 21. Thunder Bird Karaoke ──────────────────────────────────────────────
  SELECT id INTO p21 FROM public.places WHERE name = 'Thunder Bird Karaoke' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Thunder Bird Karaoke', 'Vancouver', 'Canada', 'bar',
            49.28040, -123.12200, '1 W Hastings St, Vancouver, BC V6B 1G6', 2)
    RETURNING id INTO p21;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_service, rating_value, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'thunder-bird-karaoke-private-room-date-o5m',
    'We sang Bohemian Rhapsody for the third time and I regret nothing',
    'Private room karaoke is categorically better than stage karaoke for a date — the private format removes the performative pressure and you can be as bad as you actually are. We had a room for two hours, ordered way too many drinks from the menu that appeared on the in-room tablet, and went through Bohemian Rhapsody three times because the first two felt like warmups. The rooms here are clean, the song catalogue is extensive, and the system is easy to use. Book in advance on weekends — rooms fill fast. Good date activity for people who are comfortable being ridiculous in front of each other, which is ultimately the test of most things.',
    p21, 4, 3, 4, 4, 5, '2024-12-01', true, false);

  -- ── 22. Jericho Beach Park ────────────────────────────────────────────────
  SELECT id INTO p22 FROM public.places WHERE name = 'Jericho Beach Park' AND city = 'Vancouver';
  IF NOT FOUND THEN
    INSERT INTO public.places (name, city, country, place_type, lat, lng, address, price_level)
    VALUES ('Jericho Beach Park', 'Vancouver', 'Canada', 'park',
            49.27530, -123.19970, 'Jericho Beach, Vancouver, BC V6R 4K5', 1)
    RETURNING id INTO p22;
  END IF;

  INSERT INTO public.reviews
    (user_id, slug, title, body, place_id,
     rating_overall, rating_ambiance, rating_vibe,
     visited_on, is_public, is_draft)
  VALUES (v_user_id, 'jericho-beach-sunrise-walk-coffee-date-t9e',
    'Jericho at 6am. The city is completely different before it wakes up.',
    'We set an alarm, made coffee in a thermos, and walked to Jericho Beach to watch the sunrise over the mountains. The beach faces east and on a clear morning the light on the North Shore and the still water of English Bay is the kind of thing that feels worth a 5:45am alarm. There was almost no one there for the first 45 minutes. The mountains were reflected in the water. A heron was doing its thing about ten metres away and didn''t care about us at all. We were home by 8am and made proper breakfast. This date costs nothing and requires only the willingness to wake up early and the right weather app. Check the forecast the night before.',
    p22, 5, 5, 5, '2024-08-24', true, false);

  RAISE NOTICE 'Done. 22 reviews seeded successfully for user %.', v_user_id;

END $$;
