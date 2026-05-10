-- Fix missing ON DELETE CASCADE constraints for participants references
-- This allows deleting a tournament (and its participants) to also clean up or allow matches cleanup

-- 1. Matches Table
ALTER TABLE matches
DROP CONSTRAINT IF EXISTS matches_participant1_id_fkey,
DROP CONSTRAINT IF EXISTS matches_participant2_id_fkey,
DROP CONSTRAINT IF EXISTS matches_winner_id_fkey;

ALTER TABLE matches
ADD CONSTRAINT matches_participant1_id_fkey 
  FOREIGN KEY (participant1_id) 
  REFERENCES participants(id) 
  ON DELETE CASCADE,
ADD CONSTRAINT matches_participant2_id_fkey 
  FOREIGN KEY (participant2_id) 
  REFERENCES participants(id) 
  ON DELETE CASCADE,
ADD CONSTRAINT matches_winner_id_fkey 
  FOREIGN KEY (winner_id) 
  REFERENCES participants(id) 
  ON DELETE CASCADE;

-- 2. Match Games Table
ALTER TABLE match_games
DROP CONSTRAINT IF EXISTS match_games_winner_id_fkey;

ALTER TABLE match_games
ADD CONSTRAINT match_games_winner_id_fkey 
  FOREIGN KEY (winner_id) 
  REFERENCES participants(id) 
  ON DELETE CASCADE;

-- 3. Registrations Table
ALTER TABLE registrations
DROP CONSTRAINT IF EXISTS registrations_participant_id_fkey;

ALTER TABLE registrations
ADD CONSTRAINT registrations_participant_id_fkey 
  FOREIGN KEY (participant_id) 
  REFERENCES participants(id) 
  ON DELETE SET NULL; -- If participant record is deleted, keep registration record but nullify the link
