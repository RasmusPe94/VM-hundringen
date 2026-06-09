import {
  createRecord,
  deleteRecord,
  filterValue,
  getAllRecords,
  listRecords,
  pbFetch,
  updateRecord
} from "@/lib/pocketbase/client";
import { money, toNumber } from "@/lib/format";

export type Role = "player" | "admin";
export type BetStatus = "pending" | "won" | "lost" | "void";

export type UserRecord = {
  id: string;
  username: string;
  display_name: string;
  role: Role;
  starting_bankroll: number | string;
  created: string;
  updated: string;
};

export type MatchRecord = {
  id: string;
  match_no: number;
  starts_at?: string;
  home_team: string;
  away_team: string;
  phase?: string;
  created: string;
  updated: string;
};

export type BetRecord = {
  id: string;
  user_id: string;
  match_id?: string;
  match_label?: string;
  description: string;
  odds: number | string;
  stake: number | string;
  status: BetStatus;
  payout?: number | string;
  settled_at?: string;
  settled_by?: string;
  created: string;
  updated: string;
  expand?: {
    match_id?: MatchRecord;
    user_id?: UserRecord;
  };
};

export type CompetitionSettingsRecord = {
  id: string;
  locked: boolean;
  updated_by?: string;
  created: string;
  updated: string;
};

