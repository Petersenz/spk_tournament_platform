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

  // 4. Advance to next match if exists
  if (match.next_match_id) {
    const slotField =
      match.next_match_slot === 1 ? "participant1_id" : "participant2_id";
    await supabase
      .from("matches")
      .update({ [slotField]: winnerId })
      .eq("id", match.next_match_id);
  } else {
    // Check if this is truly the last match of the tournament (or just the stage)
    // For now, simple logic: if no next_match_id, mark tournament as completed
    await supabase
      .from("tournaments")
      .update({ status: "completed" })
      .eq("id", tournamentId);
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}`);
  return { success: true };
}

export async function updateMatchDetails(formData: FormData) {
  const supabase = await createClient();
  const matchId = formData.get("id") as string;
  const tournamentId = formData.get("tournament_id") as string;
  const scheduled_at = formData.get("scheduled_at") as string;
  const location = formData.get("location") as string;
  const status = formData.get("status") as string;
  const winner_id = formData.get("winner_id") as string;
  const score1 = parseInt(formData.get("score1") as string);
  const score2 = parseInt(formData.get("score2") as string);

  // 1. Fetch current match info to check for progression
  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  const finalWinnerId = winner_id === "none" ? null : winner_id;

  // 2. Update current match
  const { error } = await supabase
    .from("matches")
    .update({
      scheduled_at: scheduled_at || null,
      location: location || null,
      status,
      winner_id: finalWinnerId,
      score_participant1: isNaN(score1) ? null : score1,
      score_participant2: isNaN(score2) ? null : score2,
    })
    .eq("id", matchId);

  if (error) return { error: error.message };

  // 3. Handle progression if completed and winner exists
  if (status === "completed" && finalWinnerId && match?.next_match_id) {
    const slotField =
      match.next_match_slot === 1 ? "participant1_id" : "participant2_id";
    await supabase
      .from("matches")
      .update({ [slotField]: finalWinnerId })
      .eq("id", match.next_match_id);
  }

  // 4. If no next match and it's completed, check if we should close the tournament
  if (status === "completed" && !match?.next_match_id) {
    await supabase
      .from("tournaments")
      .update({ status: "completed" })
      .eq("id", tournamentId);
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath(`/(public)/tournaments/${tournamentId}`, "page");

  return { success: true };
}
