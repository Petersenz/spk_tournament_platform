import { createClient } from "@/lib/supabase/server";

interface Participant {
  id: string;
  name: string;
}

export async function generateRoundRobin(
  stageId: string,
  participants: Participant[],
) {
  const supabase = await createClient();

  if (participants.length < 2) {
    throw new Error("Need at least 2 participants to generate a league");
  }

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

  // 3. Prepare participants (add null if odd to handle BYEs)
  const list: (Participant | null)[] = [...participants];
  if (list.length % 2 !== 0) {
    list.push(null);
  }

  const n = list.length;
  const numRounds = n - 1;
  const matchesPerRound = n / 2;

  // 4. Create rounds
  const roundIds: string[] = [];
  for (let r = 1; r <= numRounds; r++) {
    const { data: round, error } = await supabase
      .from("rounds")
      .insert({ stage_id: stageId, number: r, name: `Round ${r}` })
      .select()
      .single();
    if (error) throw error;
    roundIds.push(round.id);
  }

  // 5. Circle Method Pairing
  for (let r = 0; r < numRounds; r++) {
    const roundId = roundIds[r];

    for (let m = 0; m < matchesPerRound; m++) {
      const p1 = list[m];
      const p2 = list[n - 1 - m];

      // Skip match if one of them is NULL (it's a BYE round)
      if (p1 && p2) {
        await supabase.from("matches").insert({
          stage_id: stageId,
          round_id: roundId,
          match_number: m + 1,
          participant1_id: p1.id,
          participant2_id: p2.id,
          status: "pending",
        });
      }
    }

    // Rotate list for next round (keep first item fixed)
    const fixed = list[0];
    const rotated = list.slice(1);
    const last = rotated.pop();
    if (last !== undefined) {
      rotated.unshift(last);
    }
    list.splice(0, list.length, fixed, ...rotated);
  }

  return { success: true };
}
