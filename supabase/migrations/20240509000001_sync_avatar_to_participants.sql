-- Trigger to sync profile changes (nickname, avatar, identifiers) to tournament participant records
-- This ensures that when a player updates their global profile, their active tournament entries stay in sync automatically.

CREATE OR REPLACE FUNCTION public.sync_profile_to_participants()
RETURNS trigger AS $$
BEGIN
  -- 1. Sync custom_user_identifier and logo_url for ALL participant types linked to this user
  -- 2. Sync name ONLY IF the participant type is 'player' (to avoid overwriting team names)
  UPDATE public.participants
  SET 
    name = CASE 
      WHEN type = 'player' THEN NEW.nickname 
      ELSE name 
    END,
    logo_url = COALESCE(NEW.avatar_url, logo_url),
    custom_user_identifier = NEW.custom_user_identifier
  WHERE user_id = NEW.id;
  
  -- 3. Also sync to the 'players' table (team members) if they exist
  UPDATE public.players
  SET
    name = NEW.nickname,
    image_url = COALESCE(NEW.avatar_url, image_url),
    custom_user_identifier = NEW.custom_user_identifier
  -- We don't have a direct user_id link in public.players yet, but we could add it.
  -- For now, we rely on participants sync.
  WHERE custom_user_identifier = OLD.custom_user_identifier;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-running
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;

CREATE TRIGGER on_profile_updated
  AFTER UPDATE OF nickname, avatar_url, custom_user_identifier ON public.profiles
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION public.sync_profile_to_participants();
