"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function reportMatchScore(formData: FormData) {
  const supabase = await createClient();
  const matchId = formData.get("match_id") as string;
  const tournamentId = formData.get("tournament_id") as string;
  const score1 = parseInt(formData.get("score1") as string);
  const score2 = parseInt(formData.get("score2") as string);

  // 1. Fetch current match info
  const { data: match, error: fetchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (fetchError || !match) return { error: "Match not found" };

  // 2. Determine winner
  let winnerId = null;
  if (score1 > score2) winnerId = match.participant1_id;
  else if (score2 > score1) winnerId = match.participant2_id;

  if (!winnerId) return { error: "Match cannot be a tie" };

  // 3. Update current match
  const { error: updateError } = await supabase
    .from("matches")
    .update({
      score_participant1: score1,
      score_participant2: score2,
      winner_id: winnerId,
      status: "completed",
    })
    .eq("id", matchId);

  if (updateError) return { error: updateError.message };

  // 4. Advance to next match if exists, otherwise complete tournament
  if (match.next_match_id) {
    const slotField =
      match.next_match_slot === 1 ? "participant1_id" : "participant2_id";
    await supabase
      .from("matches")
      .update({ [slotField]: winnerId })
      .eq("id", match.next_match_id);
  } else {
    // This is the final match (no next match), so complete the tournament
    await supabase
      .from("tournaments")
      .update({ status: "completed" })
      .eq("id", tournamentId);
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}`);
  return { success: true };
}
