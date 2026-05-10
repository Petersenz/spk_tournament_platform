import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ManualParticipantForm } from "./ManualParticipantForm";

export default async function AddParticipantPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // Fetch Tournament with Project info to verify ownership
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, projects(*)")
    .eq("id", tournamentId)
    .single();

  if (!tournament || tournament.projects.owner_id !== user.id) {
    notFound();
  }

  return (
    <div className="py-12 px-6">
      <ManualParticipantForm
        tournamentId={tournamentId}
        teamMaxPlayers={tournament.team_max_players || 5}
        participantType={tournament.participant_type}
      />
    </div>
  );
}
