import { describe, it, expect, vi } from "vitest";
import {
  buildDoubleElimination,
  generateDoubleElimination,
  type DEMatch,
} from "../double-elimination";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { tournament_id: "t", id: "row" },
      error: null,
    }),
    delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
  })),
}));

function makeParticipants(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Team ${i + 1}`,
    seed: i + 1,
  }));
}

// For every kept match, each of its two slots must be filled exactly once —
// either by a pre-seeded participant or by exactly one incoming link.
function slotCoverage(matches: DEMatch[]) {
  const byKey = new Map(matches.map((m) => [m.key, m]));
  const fills = new Map<string, [number, number]>();
  for (const m of matches) fills.set(m.key, [0, 0]);
  const bump = (key: string, slot: number) => {
    const f = fills.get(key);
    if (f) f[slot - 1] += 1;
  };
  for (const m of matches) {
    if (m.participant1Id) bump(m.key, 1);
    if (m.participant2Id) bump(m.key, 2);
    if (m.nextKey) {
      expect(byKey.has(m.nextKey)).toBe(true);
      expect([1, 2]).toContain(m.nextSlot);
      bump(m.nextKey, m.nextSlot!);
    }
    if (m.nextLoserKey) {
      expect(byKey.has(m.nextLoserKey)).toBe(true);
      expect([1, 2]).toContain(m.nextLoserSlot);
      bump(m.nextLoserKey, m.nextLoserSlot!);
    }
  }
  return fills;
}

describe("buildDoubleElimination", () => {
  it("throws with fewer than 2 participants", () => {
    expect(() => buildDoubleElimination(makeParticipants(1))).toThrow(
      "Need at least 2 participants",
    );
  });

  it("makes a single grand final for 2 participants", () => {
    const { matches, rounds } = buildDoubleElimination(makeParticipants(2));
    expect(matches).toHaveLength(1);
    expect(rounds).toHaveLength(1);
    expect(matches[0].groupName).toBe("grand_final");
    expect(matches[0].participant1Id).toBe("p1");
    expect(matches[0].participant2Id).toBe("p2");
  });

  it.each([
    [4, 6],
    [8, 14],
    [16, 30],
  ])(
    "for %i (power of 2) participants produces 2N-2 = %i matches",
    (n, total) => {
      const { matches } = buildDoubleElimination(makeParticipants(n));
      expect(matches).toHaveLength(total);
      // winners = N-1, losers = N-2, grand final = 1
      const wb = matches.filter((m) => m.groupName === "winners").length;
      const lb = matches.filter((m) => m.groupName === "losers").length;
      const gf = matches.filter((m) => m.groupName === "grand_final").length;
      expect(wb).toBe(n - 1);
      expect(lb).toBe(n - 2);
      expect(gf).toBe(1);
    },
  );

  it.each([2, 3, 4, 5, 6, 7, 8, 11, 16])(
    "wires every slot exactly once and links to real matches (%i players)",
    (n) => {
      const { matches } = buildDoubleElimination(makeParticipants(n));
      const fills = slotCoverage(matches);
      for (const [, [a, b]] of fills) {
        expect(a).toBe(1);
        expect(b).toBe(1);
      }
    },
  );

  it.each([4, 8, 16])(
    "every winners match drops its loser; losers/GF do not (no byes, %i)",
    (n) => {
      const { matches } = buildDoubleElimination(makeParticipants(n));
      for (const m of matches) {
        if (m.groupName === "winners") {
          expect(m.nextLoserKey).not.toBeNull();
        } else {
          expect(m.nextLoserKey).toBeNull();
        }
      }
    },
  );

  it.each([4, 8, 16])(
    "every match except the grand final advances its winner (%i)",
    (n) => {
      const { matches } = buildDoubleElimination(makeParticipants(n));
      for (const m of matches) {
        if (m.groupName === "grand_final") {
          expect(m.nextKey).toBeNull();
        } else {
          expect(m.nextKey).not.toBeNull();
        }
      }
    },
  );

  it("collapses a 3-player field to 4 real matches", () => {
    const { matches } = buildDoubleElimination(makeParticipants(3));
    // WB(1v2), Winners Final, Losers Final, Grand Final
    expect(matches).toHaveLength(4);
    slotCoverage(matches); // also asserts wiring
    expect(matches.some((m) => m.groupName === "grand_final")).toBe(true);
  });

  it.each([2, 3, 4, 5, 8, 16])(
    "puts the grand final at the highest round number (%i)",
    (n) => {
      const { rounds } = buildDoubleElimination(makeParticipants(n));
      const gf = rounds.find((r) => r.groupName === "grand_final")!;
      const maxNumber = Math.max(...rounds.map((r) => r.number));
      expect(gf.number).toBe(maxNumber);
      // round numbers are unique and contiguous from 1
      const nums = rounds.map((r) => r.number).sort((a, b) => a - b);
      expect(nums).toEqual(nums.map((_, i) => i + 1));
    },
  );

  it("only references participant ids that were provided", () => {
    const parts = makeParticipants(6);
    const ids = new Set(parts.map((p) => p.id));
    const { matches } = buildDoubleElimination(parts);
    for (const m of matches) {
      if (m.participant1Id) expect(ids.has(m.participant1Id)).toBe(true);
      if (m.participant2Id) expect(ids.has(m.participant2Id)).toBe(true);
    }
  });
});

describe("generateDoubleElimination (DB wrapper)", () => {
  it("throws on fewer than 2 participants", async () => {
    await expect(
      generateDoubleElimination("stage", makeParticipants(1)),
    ).rejects.toThrow("Need at least 2 participants");
  });

  it("completes for a valid field", async () => {
    await expect(
      generateDoubleElimination("stage", makeParticipants(8)),
    ).resolves.toEqual({ success: true });
  });
});
