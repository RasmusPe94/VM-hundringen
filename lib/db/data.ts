import { randomUUID } from "crypto";
import { getDb } from "./client";
import { money, toNumber } from "@/lib/format";

export type BetStatus = "pending" | "won" | "lost" | "void";

export type PlayerRecord = {
  id: string;
  name: string;
  created_at: string;
};

export type MatchRecord = {
  id: string;
  match_no: number;
  starts_at: string | null;
  home_team: string;
  away_team: string;
  phase: string | null;
  created_at: string;
};

export type BetRecord = {
  id: string;
  player_id: string;
  match_id: string | null;
  match_label: string | null;
  description: string;
  odds: number;
  stake: number;
  status: BetStatus;
  payout: number | null;
  settled_at: string | null;
  created_at: string;
};

export type BetWithRelations = BetRecord & {
  profiles: { id: string; display_name: string } | null;
  matches: {
    id: string;
    match_no: number;
    starts_at: string | null;
    home_team: string;
    away_team: string;
    phase: string | null;
  } | null;
};

export type LeaderboardRow = {
  rank: number;
  player_id: string;
  display_name: string;
  total_staked: number;
  current_balance: number;
  pending_stake: number;
  potential_payout: number;
  balance_including_possible_payout: number;
  roi: number;
  bet_count: number;
  won_bet_count: number;
};

export type MatchPayload = {
  match_no: number;
  starts_at?: string;
  home_team: string;
  away_team: string;
  phase?: string;
};

export type BetPayload = {
  description: string;
  match_id?: string;
  match_label?: string;
  odds: number;
  stake: number;
};

const STARTING_BANKROLL = 100;

// Players

export function listPlayers(): PlayerRecord[] {
  return getDb().prepare("SELECT * FROM players ORDER BY name").all() as PlayerRecord[];
}

export function createPlayer(name: string): PlayerRecord {
  const id = randomUUID();
  try {
    getDb().prepare("INSERT INTO players (id, name) VALUES (?, ?)").run(id, name);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE constraint failed")) {
      throw new Error(`Namnet "${name}" är redan taget – välj dig i listan ovan.`);
    }
    throw e;
  }
  return getDb().prepare("SELECT * FROM players WHERE id = ?").get(id) as PlayerRecord;
}

export function updatePlayer(id: string, name: string): void {
  getDb().prepare("UPDATE players SET name = ? WHERE id = ?").run(name, id);
}

export function deletePlayer(id: string): void {
  getDb().prepare("DELETE FROM players WHERE id = ?").run(id);
}

// Matches

export function listMatches(): MatchRecord[] {
  return getDb().prepare("SELECT * FROM matches ORDER BY match_no").all() as MatchRecord[];
}

