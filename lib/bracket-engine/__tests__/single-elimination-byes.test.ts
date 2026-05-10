import { describe, it, expect, vi } from "vitest";
import { generateSingleElimination } from "../single-elimination";

// Mock Supabase
const mockUpdate = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: mockEq,
    single: vi.fn().mockResolvedValue({
      data: { tournament_id: "test-tour-id" },
      error: null,
    }),
    delete: vi.fn().mockReturnThis(),
    insert: vi.fn().mockImplementation(() => {
      // Return a mocked object with an ID for match linking
      return {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: `match-${Math.random()}` },
          error: null,
        }),
      };
    }),
    update: mockUpdate,
  })),
}));

describe("Single Elimination BYE Handling", () => {
  it("should automatically advance a player if they have no opponent (BYE)", async () => {
    const participants = [
      { id: "1", name: "P1", seed: 1 },
      { id: "2", name: "P2", seed: 2 },
      { id: "3", name: "P3", seed: 3 },
    ];

    // We have 3 players. Round 1 should have 2 matches (one with 2 players, one with 1 player = BYE)
    // Actually, for 3 players, rounds = ceil(log2(3)) = 2.
    // Total slots = 2^2 = 4.
    // Round 1 will have 2 matches.
    // P1 vs P2 (Match 1)
    // P3 vs null (Match 2) -> BYE

    const result = await generateSingleElimination("stage-id", participants);
    expect(result.success).toBe(true);

    // Verify that update was called with winner_id for the BYE match
    // One of the updates should contain winner_id and status: completed
    const byeUpdate = mockUpdate.mock.calls.find(
      (call) => call[0].winner_id === "3" && call[0].status === "completed",
    );
    expect(byeUpdate).toBeDefined();
  });
});
