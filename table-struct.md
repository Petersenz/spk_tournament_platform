-- ============================================================
-- CORE TABLES (Users & Access)
-- ============================================================

-- Profiles (extends Supabase Auth)
CREATE TABLE public.profiles (
id uuid NOT NULL,
nickname text NOT NULL,
role public.user_role NOT NULL DEFAULT 'player'::user_role,
avatar_url text NULL,
custom_user_identifier text NULL,
bio text NULL,
dob date NULL,
preferred_language text NULL DEFAULT 'en'::text,
created_at timestamp with time zone NULL DEFAULT now(),
updated_at timestamp with time zone NULL DEFAULT now(),
CONSTRAINT profiles_pkey PRIMARY KEY (id),
CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- ============================================================
-- ORGANIZATION & INFRASTRUCTURE
-- ============================================================

-- Projects (Organizer's container)
CREATE TABLE public.projects (
id uuid NOT NULL DEFAULT gen_random_uuid (),
owner_id uuid NOT NULL,
name text NOT NULL,
description text NULL,
logo_url text NULL,
created_at timestamp with time zone NULL DEFAULT now(),
updated_at timestamp with time zone NULL DEFAULT now(),
CONSTRAINT projects_pkey PRIMARY KEY (id),
CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects USING btree (owner_id) TABLESPACE pg_default;

-- Tournaments
CREATE TABLE public.tournaments (
id uuid NOT NULL DEFAULT gen_random_uuid (),
project_id uuid NOT NULL,
created_by uuid NOT NULL,
name text NOT NULL,
game_id uuid NULL,
size integer NOT NULL,
participant_type public.participant_type NOT NULL DEFAULT 'team'::participant_type,
match_type public.match_type NOT NULL DEFAULT 'duel'::match_type,
status public.tournament_status NOT NULL DEFAULT 'draft'::tournament_status,
registration_enabled boolean NULL DEFAULT false,
registration_mode public.registration_mode NULL DEFAULT 'auto'::registration_mode,
registration_deadline timestamp with time zone NULL,
team_min_players integer NULL DEFAULT 1,
team_max_players integer NULL DEFAULT 5,
description text NULL,
rules text NULL,
prize_info text NULL,
banner_url text NULL,
start_date timestamp with time zone NULL,
end_date timestamp with time zone NULL,
created_at timestamp with time zone NULL DEFAULT now(),
updated_at timestamp with time zone NULL DEFAULT now(),
CONSTRAINT tournaments_pkey PRIMARY KEY (id),
CONSTRAINT tournaments_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles (id),
CONSTRAINT tournaments_game_id_fkey FOREIGN KEY (game_id) REFERENCES games (id),
CONSTRAINT tournaments_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
CONSTRAINT tournaments_size_check CHECK (
(
(size > 0)
AND (size <= 256)
)
)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_tournaments_project ON public.tournaments USING btree (project_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_tournaments_game ON public.tournaments USING btree (game_id) TABLESPACE pg_default;

-- Games (pre-seeded or admin-managed)
CREATE TABLE public.games (
id uuid NOT NULL DEFAULT gen_random_uuid (),
name text NOT NULL,
slug text NOT NULL,
logo_url text NULL,
cover_url text NULL,
created_at timestamp with time zone NULL DEFAULT now(),
description text NULL,
is_active boolean NULL DEFAULT true,
CONSTRAINT games_pkey PRIMARY KEY (id),
CONSTRAINT games_name_key UNIQUE (name),
CONSTRAINT games_slug_key UNIQUE (slug)
) TABLESPACE pg_default;

-- Platforms
CREATE TABLE public.platforms (
id uuid NOT NULL DEFAULT gen_random_uuid (),
name text NOT NULL,
icon_url text NULL,
CONSTRAINT platforms_pkey PRIMARY KEY (id),
CONSTRAINT platforms_name_key UNIQUE (name)
) TABLESPACE pg_default;

-- Tournament <-> Platform (many-to-many)
CREATE TABLE public.tournament_platforms (
tournament_id uuid NOT NULL,
platform_id uuid NOT NULL,
CONSTRAINT tournament_platforms_pkey PRIMARY KEY (tournament_id, platform_id),
CONSTRAINT tournament_platforms_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platforms (id) ON DELETE CASCADE,
CONSTRAINT tournament_platforms_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- ============================================================
-- PARTICIPANTS & REGISTRATIONS
-- ============================================================

-- Participants (team or individual player in a tournament)
CREATE TABLE public.participants (
id uuid NOT NULL DEFAULT gen_random_uuid (),
tournament_id uuid NOT NULL,
user_id uuid NULL,
type public.participant_type NOT NULL DEFAULT 'team'::participant_type,
name text NOT NULL,
main_contact_email text NULL,
custom_user_identifier text NULL,
team_identifier text NULL,
logo_url text NULL,
seed integer NULL,
status public.participant_status NOT NULL DEFAULT 'pending'::participant_status,
registered_at timestamp with time zone NULL DEFAULT now(),
created_at timestamp with time zone NULL DEFAULT now(),
CONSTRAINT participants_pkey PRIMARY KEY (id),
CONSTRAINT participants_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
CONSTRAINT participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_participants_tournament ON public.participants USING btree (tournament_id) TABLESPACE pg_default;

-- Players (members within a team participant)
CREATE TABLE public.players (
id uuid NOT NULL DEFAULT gen_random_uuid (),
participant_id uuid NOT NULL,
name text NOT NULL,
email text NULL,
custom_user_identifier text NULL,
image_url text NULL,
is_captain boolean NULL DEFAULT false,
position integer NULL,
created_at timestamp with time zone NULL DEFAULT now(),
CONSTRAINT players_pkey PRIMARY KEY (id),
CONSTRAINT players_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES participants (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_players_participant ON public.players USING btree (participant_id) TABLESPACE pg_default;

-- Registrations (player/team registers for tournament)
CREATE TABLE public.registrations (
id uuid NOT NULL DEFAULT gen_random_uuid (),
tournament_id uuid NOT NULL,
user_id uuid NOT NULL,
participant_id uuid NULL,
status public.registration_status NOT NULL DEFAULT 'pending'::registration_status,
message text NULL,
applied_at timestamp with time zone NULL DEFAULT now(),
reviewed_at timestamp with time zone NULL,
reviewed_by uuid NULL,
created_at timestamp with time zone NULL DEFAULT now(),
CONSTRAINT registrations_pkey PRIMARY KEY (id),
CONSTRAINT registrations_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES participants (id),
CONSTRAINT registrations_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles (id),
CONSTRAINT registrations_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON public.registrations USING btree (tournament_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations USING btree (user_id) TABLESPACE pg_default;

-- ============================================================
-- TOURNAMENT STRUCTURE (Brackets)
-- ============================================================

-- Stages
CREATE TABLE public.stages (
id uuid NOT NULL DEFAULT gen_random_uuid (),
tournament_id uuid NOT NULL,
number integer NOT NULL DEFAULT 1,
name text NOT NULL DEFAULT 'Stage'::text,
stage_type public.stage_type NOT NULL,
size integer NULL,
has_third_place_match boolean NULL DEFAULT false,
format public.match_format NOT NULL DEFAULT 'single_game'::match_format,
best_of_value integer NULL,
fixed_game_count integer NULL,
settings jsonb NULL DEFAULT '{}'::jsonb,
placement_rules jsonb NULL DEFAULT '{}'::jsonb,
order_index integer NOT NULL DEFAULT 0,
status text NULL DEFAULT 'pending'::text,
created_at timestamp with time zone NULL DEFAULT now(),
updated_at timestamp with time zone NULL DEFAULT now(),
CONSTRAINT stages_pkey PRIMARY KEY (id),
CONSTRAINT stages_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_stages_tournament ON public.stages USING btree (tournament_id) TABLESPACE pg_default;

-- Rounds (within a stage)
CREATE TABLE public.rounds (
id uuid NOT NULL DEFAULT gen_random_uuid (),
stage_id uuid NOT NULL,
name text NULL,
number integer NOT NULL,
group_name text NULL,
created_at timestamp with time zone NULL DEFAULT now(),
CONSTRAINT rounds_pkey PRIMARY KEY (id),
CONSTRAINT rounds_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_rounds_stage ON public.rounds USING btree (stage_id) TABLESPACE pg_default;

-- Matches
CREATE TABLE public.matches (
id uuid NOT NULL DEFAULT gen_random_uuid (),
stage_id uuid NOT NULL,
round_id uuid NULL,
match_number integer NULL,
participant1_id uuid NULL,
participant2_id uuid NULL,
winner_id uuid NULL,
score_participant1 integer NULL DEFAULT 0,
score_participant2 integer NULL DEFAULT 0,
status public.match_status NOT NULL DEFAULT 'pending'::match_status,
scheduled_at timestamp with time zone NULL,
started_at timestamp with time zone NULL,
completed_at timestamp with time zone NULL,
next_match_id uuid NULL,
next_match_slot integer NULL,
next_loser_match_id uuid NULL,
next_loser_match_slot integer NULL,
bracket_position integer NULL,
reported_by uuid NULL,
reported_at timestamp with time zone NULL,
created_at timestamp with time zone NULL DEFAULT now(),
updated_at timestamp with time zone NULL DEFAULT now(),
CONSTRAINT matches_pkey PRIMARY KEY (id),
CONSTRAINT matches_next_match_id_fkey FOREIGN KEY (next_match_id) REFERENCES matches (id),
CONSTRAINT matches_participant1_id_fkey FOREIGN KEY (participant1_id) REFERENCES participants (id),
CONSTRAINT matches_participant2_id_fkey FOREIGN KEY (participant2_id) REFERENCES participants (id),
CONSTRAINT matches_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES profiles (id),
CONSTRAINT matches_round_id_fkey FOREIGN KEY (round_id) REFERENCES rounds (id),
CONSTRAINT matches_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE,
CONSTRAINT matches_next_loser_match_id_fkey FOREIGN KEY (next_loser_match_id) REFERENCES matches (id),
CONSTRAINT matches_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES participants (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_matches_stage ON public.matches USING btree (stage_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_matches_round ON public.matches USING btree (round_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches USING btree (status) TABLESPACE pg_default;

-- Match Games (individual games within a match)
CREATE TABLE public.match_games (
id uuid NOT NULL DEFAULT gen_random_uuid (),
match_id uuid NOT NULL,
game_number integer NOT NULL,
score_participant1 integer NULL DEFAULT 0,
score_participant2 integer NULL DEFAULT 0,
winner_id uuid NULL,
replay_url text NULL,
created_at timestamp with time zone NULL DEFAULT now(),
CONSTRAINT match_games_pkey PRIMARY KEY (id),
CONSTRAINT match_games_match_id_fkey FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE,
CONSTRAINT match_games_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES participants (id)
) TABLESPACE pg_default;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Owner manages projects" ON public.projects FOR ALL USING (auth.uid() = owner_id);

-- Tournaments
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Owner manages tournaments" ON public.tournaments FOR ALL USING (
EXISTS (
SELECT 1 FROM public.projects
WHERE projects.id = tournaments.project_id
AND projects.owner_id = auth.uid()
)
);

-- Participants
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Organizer manages participants" ON public.participants FOR ALL USING (
EXISTS (
SELECT 1 FROM public.tournaments
JOIN public.projects ON projects.id = tournaments.project_id
WHERE tournaments.id = participants.tournament_id
AND projects.owner_id = auth.uid()
)
);
CREATE POLICY "Players insert own participants" ON public.participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Organizer manages matches" ON public.matches FOR ALL USING (
EXISTS (
SELECT 1 FROM public.stages
JOIN public.tournaments ON tournaments.id = stages.tournament_id
JOIN public.projects ON projects.id = tournaments.project_id
WHERE stages.id = matches.stage_id
AND projects.owner_id = auth.uid()
)
);

-- Registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own registrations" ON public.registrations
FOR SELECT USING (auth.uid() = user_id OR
EXISTS (
SELECT 1 FROM public.tournaments
JOIN public.projects ON projects.id = tournaments.project_id
WHERE tournaments.id = registrations.tournament_id
AND projects.owner_id = auth.uid()
)
);
CREATE POLICY "Users register" ON public.registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
