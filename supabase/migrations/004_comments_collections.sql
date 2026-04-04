-- ============================================================
-- 004: Comments + Collections
-- ============================================================
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Comments on reviews
CREATE TABLE IF NOT EXISTS comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body       text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_comments
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Collections (personal + public lists of reviews)
CREATE TABLE IF NOT EXISTS collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description text,
  is_public   boolean NOT NULL DEFAULT false,
  slug        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "collections_select"
  ON collections FOR SELECT
  USING (is_public OR auth.uid() = user_id);

CREATE POLICY "collections_insert"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "collections_update"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "collections_delete"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_collections
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Items in a collection
CREATE TABLE IF NOT EXISTS collection_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  review_id     uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  added_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, review_id)
);

ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- Readable if the collection is readable
CREATE POLICY "collection_items_select"
  ON collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id
        AND (c.is_public OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "collection_items_insert"
  ON collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "collection_items_delete"
  ON collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );
