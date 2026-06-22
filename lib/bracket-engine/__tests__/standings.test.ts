import { describe, it, expect } from "vitest";
import { computeStandings, type StandingMatch } from "../standings";

function match(partial: Partial<StandingMatch>): StandingMatch {
  return {
    status: "pending",
    participant1_id: null,
    participant2_id: null,
    winner_id: null,
    score_participant1: null,
    score_participant2: null,
    ...partial,
  };
}

describe("computeStandings", () => {
  it("returns an empty table when there are no matches", () => {
    expect(computeStandings([])).toEqual([]);
  });

  it("lists participants from fixtures even before any match is completed", () => {
    const rows = computeStandings([
      match({
        status: "pending",
        participant1_id: "a",
        participant2_id: "b",
        p1: { name: "Alpha" },
        p2: { name: "Bravo" },
      }),
    ]);
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.played).toBe(0);
      expect(row.points).toBe(0);
    }
  });

  it("awards 3 points for a win and 0 for a loss", () => {
    const rows = computeStandings([
      match({
        status: "completed",
        participant1_id: "a",
        participant2_id: "b",
        winner_id: "a",
        score_participant1: 2,
        score_participant2: 0,
        p1: { name: "Alpha" },
        p2: { name: "Bravo" },
      }),
    ]);
    const a = rows.find((r) => r.id === "a")!;
    const b = rows.find((r) => r.id === "b")!;
    expect(a).toMatchObject({
      played: 1,
      won: 1,
      lost: 0,
      drawn: 0,
      scored: 2,
      conceded: 0,
      diff: 2,
      points: 3,
    });
    expect(b).toMatchObject({
      played: 1,
      won: 0,
      lost: 1,
      scored: 0,
      conceded: 2,
      diff: -2,
      points: 0,
    });
    // Winner ranks above loser.
    expect(rows[0].id).toBe("a");
  });

  it("awards 1 point each for a completed match with no winner (draw)", () => {
    const rows = computeStandings([
      match({
        status: "completed",
        participant1_id: "a",
        participant2_id: "b",
        winner_id: null,
        score_participant1: 1,
        score_participant2: 1,
        p1: { name: "Alpha" },
        p2: { name: "Bravo" },
      }),
    ]);
    for (const row of rows) {
      expect(row).toMatchObject({ played: 1, drawn: 1, points: 1, diff: 0 });
    }
  });

  it("ignores pending matches but still counts the participants", () => {
    const rows = computeStandings([
      match({
        status: "pending",
        participant1_id: "a",
        participant2_id: "b",
        score_participant1: 5,
        score_participant2: 5,
        p1: { name: "Alpha" },
        p2: { name: "Bravo" },
      }),
    ]);
    for (const row of rows) {
      expect(row.played).toBe(0);
      expect(row.scored).toBe(0);
    }
  });

  it("skips BYE fixtures (a missing participant)", () => {
    const rows = computeStandings([
      match({
        status: "completed",
        participant1_id: "a",
        participant2_id: null,
        winner_id: "a",
        p1: { name: "Alpha" },
      }),
    ]);
    expect(rows).toEqual([]);
  });

  it("ranks by points, then goal difference, then scored", () => {
    // 3-team mini league:
    // A beats B 3-0, A beats C 1-0  -> 6 pts, diff +4
    // B beats C 5-0                 -> 3 pts, diff (-3 +5) = +2
    // C loses both                  -> 0 pts, diff -6
    const rows = computeStandings([
      match({
        status: "completed",
        participant1_id: "a",
        participant2_id: "b",
        winner_id: "a",
        score_participant1: 3,
        score_participant2: 0,
        p1: { name: "Alpha" },
        p2: { name: "Bravo" },
      }),
      match({
        status: "completed",
        participant1_id: "a",
        participant2_id: "c",
        winner_id: "a",
        score_participant1: 1,
        score_participant2: 0,
        p1: { name: "Alpha" },
        p2: { name: "Charlie" },
      }),
      match({
        status: "completed",
        participant1_id: "b",
        participant2_id: "c",
        winner_id: "b",
        score_participant1: 5,
        score_participant2: 0,
        p1: { name: "Bravo" },
        p2: { name: "Charlie" },
      }),
    ]);

    expect(rows.map((r) => r.id)).toEqual(["a", "b", "c"]);
    expect(rows[0]).toMatchObject({ points: 6, diff: 4 });
    expect(rows[1]).toMatchObject({ points: 3, diff: 2 });
    expect(rows[2]).toMatchObject({ points: 0, diff: -6 });
  });

  it("honours a custom points configuration", () => {
    const matches = [
      match({
        status: "completed",
        participant1_id: "a",
        participant2_id: "b",
        winner_id: "a",
        score_participant1: 1,
        score_participant2: 0,
        p1: { name: "Alpha" },
        p2: { name: "Bravo" },
      }),
      match({
        status: "completed",
        participant1_id: "a",
        participant2_id: "c",
        winner_id: null,
        score_participant1: 2,
        score_participant2: 2,
        p1: { name: "Alpha" },
        p2: { name: "Charlie" },
      }),
    ];
    // win = 2, draw = 1, loss = 0
    const rows = computeStandings(matches, { win: 2, draw: 1, loss: 0 });
    const a = rows.find((r) => r.id === "a")!;
    const b = rows.find((r) => r.id === "b")!;
    const c = rows.find((r) => r.id === "c")!;
    expect(a.points).toBe(3); // one win (2) + one draw (1)
    expect(b.points).toBe(0); // loss
    expect(c.points).toBe(1); // draw
  });

  it("defaults to 3/1/0 when no points config is given", () => {
    const rows = computeStandings([
      match({
        status: "completed",
        participant1_id: "a",
        participant2_id: "b",
        winner_id: "a",
        score_participant1: 1,
        score_participant2: 0,
        p1: { name: "Alpha" },
        p2: { name: "Bravo" },
      }),
    ]);
    expect(rows.find((r) => r.id === "a")!.points).toBe(3);
  });

  it("breaks equal points and difference by name", () => {
    // Two separate 1-0 wins: both winners have 3 pts and +1 diff.
    const rows = computeStandings([
      match({
        status: "completed",
        participant1_id: "zeta",
        participant2_id: "loser1",
        winner_id: "zeta",
        score_participant1: 1,
        score_participant2: 0,
        p1: { name: "Zeta" },
        p2: { name: "Loser One" },
      }),
      match({
        status: "completed",
        participant1_id: "alpha",
        participant2_id: "loser2",
        winner_id: "alpha",
        score_participant1: 1,
        score_participant2: 0,
        p1: { name: "Alpha" },
        p2: { name: "Loser Two" },
      }),
    ]);
    const winners = rows.filter((r) => r.points === 3).map((r) => r.name);
    expect(winners).toEqual(["Alpha", "Zeta"]);
  });
});
