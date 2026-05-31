CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'th')),
  title TEXT,
  subtitle TEXT,
  body TEXT,
  image_url TEXT,
  cta_label TEXT,
  cta_href TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  UNIQUE (key, locale)
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_key_locale
  ON content_blocks (key, locale);

CREATE INDEX IF NOT EXISTS idx_content_blocks_active
  ON content_blocks (is_active);

ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read content blocks" ON content_blocks;
CREATE POLICY "Public read content blocks" ON content_blocks
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage content blocks" ON content_blocks;
CREATE POLICY "Admins manage content blocks" ON content_blocks
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

CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement TEXT NOT NULL,
  key TEXT NOT NULL,
  label_en TEXT NOT NULL,
  label_th TEXT NOT NULL,
  href TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  required_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  UNIQUE (placement, key)
);

CREATE INDEX IF NOT EXISTS idx_navigation_items_placement_visible_sort
  ON navigation_items (placement, is_visible, sort_order);

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read navigation items" ON navigation_items;
CREATE POLICY "Public read navigation items" ON navigation_items
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage navigation items" ON navigation_items;
CREATE POLICY "Admins manage navigation items" ON navigation_items
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

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Site Assets" ON storage.objects;
CREATE POLICY "Public Access Site Assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admins Upload Site Assets" ON storage.objects;
CREATE POLICY "Admins Upload Site Assets" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins Manage Site Assets" ON storage.objects;
CREATE POLICY "Admins Manage Site Assets" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'site-assets'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

INSERT INTO content_blocks
  (key, locale, title, subtitle, body, cta_label, cta_href, sort_order)
VALUES
  (
    'home_hero',
    'en',
    'COMPETE. CONQUER. CLAIM GLORY.',
    'The ultimate tournament platform for Samutprakan Esport Association.',
    NULL,
    'Browse Tournaments',
    '/tournaments',
    10
  ),
  (
    'home_hero',
    'th',
    'แหล่งรวมการแข่งขัน\nเพื่อชิงชัยความเป็นหนึ่ง',
    'แพลตฟอร์มจัดการแข่งขันกีฬาอีสปอร์ตที่ครบวงจรที่สุดสำหรับสมาคมกีฬาอีสปอร์ตจังหวัดสมุทรปราการ',
    NULL,
    'หาทัวร์นาเมนต์',
    '/tournaments',
    10
  ),
  (
    'about_intro',
    'en',
    'About Samutprakan Esport',
    'We are dedicated to building a professional ecosystem for competitive gaming in Samutprakan. Our platform empowers organizers to host world-class tournaments and players to discover their potential.',
    NULL,
    NULL,
    NULL,
    20
  ),
  (
    'about_intro',
    'th',
    'เกี่ยวกับสมาคมกีฬาอีสปอร์ตสมุทรปราการ',
    'เรามุ่งมั่นที่จะสร้างระบบนิเวศระดับมืออาชีพสำหรับการแข่งขันเกมในสมุทรปราการ แพลตฟอร์มของเราช่วยให้นักจัดการแข่งขันสามารถจัดงานระดับโลก และให้ผู้เล่นได้ค้นพบศักยภาพของตนเอง',
    NULL,
    NULL,
    NULL,
    20
  ),
  (
    'partner_cta',
    'en',
    'Interested in partnering?',
    'If you are an organization or sponsor looking to support the Samutprakan Esports Association, we would love to hear from you.',
    NULL,
    'Contact Us',
    'mailto:contact@spk-tournaments.com',
    30
  ),
  (
    'partner_cta',
    'th',
    'สนใจร่วมเป็นพันธมิตรกับเรา?',
    'หากคุณเป็นองค์กรหรือสปอนเซอร์ที่ต้องการสนับสนุนสมาคมกีฬาอีสปอร์ตจังหวัดสมุทรปราการ เรายินดีที่จะร่วมงานกับคุณ',
    NULL,
    'ติดต่อเรา',
    'mailto:contact@spk-tournaments.com',
    30
  )
ON CONFLICT (key, locale) DO NOTHING;

INSERT INTO navigation_items
  (placement, key, label_en, label_th, href, is_visible, sort_order)
VALUES
  ('public_navbar', 'tournaments', 'Tournaments', 'ทัวร์นาเมนต์', '/tournaments', true, 10),
  ('public_navbar', 'games', 'Games', 'เกม', '/games', true, 20),
  ('public_navbar', 'about', 'About', 'เกี่ยวกับเรา', '/about', true, 30),
  ('public_footer', 'tournaments', 'Tournaments', 'ทัวร์นาเมนต์', '/tournaments', true, 10),
  ('public_footer', 'games', 'Games', 'เกม', '/games', true, 20),
  ('public_footer', 'about', 'About', 'เกี่ยวกับเรา', '/about', true, 30)
ON CONFLICT (placement, key) DO NOTHING;

INSERT INTO system_settings (key, value)
VALUES
  ('module_games_enabled', 'true'::jsonb),
  ('module_tournaments_enabled', 'true'::jsonb),
  ('module_about_enabled', 'true'::jsonb),
  ('module_public_registration_enabled', 'true'::jsonb),
  ('maintenance_mode', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;
