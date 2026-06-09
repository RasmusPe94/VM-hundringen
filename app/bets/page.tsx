import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import {
  formatCurrency,
  formatDate,
  formatDecimal,
  formatStatus
} from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getParam } from "@/lib/strings";

type ProfileOption = {
  id: string;
  display_name: string;
};

type MatchRef = {
  match_no: number;
  starts_at: string | null;
  home_team: string;
  away_team: string;
  phase: string | null;
};

type BetRow = {
  id: string;
  user_id: string;
  match_label: string | null;
  description: string;
  odds: number | string;
  stake: number | string;
  status: string;
  payout: number | string | null;
  created_at: string;
  settled_at: string | null;
  profiles: ProfileOption | null;
  matches: MatchRef | null;
};

type BetsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function matchName(bet: BetRow) {
  if (bet.matches) {
    return `#${bet.matches.match_no} ${bet.matches.home_team} - ${bet.matches.away_team}`;
  }

  return bet.match_label ?? "Fritext";
}

export default async function BetsPage({ searchParams }: BetsPageProps) {
  await requireUser();
  const supabase = createSupabaseServerClient();
  const player = getParam(searchParams?.player);
  const status = getParam(searchParams?.status);
  const match = getParam(searchParams?.match).trim().toLowerCase();

  const [profilesResult, betsResult] = await Promise.all([
    supabase.from("profiles").select("id, display_name").order("display_name"),
    supabase
      .from("bets")
      .select(
        "id, user_id, match_label, description, odds, stake, status, payout, created_at, settled_at, profiles!bets_user_id_fkey(display_name, id), matches(match_no, starts_at, home_team, away_team, phase)"
      )
      .order("created_at", { ascending: false })
  ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  if (betsResult.error) {
    throw new Error(betsResult.error.message);
  }

  const profiles = (profilesResult.data ?? []) as ProfileOption[];
  const bets = ((betsResult.data ?? []) as BetRow[]).filter((bet) => {
    const playerMatches = !player || bet.user_id === player;
    const statusMatches = !status || bet.status === status;
    const matchText = `${matchName(bet)} ${bet.match_label ?? ""}`.toLowerCase();
    const matchMatches = !match || matchText.includes(match);

    return playerMatches && statusMatches && matchMatches;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        description="Alla deltagare kan se alla spel. Filtrera på spelare, status eller match."
        title="Alla spel"
      />
      <form className="grid gap-4 rounded-md border border-neutral-200 bg-white p-4 shadow-soft md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-800" htmlFor="player">
            Spelare
          </label>
          <select
            className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
            defaultValue={player}
            id="player"
            name="player"
          >
            <option value="">Alla</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.display_name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-800" htmlFor="status">
            Status
          </label>
          <select
            className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
            defaultValue={status}
            id="status"
            name="status"
          >
            <option value="">Alla</option>
            {["pending", "won", "lost", "void"].map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-800" htmlFor="match">
            Match
          </label>
          <input
            className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
            defaultValue={getParam(searchParams?.match)}
            id="match"
            name="match"
            placeholder="Sök match"
            type="search"
          />
        </div>
        <div className="flex items-end">
          <button
            className="focus-ring min-h-10 w-full rounded-md bg-grass px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#11633c]"
            type="submit"
          >
            Filtrera
          </button>
        </div>
      </form>
      {bets.length === 0 ? (
        <EmptyState text="Inga spel matchar filtret." title="Tom lista" />
      ) : (
        <div className="table-scroll rounded-md border border-neutral-200 bg-white shadow-soft">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-neutral-100 text-xs uppercase tracking-normal text-neutral-600">
              <tr>
                <th className="px-4 py-3">Spelare</th>
                <th className="px-4 py-3">Match</th>
                <th className="px-4 py-3">Spel</th>
                <th className="px-4 py-3">Odds</th>
                <th className="px-4 py-3">Insats</th>
                <th className="px-4 py-3">Vinst</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Skapat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {bets.map((bet) => (
                <tr key={bet.id}>
                  <td className="px-4 py-3 font-semibold">
                    {bet.profiles?.display_name ?? "Okänd"}
                  </td>
                  <td className="px-4 py-3">{matchName(bet)}</td>
                  <td className="px-4 py-3">{bet.description}</td>
                  <td className="px-4 py-3">{formatDecimal(bet.odds)}</td>
                  <td className="px-4 py-3">{formatCurrency(bet.stake)}</td>
                  <td className="px-4 py-3">{formatCurrency(bet.payout)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={bet.status} />
                  </td>
                  <td className="px-4 py-3">{formatDate(bet.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
