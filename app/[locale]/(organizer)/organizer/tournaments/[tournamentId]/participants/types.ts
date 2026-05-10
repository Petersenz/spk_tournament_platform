export interface Player {
  id: string;
  name: string;
  email: string | null;
  custom_user_identifier: string | null;
  image_url: string | null;
  is_captain: boolean;
  position: number | null;
}

export interface Participant {
  id: string;
  name: string;
  logo_url: string | null;
  main_contact_email: string | null;
  seed: number | null;
  created_at: string;
  players: Player[];
  status: string;
  type: string;
  team_identifier: string | null;
}
