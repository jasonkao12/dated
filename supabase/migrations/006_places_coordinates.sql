-- Add lat/lng to places (populated via Google Places API or manual entry)
ALTER TABLE places
  ADD COLUMN IF NOT EXISTS latitude  numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6);
