CREATE TABLE IF NOT EXISTS game_platforms (
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (game_id, platform_id)
);

CREATE INDEX IF NOT EXISTS idx_game_platforms_game_id
  ON game_platforms (game_id);

CREATE INDEX IF NOT EXISTS idx_game_platforms_platform_id
  ON game_platforms (platform_id);

ALTER TABLE game_platforms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read game platforms" ON game_platforms;
CREATE POLICY "Public read game platforms" ON game_platforms
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage game platforms" ON game_platforms;
CREATE POLICY "Admins manage game platforms" ON game_platforms
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
