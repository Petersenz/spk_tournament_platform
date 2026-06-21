import { createClient } from "@/lib/supabase/server";

interface Participant {
  id: string;
  name: string;
  seed?: number;
}

export type DEBracket = "winners" | "losers" | "grand_final";

type SlotSource =
  | { kind: "seed"; index: number }
  | { kind: "match"; key: string; out: "winner" | "loser" };

interface Node {
  key: string;
  bracket: DEBracket;
  origRound: number;
  s1: SlotSource;
  s2: SlotSource;
}

export interface DEMatch {
  key: string;
  bracket: DEBracket;
  roundNumber: number;
  roundName: string;
  groupName: DEBracket;
  matchNumber: number;
  participant1Id: string | null;
  participant2Id: string | null;
  winnerId: string | null;
  status: "pending" | "completed";
  nextKey: string | null;
  nextSlot: number | null;
  nextLoserKey: string | null;
  nextLoserSlot: number | null;
}

export interface DERound {
  bracket: DEBracket;
  number: number;
  name: string;
  groupName: DEBracket;
}

export interface DEStructure {
  rounds: DERound[];
  matches: DEMatch[];
}

type Resolved =
  | { participantId: string }
  | { matchKey: string; out: "winner" | "loser" }
  | null;

/**
 * Pure double-elimination builder (single grand final, no bracket reset).
 *
 * Produces a winners bracket, a losers bracket and one grand final, with
 * winner links (next_match) and loser-drop links (next_loser_match). Non
 * power-of-2 fields are padded with BYEs, then every match that would resolve
 * without being played (a team with no real opponent) is collapsed away and
 * its links are re-routed, so the persisted bracket never waits on a BYE.
 *
 * No DB dependency — kept pure so the topology can be unit-tested directly.
 */
