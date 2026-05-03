CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read system settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage system settings" ON system_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Seed basic settings
INSERT INTO system_settings (key, value) VALUES
  ('maintenance_mode', 'false'::jsonb),
  ('public_registration', 'true'::jsonb),
  ('platform_name', '"Samutprakan Esports Association"'::jsonb);