export type LeaderboardRow = {
  rank: number;
  user_id: string;
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

export type BetWithRelations = {
  id: string;
  user_id: string;
  match_id: string | null;
  match_label: string | null;
  description: string;
  odds: number | string;
  stake: number | string;
  status: BetStatus;
  payout: number | string | null;
  created_at: string;
  settled_at: string | null;
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

export type MatchPayload = {
  away_team: string;
  home_team: string;
  match_no: number;
  phase?: string;
  starts_at?: string;
};

export type BetPayload = {
  description: string;
  match_id?: string;
  match_label?: string;
  odds: number;
  stake: number;
};

function nullable(value: string | null | undefined) {
  return value ? value : null;
}

function toPocketBaseDate(value: string | null | undefined) {
  return value ? new Date(value).toISOString() : "";
}

function fromMatch(record: MatchRecord) {
  return {
    id: record.id,
    match_no: record.match_no,
    starts_at: nullable(record.starts_at),
    home_team: record.home_team,
    away_team: record.away_team,
    phase: nullable(record.phase)
  };
}

function fromBet(record: BetRecord): BetWithRelations {
  const user = record.expand?.user_id;
  const match = record.expand?.match_id;

  return {
    id: record.id,
    user_id: record.user_id,
    match_id: nullable(record.match_id),
    match_label: nullable(record.match_label),
    description: record.description,
    odds: record.odds,
    stake: record.stake,
    status: record.status,
    payout: record.payout ?? null,
    created_at: record.created,
    settled_at: nullable(record.settled_at),
    profiles: user
      ? {
          id: user.id,
          display_name: user.display_name || user.username
        }
      : null,
    matches: match
      ? {
          ...fromMatch(match)
        }
      : null
  };
}

export async function authWithUsername(username: string, password: string) {
  return pbFetch<{ record: UserRecord; token: string }>(
    "/api/collections/users/auth-with-password",
    {
      body: {
        identity: username,
        password
      },
      method: "POST",
      token: null
    }
  );
}

export async function refreshUserAuth(token: string) {
  return pbFetch<{ record: UserRecord; token: string }>(
    "/api/collections/users/auth-refresh",
    {
      method: "POST",
      token
    }
  );
}

export async function listUsers() {
  return getAllRecords<UserRecord>("users", {
    sort: "display_name,username"
  });
}

export async function listMatches() {
  return getAllRecords<MatchRecord>("matches", {
    sort: "match_no"
  });
}

export async function listBets() {
  const records = await getAllRecords<BetRecord>("bets", {
    expand: "user_id,match_id",
    sort: "-created"
  });

  return records.map(fromBet);
}

export async function listMyBets(userId: string) {
  const records = await getAllRecords<BetRecord>("bets", {
    expand: "match_id",
    filter: `user_id = ${filterValue(userId)}`,
    sort: "-created"
  });

  return records.map(fromBet);
}

export async function listPendingBets() {
  const records = await getAllRecords<BetRecord>("bets", {
    expand: "user_id,match_id",
    filter: "status = \"pending\"",
    sort: "created"
  });

  return records.map(fromBet);
}

export async function getPendingOwnBet(id: string, userId: string) {
  const result = await listRecords<BetRecord>("bets", {
    filter: `id = ${filterValue(id)} && user_id = ${filterValue(
      userId
    )} && status = "pending"`,
    perPage: 1
  });

  return result.items[0] ?? null;
}

export async function getPendingBet(id: string) {
  const result = await listRecords<BetRecord>("bets", {
    filter: `id = ${filterValue(id)} && status = "pending"`,
    perPage: 1
  });

  return result.items[0] ?? null;
}

export async function getCompetitionSettings() {
  const result = await listRecords<CompetitionSettingsRecord>(
    "competition_settings",
    {
      perPage: 1,
      sort: "created"
    }
  );

  return result.items[0] ?? null;
}

export async function setCompetitionLocked(locked: boolean, userId: string) {
  const settings = await getCompetitionSettings();
  const payload = {
    locked,
    updated_by: userId
  };

  if (settings) {
    return updateRecord<CompetitionSettingsRecord>(
      "competition_settings",
      settings.id,
      payload
    );
  }

  return createRecord<CompetitionSettingsRecord>(
    "competition_settings",
    payload
  );
}

export async function getLeaderboardRows() {
  const [users, bets] = await Promise.all([listUsers(), getAllRecords<BetRecord>("bets")]);

  return users
    .map((user) => {
      const userBets = bets.filter((bet) => bet.user_id === user.id);
      const totalStaked = money(
        userBets.reduce((sum, bet) => sum + toNumber(bet.stake), 0)
      );
      const pendingStake = money(
        userBets
          .filter((bet) => bet.status === "pending")
          .reduce((sum, bet) => sum + toNumber(bet.stake), 0)
      );
      const potentialPayout = money(
        userBets
          .filter((bet) => bet.status === "pending")
          .reduce(
            (sum, bet) => sum + toNumber(bet.stake) * toNumber(bet.odds),
            0
          )
      );
      const settledBets = userBets.filter((bet) => bet.status !== "pending");
      const settledStake = money(
        settledBets.reduce((sum, bet) => sum + toNumber(bet.stake), 0)
      );
      const settledPayout = money(
        settledBets.reduce((sum, bet) => sum + toNumber(bet.payout), 0)
      );
      const currentBalance = money(
        toNumber(user.starting_bankroll) - totalStaked + settledPayout
      );
      const balanceIncludingPossiblePayout = money(
        currentBalance + potentialPayout
      );

      return {
        balance_including_possible_payout: balanceIncludingPossiblePayout,
        bet_count: userBets.length,
        current_balance: currentBalance,
        display_name: user.display_name || user.username,
        pending_stake: pendingStake,
        potential_payout: potentialPayout,
        rank: 0,
        roi: settledStake > 0 ? money(settledPayout / settledStake) : 0,
        total_staked: totalStaked,
        user_id: user.id,
        won_bet_count: userBets.filter((bet) => bet.status === "won").length
      };
    })
    .sort((a, b) => {
      if (b.current_balance !== a.current_balance) {
        return b.current_balance - a.current_balance;
      }

      if (
        b.balance_including_possible_payout !==
        a.balance_including_possible_payout
      ) {
        return (
          b.balance_including_possible_payout -
          a.balance_including_possible_payout
        );
      }

      return a.display_name.localeCompare(b.display_name, "sv");
    })
    .map((row, index) => ({
      ...row,
      rank: index + 1
    }));
}

export async function getCurrentBalance(userId: string) {
  const row = (await getLeaderboardRows()).find((item) => item.user_id === userId);
  return row?.current_balance ?? 0;
}

export async function createBet(userId: string, payload: BetPayload) {
  return createRecord<BetRecord>("bets", {
    description: payload.description,
    match_id: payload.match_id ?? "",
    match_label: payload.match_label ?? "",
    odds: payload.odds,
    payout: "",
    settled_at: "",
    settled_by: "",
    stake: payload.stake,
    status: "pending",
    user_id: userId
  });
}

export async function updateOwnPendingBet(id: string, payload: BetPayload) {
  return updateRecord<BetRecord>("bets", id, {
    description: payload.description,
    match_id: payload.match_id ?? "",
    match_label: payload.match_label ?? "",
    odds: payload.odds,
    stake: payload.stake
  });
}

export async function deleteBet(id: string) {
  return deleteRecord("bets", id);
}

export async function createMatch(payload: MatchPayload) {
  return createRecord<MatchRecord>("matches", {
    away_team: payload.away_team,
    home_team: payload.home_team,
    match_no: payload.match_no,
    phase: payload.phase ?? "",
    starts_at: toPocketBaseDate(payload.starts_at)
  });
}

export async function updateMatch(id: string, payload: MatchPayload) {
  return updateRecord<MatchRecord>("matches", id, {
    away_team: payload.away_team,
    home_team: payload.home_team,
    match_no: payload.match_no,
    phase: payload.phase ?? "",
    starts_at: toPocketBaseDate(payload.starts_at)
  });
}

export async function deleteMatch(id: string) {
  return deleteRecord("matches", id);
}

export async function settleBet(
  id: string,
  status: Exclude<BetStatus, "pending">,
  payout: number,
  settledBy: string
) {
  return updateRecord<BetRecord>("bets", id, {
    payout,
    settled_at: new Date().toISOString(),
    settled_by: settledBy,
    status
  });
}