export function buildDoubleElimination(
  participants: Participant[],
): DEStructure {
  if (participants.length < 2) {
    throw new Error("Need at least 2 participants to generate a bracket");
  }

  const sorted = [...participants].sort(
    (a, b) => (a.seed || 999) - (b.seed || 999),
  );
  const count = sorted.length;
  const k = Math.ceil(Math.log2(count));
  const N = 2 ** k;

  // Degenerate 2-player case: a single grand-final match.
  if (k <= 1) {
    return {
      rounds: [
        {
          bracket: "grand_final",
          number: 1,
          name: "Grand Final",
          groupName: "grand_final",
        },
      ],
      matches: [
        {
          key: "GF",
          bracket: "grand_final",
          roundNumber: 1,
          roundName: "Grand Final",
          groupName: "grand_final",
          matchNumber: 1,
          participant1Id: sorted[0]?.id ?? null,
          participant2Id: sorted[1]?.id ?? null,
          winnerId: null,
          status: "pending",
          nextKey: null,
          nextSlot: null,
          nextLoserKey: null,
          nextLoserSlot: null,
        },
      ],
    };
  }

  // ---- 1. Build the full topology (before BYE collapse) ----
  const nodes = new Map<string, Node>();
  const order: string[] = []; // topological order (sources always come first)
  const add = (n: Node) => {
    nodes.set(n.key, n);
    order.push(n.key);
  };

  const wbCount = (r: number) => N / 2 ** r;
  for (let r = 1; r <= k; r++) {
    for (let i = 1; i <= wbCount(r); i++) {
      let s1: SlotSource, s2: SlotSource;
      if (r === 1) {
        s1 = { kind: "seed", index: 2 * (i - 1) };
        s2 = { kind: "seed", index: 2 * (i - 1) + 1 };
      } else {
        s1 = { kind: "match", key: `W${r - 1}-${2 * i - 1}`, out: "winner" };
        s2 = { kind: "match", key: `W${r - 1}-${2 * i}`, out: "winner" };
      }
      add({ key: `W${r}-${i}`, bracket: "winners", origRound: r, s1, s2 });
    }
  }

  const lbRounds = 2 * (k - 1);
  const lbCount: number[] = [];
  lbCount[1] = N / 4;
  for (let r = 2; r <= lbRounds; r++) {
    lbCount[r] = r % 2 === 0 ? lbCount[r - 1] : lbCount[r - 1] / 2;
  }
  for (let r = 1; r <= lbRounds; r++) {
    for (let i = 1; i <= lbCount[r]; i++) {
      let s1: SlotSource, s2: SlotSource;
      if (r === 1) {
        // First losers round: both teams drop from winners round 1.
        s1 = { kind: "match", key: `W1-${2 * i - 1}`, out: "loser" };
        s2 = { kind: "match", key: `W1-${2 * i}`, out: "loser" };
      } else if (r % 2 === 0) {
        // Drop-in round: survivor vs a fresh winners-bracket loser (reversed
        // to avoid an immediate rematch).
        const wbRound = r / 2 + 1;
        const cnt = lbCount[r];
        s1 = { kind: "match", key: `L${r - 1}-${i}`, out: "winner" };
        s2 = { kind: "match", key: `W${wbRound}-${cnt - i + 1}`, out: "loser" };
      } else {
        // Consolidation round: two losers-bracket survivors meet.
        s1 = { kind: "match", key: `L${r - 1}-${2 * i - 1}`, out: "winner" };
        s2 = { kind: "match", key: `L${r - 1}-${2 * i}`, out: "winner" };
      }
      add({ key: `L${r}-${i}`, bracket: "losers", origRound: r, s1, s2 });
    }
  }

  add({
    key: "GF",
    bracket: "grand_final",
    origRound: 1,
    s1: { kind: "match", key: `W${k}-1`, out: "winner" },
    s2: { kind: "match", key: `L${lbRounds}-1`, out: "winner" },
  });

  // ---- 2. Liveness: which matches/outputs ever carry a real team ----
  const seedLive = (idx: number) => idx < count;
  const liveInputs = new Map<string, number>();
  const outputLive = (key: string, out: "winner" | "loser"): boolean => {
    const li = liveInputs.get(key) ?? 0;
    return out === "winner" ? li >= 1 : li === 2;
  };
  const slotLive = (s: SlotSource): boolean =>
    s.kind === "seed" ? seedLive(s.index) : outputLive(s.key, s.out);
  for (const key of order) {
    const n = nodes.get(key)!;
    liveInputs.set(key, (slotLive(n.s1) ? 1 : 0) + (slotLive(n.s2) ? 1 : 0));
  }
  const kept = (key: string) => liveInputs.get(key) === 2;

  // ---- 3. Resolve each slot to its real source (collapsing BYE chains) ----
  const passthrough = new Map<string, Resolved>();
  const resolveSlot = (s: SlotSource): Resolved => {
    if (s.kind === "seed") {
      return seedLive(s.index) ? { participantId: sorted[s.index].id } : null;
    }
    if (s.out === "loser") {
      return kept(s.key) ? { matchKey: s.key, out: "loser" } : null;
    }
    if (kept(s.key)) return { matchKey: s.key, out: "winner" };
    return resolveWinnerPassthrough(s.key);
  };
  const resolveWinnerPassthrough = (key: string): Resolved => {
    const cached = passthrough.get(key);
    if (cached !== undefined) return cached;
    const n = nodes.get(key)!;
    let res: Resolved = null;
    if ((liveInputs.get(key) ?? 0) === 1) {
      res = slotLive(n.s1) ? resolveSlot(n.s1) : resolveSlot(n.s2);
    }
    passthrough.set(key, res);
    return res;
  };

  // ---- 4. Emit kept matches with pre-filled teams + re-routed links ----
  interface Fwd {
    nextKey?: string;
    nextSlot?: number;
    nextLoserKey?: string;
    nextLoserSlot?: number;
  }
  const fwd = new Map<string, Fwd>();
  const ensureFwd = (key: string): Fwd => {
    let f = fwd.get(key);
    if (!f) {
      f = {};
      fwd.set(key, f);
    }
    return f;
  };
  const preFill = new Map<string, { p1?: string; p2?: string }>();

  for (const key of order) {
    if (!kept(key)) continue;
    const n = nodes.get(key)!;
    const slots: [number, SlotSource][] = [
      [1, n.s1],
      [2, n.s2],
    ];
    for (const [slotNo, src] of slots) {
      const r = resolveSlot(src);
      if (!r) continue;
      if ("participantId" in r) {
        const pf = preFill.get(key) ?? {};
        if (slotNo === 1) pf.p1 = r.participantId;
        else pf.p2 = r.participantId;
        preFill.set(key, pf);
      } else {
        const f = ensureFwd(r.matchKey);
        if (r.out === "winner") {
          f.nextKey = key;
          f.nextSlot = slotNo;
        } else {
          f.nextLoserKey = key;
          f.nextLoserSlot = slotNo;
        }
      }
    }
  }

  // ---- 5. Round numbering (kept rounds only; GF last, LB final second-last) ----
  const keptKeys = order.filter(kept);
  const wbMax = k;
  const lbMax = lbRounds;
  const roundName = (b: DEBracket, r: number): string => {
    if (b === "grand_final") return "Grand Final";
    if (b === "winners")
      return r === wbMax ? "Winners Final" : `Winners Round ${r}`;
    return r === lbMax ? "Losers Final" : `Losers Round ${r}`;
  };

  const usedRounds: { bracket: DEBracket; origRound: number }[] = [];
  const seenRound = new Set<string>();
  for (const key of keptKeys) {
    const n = nodes.get(key)!;
    const rk = `${n.bracket}#${n.origRound}`;
    if (!seenRound.has(rk)) {
      seenRound.add(rk);
      usedRounds.push({ bracket: n.bracket, origRound: n.origRound });
    }
  }

  const numberOf = new Map<string, number>();
  const rounds: DERound[] = usedRounds.map((ur, idx) => {
    numberOf.set(`${ur.bracket}#${ur.origRound}`, idx + 1);
    return {
      bracket: ur.bracket,
      number: idx + 1,
      name: roundName(ur.bracket, ur.origRound),
      groupName: ur.bracket,
    };
  });

  const idxInRound = new Map<string, number>();
  const matches: DEMatch[] = keptKeys.map((key) => {
    const n = nodes.get(key)!;
    const rk = `${n.bracket}#${n.origRound}`;
    const mi = (idxInRound.get(rk) ?? 0) + 1;
    idxInRound.set(rk, mi);
    const f = fwd.get(key) ?? {};
    const pf = preFill.get(key) ?? {};
    return {
      key,
      bracket: n.bracket,
      roundNumber: numberOf.get(rk)!,
      roundName: roundName(n.bracket, n.origRound),
      groupName: n.bracket,
      matchNumber: mi,
      participant1Id: pf.p1 ?? null,
      participant2Id: pf.p2 ?? null,
      winnerId: null,
      status: "pending",
      nextKey: f.nextKey ?? null,
      nextSlot: f.nextSlot ?? null,
      nextLoserKey: f.nextLoserKey ?? null,
      nextLoserSlot: f.nextLoserSlot ?? null,
    };
  });

  return { rounds, matches };
}

