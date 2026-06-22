/**
 * Pure league-table (standings) computation for round-robin stages.
 * No DB or React dependency — kept pure so it can be unit-tested directly.
 */

export interface StandingMatch {
  status: string;
  participant1_id: string | null;
  participant2_id: string | null;
  winner_id: string | null;
  score_participant1: number | null;
  score_participant2: number | null;
  p1?: { name: string; logo_url?: string | null };
  p2?: { name: string; logo_url?: string | null };
}

export interface LeaguePoints {
  win: number;
  draw: number;
  loss: number;
}

export const DEFAULT_LEAGUE_POINTS: LeaguePoints = { win: 3, draw: 1, loss: 0 };

export interface StandingRow {
  id: string;
  name: string;
  logo_url?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scored: number;
  conceded: number;
  diff: number;
  points: number;
}

/**
 * Build a league table from match results.
 *
 * Points: win = 3, draw = 1, loss = 0. A match counts as a draw when it is
 * completed with no winner recorded. Rows are ranked by points, then score
 * difference, then score scored, then wins, then name. Every participant that
 * appears in a fixture is listed, even before they have played.
 */
export function computeStandings(
  matches: StandingMatch[],
  points: LeaguePoints = DEFAULT_LEAGUE_POINTS,
): StandingRow[] {
  const table = new Map<string, StandingRow>();

  const ensureRow = (
    id: string | null,
    info?: { name: string; logo_url?: string | null },
  ): StandingRow | null => {
    if (!id) return null;
    let row = table.get(id);
    if (!row) {
      row = {
        id,
        name: info?.name ?? "—",
        logo_url: info?.logo_url ?? null,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        scored: 0,
        conceded: 0,
        diff: 0,
        points: 0,
      };
      table.set(id, row);
    } else if (info?.name && row.name === "—") {
      row.name = info.name;
      row.logo_url = info.logo_url ?? row.logo_url;
    }
    return row;
  };

  for (const match of matches) {
    // Skip BYE slots — a fixture needs two real participants to score.
    if (!match.participant1_id || !match.participant2_id) continue;

    const row1 = ensureRow(match.participant1_id, match.p1);
    const row2 = ensureRow(match.participant2_id, match.p2);
    if (!row1 || !row2) continue;

    if (match.status !== "completed") continue;

    const score1 = match.score_participant1 ?? 0;
    const score2 = match.score_participant2 ?? 0;

    row1.played += 1;
    row2.played += 1;
    row1.scored += score1;
    row1.conceded += score2;
    row2.scored += score2;
    row2.conceded += score1;

    if (match.winner_id === match.participant1_id) {
      row1.won += 1;
      row2.lost += 1;
      row1.points += points.win;
      row2.points += points.loss;
    } else if (match.winner_id === match.participant2_id) {
      row2.won += 1;
      row1.lost += 1;
      row2.points += points.win;
      row1.points += points.loss;
    } else {
      // Completed with no winner → draw.
      row1.drawn += 1;
      row2.drawn += 1;
      row1.points += points.draw;
      row2.points += points.draw;
    }
  }

  const rows = Array.from(table.values());
  for (const row of rows) {
    row.diff = row.scored - row.conceded;
  }

  return rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.diff - a.diff ||
      b.scored - a.scored ||
      b.won - a.won ||
      a.name.localeCompare(b.name),
  );
}
