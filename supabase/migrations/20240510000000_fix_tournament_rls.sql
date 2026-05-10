-- Enable RLS and add missing policies for tournament-related tables
-- Updated with DROP POLICY IF EXISTS to avoid "already exists" errors.

-- 1. PLAYERS table
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read players" ON public.players;
CREATE POLICY "Public read players" ON public.players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizer manages players" ON public.players;
CREATE POLICY "Organizer manages players" ON public.players 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.participants
      JOIN public.tournaments ON tournaments.id = participants.tournament_id
      JOIN public.projects ON projects.id = tournaments.project_id
      WHERE participants.id = players.participant_id
      AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users manage own participant roster" ON public.players;
CREATE POLICY "Users manage own participant roster" ON public.players 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.id = players.participant_id
      AND participants.user_id = auth.uid()
    )
  );

-- 2. STAGES table
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stages" ON public.stages;
CREATE POLICY "Public read stages" ON public.stages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizer manages stages" ON public.stages;
CREATE POLICY "Organizer manages stages" ON public.stages 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      JOIN public.projects ON projects.id = tournaments.project_id
      WHERE tournaments.id = stages.tournament_id
      AND projects.owner_id = auth.uid()
    )
  );

-- 3. ROUNDS table
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read rounds" ON public.rounds;
CREATE POLICY "Public read rounds" ON public.rounds FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizer manages rounds" ON public.rounds;
CREATE POLICY "Organizer manages rounds" ON public.rounds 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stages
      JOIN public.tournaments ON tournaments.id = stages.tournament_id
      JOIN public.projects ON projects.id = tournaments.project_id
      WHERE stages.id = rounds.stage_id
      AND projects.owner_id = auth.uid()
    )
  );

-- 4. MATCH_GAMES table
ALTER TABLE public.match_games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read match_games" ON public.match_games;
CREATE POLICY "Public read match_games" ON public.match_games FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizer manages match_games" ON public.match_games;
CREATE POLICY "Organizer manages match_games" ON public.match_games 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.matches
      JOIN public.stages ON stages.id = matches.stage_id
      JOIN public.tournaments ON tournaments.id = stages.tournament_id
      JOIN public.projects ON projects.id = tournaments.project_id
      WHERE matches.id = match_games.match_id
      AND projects.owner_id = auth.uid()
    )
  );

-- 5. TOURNAMENT_PLATFORMS table
ALTER TABLE public.tournament_platforms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read tournament_platforms" ON public.tournament_platforms;
CREATE POLICY "Public read tournament_platforms" ON public.tournament_platforms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizer manages tournament_platforms" ON public.tournament_platforms;
CREATE POLICY "Organizer manages tournament_platforms" ON public.tournament_platforms 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tournaments
      JOIN public.projects ON projects.id = tournaments.project_id
      WHERE tournaments.id = tournament_platforms.tournament_id
      AND projects.owner_id = auth.uid()
    )
  );

-- 6. PLATFORMS table
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read platforms" ON public.platforms;
CREATE POLICY "Public read platforms" ON public.platforms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage platforms" ON public.platforms;
CREATE POLICY "Admins manage platforms" ON public.platforms 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 7. GAMES table
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read games" ON public.games;
CREATE POLICY "Public read games" ON public.games FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage games" ON public.games;
CREATE POLICY "Admins manage games" ON public.games 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
