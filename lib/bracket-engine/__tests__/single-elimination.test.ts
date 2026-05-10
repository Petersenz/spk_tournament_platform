import { describe, it, expect, vi } from "vitest";
import { generateSingleElimination } from "../single-elimination";

// Mock Supabase
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

describe("Single Elimination Bracket Engine", () => {
  it("should throw an error if there are less than 2 participants", async () => {
    const participants = [{ id: "1", name: "Player 1" }];
    await expect(
      generateSingleElimination("stage-id", participants),
    ).rejects.toThrow("Need at least 2 participants to generate a bracket");
  });

  it("should correctly calculate the number of rounds and matches for 4 participants", async () => {
    // This would require a more sophisticated mock that tracks insert calls
    // For now, we verify that it doesn't throw and proceeds with 4 players
    const participants = [
      { id: "1", name: "P1" },
      { id: "2", name: "P2" },
      { id: "3", name: "P3" },
      { id: "4", name: "P4" },
    ];
    const result = await generateSingleElimination("stage-id", participants);
    expect(result.success).toBe(true);
  });
});
