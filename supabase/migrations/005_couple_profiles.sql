-- ============================================================
-- 005: Couple Profiles
-- ============================================================

-- Temporary 6-digit invite codes (expire after 24 hours)
CREATE TABLE IF NOT EXISTS couple_invite_codes (
  code       char(6) PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  UNIQUE (user_id)
);

ALTER TABLE couple_invite_codes ENABLE ROW LEVEL SECURITY;

-- Users can only see/manage their own code
CREATE POLICY "couple_codes_select" ON couple_invite_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "couple_codes_insert" ON couple_invite_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "couple_codes_delete" ON couple_invite_codes FOR DELETE USING (auth.uid() = user_id);

-- Allow redeeming: anyone authenticated can read a code to verify it
CREATE POLICY "couple_codes_read_for_redeem" ON couple_invite_codes FOR SELECT USING (auth.role() = 'authenticated');

-- Permanent couple links
CREATE TABLE IF NOT EXISTS couple_profiles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_a <> user_b),
  UNIQUE (user_a, user_b)
);

ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "couple_profiles_select"
  ON couple_profiles FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "couple_profiles_insert"
  ON couple_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "couple_profiles_delete"
  ON couple_profiles FOR DELETE
  USING (auth.uid() = user_a OR auth.uid() = user_b);
