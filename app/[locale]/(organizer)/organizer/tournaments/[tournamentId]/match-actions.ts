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

export async function swapTeamsInMatches(
  tournamentId: string,
  matchId1: string,
  participantField1: "participant1_id" | "participant2_id",
  matchId2: string,
  participantField2: "participant1_id" | "participant2_id",
) {
  const supabase = await createClient();

  // 1. Fetch the two matches
  const { data: match1, error: err1 } = await supabase
    .from("matches")
    .select("*, rounds(number)")
    .eq("id", matchId1)
    .single();

  const { data: match2, error: err2 } = await supabase
    .from("matches")
    .select("*, rounds(number)")
    .eq("id", matchId2)
    .single();

  if (err1 || err2 || !match1 || !match2) {
    return { error: "One or both matches not found" };
  }

  if (match1.stage_id !== match2.stage_id) {
    return { error: "Matches must be in the same stage" };
  }

  const { data: stage, error: stageError } = await supabase
    .from("stages")
    .select("tournament_id")
    .eq("id", match1.stage_id)
    .single();

  if (stageError || !stage || stage.tournament_id !== tournamentId) {
    return { error: "Matches do not belong to this tournament" };
  }

  const round1 = Array.isArray(match1.rounds)
    ? match1.rounds[0]?.number
    : match1.rounds?.number;
  const round2 = Array.isArray(match2.rounds)
    ? match2.rounds[0]?.number
    : match2.rounds?.number;

  if (round1 !== 1 || round2 !== 1) {
    return { error: "Only first-round teams can be swapped" };
  }

  if (match1.status === "completed" || match2.status === "completed") {
    return { error: "Completed matches cannot be swapped" };
  }

  if (match1.winner_id || match2.winner_id) {
    return { error: "Matches with recorded winners cannot be swapped" };
  }

  if (
    match1.next_match_id ||
    match2.next_match_id ||
    match1.next_loser_match_id ||
    match2.next_loser_match_id
  ) {
    const downstreamMatchIds = [
      match1.next_match_id,
      match2.next_match_id,
      match1.next_loser_match_id,
      match2.next_loser_match_id,
    ].filter((id): id is string => typeof id === "string");

    if (downstreamMatchIds.length > 0) {
      const { data: downstreamMatches, error: downstreamError } = await supabase
        .from("matches")
        .select("id, participant1_id, participant2_id, winner_id, status")
        .in("id", downstreamMatchIds);

      if (downstreamError) {
        return { error: downstreamError.message };
      }

      const hasDownstreamRecord = (downstreamMatches || []).some(
        (match) =>
          !!match.participant1_id ||
          !!match.participant2_id ||
          !!match.winner_id ||
          match.status === "completed",
      );

      if (hasDownstreamRecord) {
        return {
          error:
            "This bracket already has downstream match records. Team swaps are locked.",
        };
      }
    }
  }

  // Get the participant IDs
  const teamId1 = match1[participantField1];
  const teamId2 = match2[participantField2];

  if (!teamId1 || !teamId2) {
    return { error: "Both slots must have confirmed teams to swap" };
  }

  // 2. Perform swap in database
  const { error: updateErr1 } = await supabase
    .from("matches")
    .update({ [participantField1]: teamId2 })
    .eq("id", matchId1);

  const { error: updateErr2 } = await supabase
    .from("matches")
    .update({ [participantField2]: teamId1 })
    .eq("id", matchId2);

  if (updateErr1 || updateErr2) {
    return { error: "Failed to update match slots" };
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}`);
  return { success: true };
}

export async function swapMatchesInRound(
  tournamentId: string,
  matchId1: string,
  matchId2: string,
) {
  const supabase = await createClient();

  if (matchId1 === matchId2) {
    return { error: "Choose two different matches to swap" };
  }

  const { data: match1, error: err1 } = await supabase
    .from("matches")
    .select("*, rounds(number)")
    .eq("id", matchId1)
    .single();

  const { data: match2, error: err2 } = await supabase
    .from("matches")
    .select("*, rounds(number)")
    .eq("id", matchId2)
    .single();

  if (err1 || err2 || !match1 || !match2) {
    return { error: "One or both matches not found" };
  }

  if (match1.stage_id !== match2.stage_id) {
    return { error: "Matches must be in the same stage" };
  }

  const { data: stage, error: stageError } = await supabase
    .from("stages")
    .select("tournament_id")
    .eq("id", match1.stage_id)
    .single();

  if (stageError || !stage || stage.tournament_id !== tournamentId) {
    return { error: "Matches do not belong to this tournament" };
  }

  const round1 = Array.isArray(match1.rounds)
    ? match1.rounds[0]?.number
    : match1.rounds?.number;
  const round2 = Array.isArray(match2.rounds)
    ? match2.rounds[0]?.number
    : match2.rounds?.number;

  if (round1 !== 1 || round2 !== 1) {
    return { error: "Only first-round matches can be swapped" };
  }

  if (match1.status === "completed" || match2.status === "completed") {
    return { error: "Completed matches cannot be swapped" };
  }

  if (match1.winner_id || match2.winner_id) {
    return { error: "Matches with recorded winners cannot be swapped" };
  }

  const match1Restore = {
    participant1_id: match1.participant1_id,
    participant2_id: match1.participant2_id,
    winner_id: match1.winner_id,
    score_participant1: match1.score_participant1,
    score_participant2: match1.score_participant2,
    status: match1.status,
  };

  const match2Restore = {
    participant1_id: match2.participant1_id,
    participant2_id: match2.participant2_id,
    winner_id: match2.winner_id,
    score_participant1: match2.score_participant1,
    score_participant2: match2.score_participant2,
    status: match2.status,
  };

  const { error: updateErr1 } = await supabase
    .from("matches")
    .update({
      participant1_id: match2.participant1_id,
      participant2_id: match2.participant2_id,
      winner_id: null,
      score_participant1: 0,
      score_participant2: 0,
      status: "pending",
    })
    .eq("id", matchId1);

  if (updateErr1) {
    return { error: updateErr1.message };
  }

  const { error: updateErr2 } = await supabase
    .from("matches")
    .update({
      participant1_id: match1.participant1_id,
      participant2_id: match1.participant2_id,
      winner_id: null,
      score_participant1: 0,
      score_participant2: 0,
      status: "pending",
    })
    .eq("id", matchId2);

  if (updateErr2) {
    await supabase.from("matches").update(match1Restore).eq("id", matchId1);
    await supabase.from("matches").update(match2Restore).eq("id", matchId2);
    return { error: "Failed to swap matches. No changes were saved." };
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}`);
  return { success: true };
}