export function createMatch(payload: MatchPayload): MatchRecord {
  const id = randomUUID();
  getDb()
    .prepare("INSERT INTO matches (id, match_no, starts_at, home_team, away_team, phase) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, payload.match_no, payload.starts_at ?? null, payload.home_team, payload.away_team, payload.phase ?? null);
  return getDb().prepare("SELECT * FROM matches WHERE id = ?").get(id) as MatchRecord;
}

export function updateMatch(id: string, payload: MatchPayload): void {
  getDb()
    .prepare("UPDATE matches SET match_no=?, starts_at=?, home_team=?, away_team=?, phase=? WHERE id=?")
    .run(payload.match_no, payload.starts_at ?? null, payload.home_team, payload.away_team, payload.phase ?? null, id);
}

export function deleteMatch(id: string): void {
  getDb().prepare("DELETE FROM matches WHERE id = ?").run(id);
}

// Bets

function rowToBetWithRelations(row: Record<string, unknown>): BetWithRelations {
  return {
    id: row.id as string,
    player_id: row.player_id as string,
    match_id: (row.match_id as string | null) ?? null,
    match_label: (row.match_label as string | null) ?? null,
    description: row.description as string,
    odds: row.odds as number,
    stake: row.stake as number,
    status: row.status as BetStatus,
    payout: (row.payout as number | null) ?? null,
    settled_at: (row.settled_at as string | null) ?? null,
    created_at: row.created_at as string,
    profiles: row.player_name ? { id: row.player_id as string, display_name: row.player_name as string } : null,
    matches: row.match_no
      ? {
          id: row.match_id as string,
          match_no: row.match_no as number,
          starts_at: (row.starts_at as string | null) ?? null,
          home_team: row.home_team as string,
          away_team: row.away_team as string,
          phase: (row.phase as string | null) ?? null
        }
      : null
  };
}

const BET_JOIN_SQL = `
  SELECT b.*,
    p.name AS player_name,
    m.match_no, m.starts_at, m.home_team, m.away_team, m.phase
  FROM bets b
  LEFT JOIN players p ON p.id = b.player_id
  LEFT JOIN matches m ON m.id = b.match_id
`;

export function listBets(): BetWithRelations[] {
  const rows = getDb().prepare(BET_JOIN_SQL + " ORDER BY b.created_at DESC").all() as Record<string, unknown>[];
  return rows.map(rowToBetWithRelations);
}

export function listMyBets(playerId: string): BetWithRelations[] {
  const rows = getDb().prepare(BET_JOIN_SQL + " WHERE b.player_id = ? ORDER BY b.created_at DESC").all(playerId) as Record<string, unknown>[];
  return rows.map(rowToBetWithRelations);
}

export function listPendingBets(): BetWithRelations[] {
  const rows = getDb().prepare(BET_JOIN_SQL + " WHERE b.status = 'pending' ORDER BY b.created_at").all() as Record<string, unknown>[];
  return rows.map(rowToBetWithRelations);
}

export function getPendingOwnBet(id: string, playerId: string): BetRecord | null {
  return (getDb()
    .prepare("SELECT * FROM bets WHERE id = ? AND player_id = ? AND status = 'pending'")
    .get(id, playerId) as BetRecord | undefined) ?? null;
}

export function getOwnBet(id: string, playerId: string): BetRecord | null {
  return (getDb()
    .prepare("SELECT * FROM bets WHERE id = ? AND player_id = ?")
    .get(id, playerId) as BetRecord | undefined) ?? null;
}

export function getPendingBet(id: string): BetRecord | null {
  return (getDb()
    .prepare("SELECT * FROM bets WHERE id = ? AND status = 'pending'")
    .get(id) as BetRecord | undefined) ?? null;
}

export function getBet(id: string): BetRecord | null {
  return (getDb()
    .prepare("SELECT * FROM bets WHERE id = ?")
    .get(id) as BetRecord | undefined) ?? null;
}

export function createBet(playerId: string, payload: BetPayload): BetRecord {
  const id = randomUUID();
  getDb()
    .prepare("INSERT INTO bets (id, player_id, match_id, match_label, description, odds, stake, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')")
    .run(id, playerId, payload.match_id ?? null, payload.match_label ?? null, payload.description, payload.odds, payload.stake);
  return getDb().prepare("SELECT * FROM bets WHERE id = ?").get(id) as BetRecord;
}

export function updateOwnPendingBet(id: string, payload: BetPayload): void {
  getDb()
    .prepare("UPDATE bets SET match_id=?, match_label=?, description=?, odds=?, stake=?, updated_at=datetime('now') WHERE id=?")
    .run(payload.match_id ?? null, payload.match_label ?? null, payload.description, payload.odds, payload.stake, id);
}

// Updates any bet regardless of status (used for editing settled bets too)
export function updateAnyBet(id: string, payload: BetPayload): void {
  getDb()
    .prepare("UPDATE bets SET match_id=?, match_label=?, description=?, odds=?, stake=?, updated_at=datetime('now') WHERE id=?")
    .run(payload.match_id ?? null, payload.match_label ?? null, payload.description, payload.odds, payload.stake, id);
}

export function updateAnyPendingBet(id: string, payload: BetPayload): void {
  updateAnyBet(id, payload);
}

export function deleteBet(id: string): void {
  getDb().prepare("DELETE FROM bets WHERE id = ?").run(id);
}

export function settleBet(id: string, status: Exclude<BetStatus, "pending">, payout: number): void {
  getDb()
    .prepare("UPDATE bets SET status=?, payout=?, settled_at=datetime('now'), updated_at=datetime('now') WHERE id=?")
    .run(status, payout, id);
}

// Competition settings

export function getCompetitionSettings() {
  return getDb().prepare("SELECT * FROM competition_settings WHERE id = 'default'").get() as { id: string; locked: number } | undefined;
}

export function setCompetitionLocked(locked: boolean): void {
  getDb().prepare("UPDATE competition_settings SET locked = ? WHERE id = 'default'").run(locked ? 1 : 0);
}

// Leaderboard

export function getLeaderboardRows(): LeaderboardRow[] {
  const players = listPlayers();
  const bets = getDb().prepare("SELECT * FROM bets").all() as BetRecord[];

  return players
    .map((player) => {
      const playerBets = bets.filter((b) => b.player_id === player.id);
      const totalStaked = money(playerBets.reduce((s, b) => s + b.stake, 0));
      const pendingBets = playerBets.filter((b) => b.status === "pending");
      const pendingStake = money(pendingBets.reduce((s, b) => s + b.stake, 0));
      const potentialPayout = money(pendingBets.reduce((s, b) => s + b.stake * b.odds, 0));
      const settledBets = playerBets.filter((b) => b.status !== "pending");
      const settledStake = money(settledBets.reduce((s, b) => s + b.stake, 0));
      const settledPayout = money(settledBets.reduce((s, b) => s + toNumber(b.payout), 0));
      const currentBalance = money(STARTING_BANKROLL - totalStaked + settledPayout);
      const balanceIncludingPossiblePayout = money(currentBalance + potentialPayout);

      return {
        balance_including_possible_payout: balanceIncludingPossiblePayout,
        bet_count: playerBets.length,
        current_balance: currentBalance,
        display_name: player.name,
        pending_stake: pendingStake,
        player_id: player.id,
        potential_payout: potentialPayout,
        rank: 0,
        roi: settledStake > 0 ? money(settledPayout / settledStake) : 0,
        total_staked: totalStaked,
        won_bet_count: playerBets.filter((b) => b.status === "won").length
      };
    })
    .sort((a, b) => {
      if (b.current_balance !== a.current_balance) return b.current_balance - a.current_balance;
      if (b.balance_including_possible_payout !== a.balance_including_possible_payout)
        return b.balance_including_possible_payout - a.balance_including_possible_payout;
      return a.display_name.localeCompare(b.display_name, "sv");
    })
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function getCurrentBalance(playerId: string): number {
  const rows = getLeaderboardRows();
  return rows.find((r) => r.player_id === playerId)?.current_balance ?? 0;
}
