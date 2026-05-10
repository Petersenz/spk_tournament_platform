import { createClient } from "@/lib/supabase/server";

interface Participant {
  id: string;
  name: string;
  seed?: number;
}

export async function generateSingleElimination(
  stageId: string,
  participants: Participant[],
) {
  const supabase = await createClient();

  if (participants.length < 2) {
    throw new Error("Need at least 2 participants to generate a bracket");
  }

  // 1. Fetch tournament_id for this stage
  const { data: stage } = await supabase
    .from("stages")
    .select("tournament_id")
    .eq("id", stageId)
    .single();

  if (!stage) throw new Error("Stage not found");

  // 2. Calculate size (next power of 2)
  const participantCount = participants.length;
  const roundsCount = Math.ceil(Math.log2(participantCount));

  // 3. Clear existing matches for this stage
  await supabase.from("matches").delete().eq("stage_id", stageId);
  // Clear existing rounds for this stage
  await supabase.from("rounds").delete().eq("stage_id", stageId);

  // 4. Create rounds first
  const roundIds: string[] = [];
  for (let r = 1; r <= roundsCount; r++) {
    const { data: round, error } = await supabase
      .from("rounds")
      .insert({ stage_id: stageId, number: r, name: `Round ${r}` })
      .select()
      .single();
    if (error) throw error;
    roundIds.push(round.id);
  }

  // 5. Create matches for each round (working backwards to link next_match_id)
  const matchesByRound: {
    id: string;
    next_match_id?: string;
    next_match_slot?: number;
  }[][] = [];
  let nextRoundMatches: { id: string }[] = [];

  for (let r = roundsCount; r >= 1; r--) {
    const matchesInRound = Math.pow(2, roundsCount - r);
    const currentRoundMatches: {
      id: string;
      next_match_id?: string;
      next_match_slot?: number;
    }[] = [];
    const roundId = roundIds[r - 1];

    for (let s = 1; s <= matchesInRound; s++) {
      const matchData: {
        stage_id: string;
        round_id: string;
        match_number: number;
        status: string;
        next_match_id?: string;
        next_match_slot?: number;
      } = {
        stage_id: stageId,
        round_id: roundId,
        match_number: s,
        status: "pending",
      };

      // Link to next round
      if (r < roundsCount) {
        const nextMatchIndex = Math.floor((s - 1) / 2);
        matchData.next_match_id = nextRoundMatches[nextMatchIndex].id;
        matchData.next_match_slot = ((s - 1) % 2) + 1;
      }

      const { data: match, error } = await supabase
        .from("matches")
        .insert(matchData)
        .select()
        .single();

      if (error) throw error;
      currentRoundMatches.push(match);
    }

    matchesByRound[r - 1] = currentRoundMatches;
    nextRoundMatches = currentRoundMatches;
  }

  // 6. Assign participants to Round 1
  const round1Matches = matchesByRound[0];
  const sortedParticipants = [...participants].sort(
    (a, b) => (a.seed || 999) - (b.seed || 999),
  );

  for (let i = 0; i < round1Matches.length; i++) {
    const p1 = sortedParticipants[i * 2] || null;
    const p2 = sortedParticipants[i * 2 + 1] || null;

    const updateData: {
      participant1_id?: string;
      participant2_id?: string;
      winner_id?: string;
      status?: string;
      score_participant1?: number;
      score_participant2?: number;
    } = {};
    if (p1) updateData.participant1_id = p1.id;
    if (p2) updateData.participant2_id = p2.id;

    // Handle BYEs
    if (p1 && !p2) {
      updateData.winner_id = p1.id;
      updateData.status = "completed";
      updateData.score_participant1 = 1;
      updateData.score_participant2 = 0;
    }

    await supabase
      .from("matches")
      .update(updateData)
      .eq("id", round1Matches[i].id);

    // If BYE, advance to next match immediately
    if (p1 && !p2 && round1Matches[i].next_match_id) {
      const slot =
        round1Matches[i].next_match_slot === 1
          ? "participant1_id"
          : "participant2_id";
      await supabase
        .from("matches")
        .update({ [slot]: p1.id })
        .eq("id", round1Matches[i].next_match_id);
    }
  }

  return { success: true };
}
