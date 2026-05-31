CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read system settings" ON system_settings;
CREATE POLICY "Public read system settings" ON system_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage system settings" ON system_settings;
CREATE POLICY "Admins manage system settings" ON system_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

INSERT INTO system_settings (key, value)
VALUES
  ('site_logo_url', '"/logo.png"'::jsonb),
  ('site_name_en', '"Samutprakan Esports Association"'::jsonb),
  ('site_name_th', '"สมาคมกีฬาอีสปอร์ตสมุทรปราการ"'::jsonb),
  ('site_tagline_en', '"The ultimate tournament platform for Samutprakan Esport Association."'::jsonb),
  ('site_tagline_th', '"แพลตฟอร์มจัดการแข่งขันกีฬาอีสปอร์ตที่ครบวงจรที่สุดสำหรับสมาคมกีฬาอีสปอร์ตจังหวัดสมุทรปราการ"'::jsonb),
  ('footer_text_en', '"© 2026 Samutprakan Esports Association. All rights reserved."'::jsonb),
  ('footer_text_th', '"© 2026 สมาคมกีฬาอีสปอร์ตจังหวัดสมุทรปราการ สงวนลิขสิทธิ์"'::jsonb),
  ('contact_email', '""'::jsonb),
  ('facebook_url', '""'::jsonb),
  ('discord_url', '""'::jsonb)
ON CONFLICT (key) DO NOTHING;