export async function generateDoubleElimination(
  stageId: string,
  participants: Participant[],
) {
  const supabase = await createClient();
  const { rounds, matches } = buildDoubleElimination(participants);

  const { data: stage } = await supabase
    .from("stages")
    .select("tournament_id")
    .eq("id", stageId)
    .single();
  if (!stage) throw new Error("Stage not found");

  await supabase.from("matches").delete().eq("stage_id", stageId);
  await supabase.from("rounds").delete().eq("stage_id", stageId);

  // 1. Insert rounds
  const numberToRoundId = new Map<number, string>();
  for (const r of rounds) {
    const { data, error } = await supabase
      .from("rounds")
      .insert({
        stage_id: stageId,
        number: r.number,
        name: r.name,
        group_name: r.groupName,
      })
      .select()
      .single();
    if (error) throw error;
    numberToRoundId.set(r.number, data.id);
  }

  // 2. Insert matches (without links yet) and map key -> uuid
  const keyToId = new Map<string, string>();
  for (const m of matches) {
    const { data, error } = await supabase
      .from("matches")
      .insert({
        stage_id: stageId,
        round_id: numberToRoundId.get(m.roundNumber),
        match_number: m.matchNumber,
        participant1_id: m.participant1Id,
        participant2_id: m.participant2Id,
        winner_id: m.winnerId,
        status: m.status,
      })
      .select()
      .single();
    if (error) throw error;
    keyToId.set(m.key, data.id);
  }

  // 3. Resolve and persist the winner / loser links
  for (const m of matches) {
    const update: {
      next_match_id?: string;
      next_match_slot?: number;
      next_loser_match_id?: string;
      next_loser_match_slot?: number;
    } = {};
    if (m.nextKey) {
      update.next_match_id = keyToId.get(m.nextKey);
      update.next_match_slot = m.nextSlot ?? undefined;
    }
    if (m.nextLoserKey) {
      update.next_loser_match_id = keyToId.get(m.nextLoserKey);
      update.next_loser_match_slot = m.nextLoserSlot ?? undefined;
    }
    if (Object.keys(update).length > 0) {
      await supabase
        .from("matches")
        .update(update)
        .eq("id", keyToId.get(m.key));
    }
  }

  return { success: true };
}
