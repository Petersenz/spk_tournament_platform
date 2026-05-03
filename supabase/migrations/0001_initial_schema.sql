-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('organizer', 'player');

CREATE TYPE tournament_status AS ENUM (
  'draft',
  'registration_open',
  'registration_closed',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE participant_type AS ENUM ('player', 'team');

CREATE TYPE match_type AS ENUM ('ffa', 'duel');

CREATE TYPE stage_type AS ENUM (
  'single_elimination',
  'double_elimination',
  'gauntlet',
  'bracket_groups',
  'custom_bracket',
  'round_robin',
  'league',
  'swiss_system'
);

CREATE TYPE match_format AS ENUM (
  'no_game',
  'single_game',
  'home_and_away',
  'best_of',
  'fixed_game'
);

CREATE TYPE match_status AS ENUM (
  'pending',
  'ready',
  'running',
  'completed',
  'walkover',
  'cancelled'
);

CREATE TYPE participant_status AS ENUM (
  'pending',
  'approved',
  'checked_in',
  'eliminated',
  'withdrawn'
);

CREATE TYPE registration_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

CREATE TYPE registration_mode AS ENUM ('auto', 'manual');

-- ============================================================
-- TABLES
-- ============================================================

-- Users (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'player',
  avatar_url TEXT,
  dob DATE,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (Organizer's container)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games (pre-seeded or admin-managed)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platforms
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon_url TEXT
);

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  game_id UUID REFERENCES games(id),
  size INT NOT NULL CHECK (size > 0 AND size <= 256),
  participant_type participant_type NOT NULL DEFAULT 'team',
  match_type match_type NOT NULL DEFAULT 'duel',
  status tournament_status NOT NULL DEFAULT 'draft',

  -- Registration settings
  registration_enabled BOOLEAN DEFAULT FALSE,
  registration_mode registration_mode DEFAULT 'auto',
  registration_deadline TIMESTAMPTZ,

  -- Team settings (custom size)
  team_min_players INT DEFAULT 1,
  team_max_players INT DEFAULT 5,

  -- Metadata
  description TEXT,
  rules TEXT,
  prize_info TEXT,
  banner_url TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament <-> Platform (many-to-many)
CREATE TABLE tournament_platforms (
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
  PRIMARY KEY (tournament_id, platform_id)
);

-- Participants (a team or individual player in a tournament)
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id), -- null if added by organizer directly
  type participant_type NOT NULL DEFAULT 'team',
  name TEXT NOT NULL,
  main_contact_email TEXT,
  custom_user_identifier TEXT,
  team_identifier TEXT,
  logo_url TEXT,
  seed INT,
  status participant_status NOT NULL DEFAULT 'pending',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players (members within a team participant)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  custom_user_identifier TEXT,
  image_url TEXT,
  is_captain BOOLEAN DEFAULT FALSE,
  position INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stages
CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  number INT NOT NULL DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'Stage',
  stage_type stage_type NOT NULL,
  size INT,
  has_third_place_match BOOLEAN DEFAULT FALSE,

  -- Match format
  format match_format NOT NULL DEFAULT 'single_game',
  best_of_value INT,          -- e.g., 3, 5, 7
  fixed_game_count INT,       -- for fixed_game format

  -- Advanced settings (flexible JSON)
  settings JSONB DEFAULT '{}',

  -- Placement / seeding
  placement_rules JSONB DEFAULT '{}',

  order_index INT NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds (within a stage)
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  name TEXT,
  number INT NOT NULL,
  group_name TEXT, -- for bracket groups / round robin groups
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id),
  match_number INT,

  -- Participants
  participant1_id UUID REFERENCES participants(id),
  participant2_id UUID REFERENCES participants(id),
  winner_id UUID REFERENCES participants(id),

  -- Scores
  score_participant1 INT DEFAULT 0,
  score_participant2 INT DEFAULT 0,

  -- Status
  status match_status NOT NULL DEFAULT 'pending',

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Bracket linking
  next_match_id UUID REFERENCES matches(id),
  next_match_slot INT,          -- 1 or 2 (which slot winner goes to)
  next_loser_match_id UUID REFERENCES matches(id),  -- for double elim
  next_loser_match_slot INT,
  bracket_position INT,

  -- For result reporting
  reported_by UUID REFERENCES profiles(id),
  reported_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match Games (individual games within a match, for Best-of format)
CREATE TABLE match_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  game_number INT NOT NULL,
  score_participant1 INT DEFAULT 0,
  score_participant2 INT DEFAULT 0,
  winner_id UUID REFERENCES participants(id),
  replay_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations (player/team registers for tournament)
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  participant_id UUID REFERENCES participants(id),
  status registration_status NOT NULL DEFAULT 'pending',
  message TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_tournaments_project ON tournaments(project_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_game ON tournaments(game_id);
CREATE INDEX idx_participants_tournament ON participants(tournament_id);
CREATE INDEX idx_players_participant ON players(participant_id);
CREATE INDEX idx_stages_tournament ON stages(tournament_id);
CREATE INDEX idx_rounds_stage ON rounds(stage_id);
CREATE INDEX idx_matches_stage ON matches(stage_id);
CREATE INDEX idx_matches_round ON matches(round_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_registrations_tournament ON registrations(tournament_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Owner manages projects" ON projects FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Owner manages tournaments" ON tournaments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tournaments.project_id
    AND projects.owner_id = auth.uid()
  )
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Organizer manages participants" ON participants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tournaments
    JOIN projects ON projects.id = tournaments.project_id
    WHERE tournaments.id = participants.tournament_id
    AND projects.owner_id = auth.uid()
  )
);
CREATE POLICY "Players insert own participants" ON participants FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Organizer manages matches" ON matches FOR ALL USING (
  EXISTS (
    SELECT 1 FROM stages
    JOIN tournaments ON tournaments.id = stages.tournament_id
    JOIN projects ON projects.id = tournaments.project_id
    WHERE stages.id = matches.stage_id
    AND projects.owner_id = auth.uid()
  )
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own registrations" ON registrations
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM tournaments
      JOIN projects ON projects.id = tournaments.project_id
      WHERE tournaments.id = registrations.tournament_id
      AND projects.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users register" ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS (Auto-create Profile)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, role, preferred_language)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nickname', 'User_' || substr(new.id::text, 1, 6)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'player'),
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
