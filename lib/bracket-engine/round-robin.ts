import { createClient } from "@/lib/supabase/server";

interface Participant {
  id: string;
  name: string;
}

export interface RoundRobinPairing {
  matchNumber: number;
  participant1: Participant;
  participant2: Participant;
}

export interface RoundRobinRound {
  number: number;
  name: string;
  pairings: RoundRobinPairing[];
}

/**
 * Pure round-robin scheduler using the circle method.
 *
 * Generates a single round-robin where every participant meets every other
 * participant exactly once. An odd number of participants is padded with a
 * BYE (null), so one participant rests each round. No DB dependency — kept
 * pure so the pairing logic can be unit-tested in isolation.
 */
export function buildRoundRobinSchedule(
  participants: Participant[],
): RoundRobinRound[] {
  if (participants.length < 2) {
    throw new Error("Need at least 2 participants to generate a league");
  }

  // Pad with a BYE slot (null) when odd so the circle method stays balanced.
  const list: (Participant | null)[] = [...participants];
  if (list.length % 2 !== 0) {
    list.push(null);
  }

  const n = list.length;
  const numRounds = n - 1;
  const matchesPerRound = n / 2;
  const rounds: RoundRobinRound[] = [];

  for (let r = 0; r < numRounds; r++) {
    const pairings: RoundRobinPairing[] = [];

    for (let m = 0; m < matchesPerRound; m++) {
      const p1 = list[m];
      const p2 = list[n - 1 - m];

      // Skip the slot that pairs against the BYE (null) participant.
      if (p1 && p2) {
        pairings.push({
          matchNumber: m + 1,
          participant1: p1,
          participant2: p2,
        });
      }
    }

    rounds.push({ number: r + 1, name: `Round ${r + 1}`, pairings });

    // Rotate the list for the next round, keeping the first item fixed.
    const fixed = list[0];
    const rotated = list.slice(1);
    const last = rotated.pop();
    if (last !== undefined) {
      rotated.unshift(last);
    }
    list.splice(0, list.length, fixed, ...rotated);
  }

  return rounds;
}

export async function generateRoundRobin(
  stageId: string,
  participants: Participant[],
) {
  const supabase = await createClient();

  // Build (and validate) the full schedule before touching the database.
  const schedule = buildRoundRobinSchedule(participants);

  // 1. Fetch tournament info
  const { data: stage } = await supabase
    .from("stages")
    .select("tournament_id")
    .eq("id", stageId)
    .single();

  if (!stage) throw new Error("Stage not found");

  // 2. Clear existing matches & rounds for this stage
  await supabase.from("matches").delete().eq("stage_id", stageId);
  await supabase.from("rounds").delete().eq("stage_id", stageId);

  // 3. Persist each round and its matches
  for (const round of schedule) {
    const { data: createdRound, error } = await supabase
      .from("rounds")
      .insert({ stage_id: stageId, number: round.number, name: round.name })
      .select()
      .single();
    if (error) throw error;

    for (const pairing of round.pairings) {
      await supabase.from("matches").insert({
        stage_id: stageId,
        round_id: createdRound.id,
        match_number: pairing.matchNumber,
        participant1_id: pairing.participant1.id,
        participant2_id: pairing.participant2.id,
        status: "pending",
      });
    }
  }

  return { success: true };
}
