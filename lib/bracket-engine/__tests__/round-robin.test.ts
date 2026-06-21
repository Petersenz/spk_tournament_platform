import { describe, it, expect, vi } from "vitest";
import {
  buildRoundRobinSchedule,
  generateRoundRobin,
  type RoundRobinRound,
} from "../round-robin";

// Mock Supabase (only needed for the DB-backed generateRoundRobin wrapper)
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { tournament_id: "test-tour-id" },
      error: null,
    }),
    delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  })),
}));

function makeParticipants(count: number): { id: string; name: string }[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Team ${i + 1}`,
  }));
}

// Collect a canonical key for an unordered pair of participant ids
function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

function allPairings(rounds: RoundRobinRound[]) {
  return rounds.flatMap((r) => r.pairings);
}

describe("buildRoundRobinSchedule (pure circle method)", () => {
  it("throws when there are fewer than 2 participants", () => {
    expect(() => buildRoundRobinSchedule(makeParticipants(1))).toThrow(
      "Need at least 2 participants to generate a league",
    );
    expect(() => buildRoundRobinSchedule([])).toThrow();
  });

  it("schedules a single match for 2 participants", () => {
    const rounds = buildRoundRobinSchedule(makeParticipants(2));
    expect(rounds).toHaveLength(1);
    expect(allPairings(rounds)).toHaveLength(1);
    expect(rounds[0].pairings[0].participant1.id).toBe("p1");
    expect(rounds[0].pairings[0].participant2.id).toBe("p2");
  });

  it.each([
    [4, 3, 6], // even: n-1 rounds, n(n-1)/2 matches
    [6, 5, 15],
    [8, 7, 28],
  ])(
    "for %i (even) participants -> %i rounds and %i total matches",
    (count, expectedRounds, expectedMatches) => {
      const rounds = buildRoundRobinSchedule(makeParticipants(count));
      expect(rounds).toHaveLength(expectedRounds);
      expect(allPairings(rounds)).toHaveLength(expectedMatches);

      // Every even round must be full (count/2 matches, no BYE).
      for (const r of rounds) {
        expect(r.pairings).toHaveLength(count / 2);
      }
    },
  );

  it.each([
    [3, 3, 3], // odd: n rounds, n(n-1)/2 matches, one BYE per round
    [5, 5, 10],
    [7, 7, 21],
  ])(
    "for %i (odd) participants -> %i rounds and %i total matches (with BYEs)",
    (count, expectedRounds, expectedMatches) => {
      const rounds = buildRoundRobinSchedule(makeParticipants(count));
      expect(rounds).toHaveLength(expectedRounds);
      expect(allPairings(rounds)).toHaveLength(expectedMatches);

      // One participant rests each round, so every round has (count-1)/2 matches.
      for (const r of rounds) {
        expect(r.pairings).toHaveLength((count - 1) / 2);
      }
    },
  );

  it.each([2, 3, 4, 5, 6, 7, 8])(
    "pairs every participant against every other exactly once (%i players)",
    (count) => {
      const rounds = buildRoundRobinSchedule(makeParticipants(count));
      const pairings = allPairings(rounds);

      const seen = new Map<string, number>();
      for (const p of pairings) {
        // No participant is ever scheduled against itself.
        expect(p.participant1.id).not.toBe(p.participant2.id);
        const key = pairKey(p.participant1.id, p.participant2.id);
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }

      // Exactly n(n-1)/2 unique pairs, each appearing once.
      expect(seen.size).toBe((count * (count - 1)) / 2);
      for (const occurrences of seen.values()) {
        expect(occurrences).toBe(1);
      }
    },
  );

  it.each([4, 5, 6, 7])(
    "never schedules a participant twice in the same round (%i players)",
    (count) => {
      const rounds = buildRoundRobinSchedule(makeParticipants(count));
      for (const r of rounds) {
        const idsThisRound = r.pairings.flatMap((p) => [
          p.participant1.id,
          p.participant2.id,
        ]);
        expect(new Set(idsThisRound).size).toBe(idsThisRound.length);
      }
    },
  );

  it("numbers rounds sequentially starting at 1", () => {
    const rounds = buildRoundRobinSchedule(makeParticipants(6));
    expect(rounds.map((r) => r.number)).toEqual([1, 2, 3, 4, 5]);
    expect(rounds.map((r) => r.name)).toEqual([
      "Round 1",
      "Round 2",
      "Round 3",
      "Round 4",
      "Round 5",
    ]);
  });
});

describe("generateRoundRobin (DB wrapper)", () => {
  it("throws on fewer than 2 participants before hitting the database", async () => {
    await expect(
      generateRoundRobin("stage-id", makeParticipants(1)),
    ).rejects.toThrow("Need at least 2 participants to generate a league");
  });

  it("completes for a valid participant set", async () => {
    await expect(
      generateRoundRobin("stage-id", makeParticipants(4)),
    ).resolves.toEqual({ success: true });
  });
});
