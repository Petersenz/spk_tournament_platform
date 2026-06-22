-- Registrations RLS: the initial schema granted only SELECT and INSERT, so
-- approve/reject (UPDATE) and leave/withdraw (DELETE) were silently blocked by
-- row-level security — the organizer actions returned success but changed
-- nothing. Add UPDATE and DELETE policies for: the registrant (their own row),
-- the owning organizer (via project ownership), and admins.

DROP POLICY IF EXISTS "Owner or admin updates registrations" ON registrations;
CREATE POLICY "Owner or admin updates registrations" ON registrations
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM tournaments
      JOIN projects ON projects.id = tournaments.project_id
      WHERE tournaments.id = registrations.tournament_id
        AND projects.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Owner or self deletes registrations" ON registrations;
CREATE POLICY "Owner or self deletes registrations" ON registrations
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM tournaments
      JOIN projects ON projects.id = tournaments.project_id
      WHERE tournaments.id = registrations.tournament_id
        AND projects.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
