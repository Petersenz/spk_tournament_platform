-- Add missing metadata columns to games table
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS developer text,
ADD COLUMN IF NOT EXISTS release_year integer;

-- Update RLS if needed (usually not needed if already managed by admin)
-- The columns will be null by default for existing games.
