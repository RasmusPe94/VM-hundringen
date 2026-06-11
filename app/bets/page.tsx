import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { formatCurrency, formatDate, formatDecimal, formatStatus } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { listBets, listPlayers } from "@/lib/db/data";
import { getParam } from "@/lib/strings";

type BetsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function BetsPage({ searchParams }: BetsPageProps) {
  await requireUser();
  const player = getParam(searchParams?.player);
  const status = getParam(searchParams?.status);
  const match = getParam(searchParams?.match).trim().toLowerCase();

  const [players, allBets] = await Promise.all([listPlayers(), listBets()]);

  const bets = allBets.filter((bet) => {
    const playerMatches = !player || bet.player_id === player;
    const statusMatches = !status || bet.status === status;
    const matchText = bet.matches
      ? `#${bet.matches.match_no} ${bet.matches.home_team} - ${bet.matches.away_team} ${bet.match_label ?? ""}`.toLowerCase()
      : (bet.match_label ?? "").toLowerCase();
    const matchMatches = !match || matchText.includes(match);
    return playerMatches && statusMatches && matchMatches;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        description="Alla deltagare kan se alla spel. Filtrera på spelare, status eller match."
        title="Alla spel"
      />
      <form className="grid gap-4 rounded-lg border border-border bg-surface p-4 shadow-card md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor="player">Spelare</label>
          <select className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright" defaultValue={player} id="player" name="player">
            <option value="">Alla</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor="status">Status</label>
          <select className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright" defaultValue={status} id="status" name="status">
            <option value="">Alla</option>
            {["pending", "won", "lost", "void"].map((item) => (
              <option key={item} value={item}>{formatStatus(item)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor="match">Match</label>
          <input
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            defaultValue={getParam(searchParams?.match)}
            id="match"
            name="match"
            placeholder="Sök match"
            type="search"
          />
        </div>
        <div className="flex items-end">
          <button className="focus-ring min-h-10 w-full rounded-md bg-turf px-4 py-2 text-sm font-semibold text-white transition hover:bg-turf2" type="submit">
            Filtrera
          </button>
        </div>
      </form>
      {bets.length === 0 ? (
        <EmptyState text="Inga spel matchar filtret." title="Tom lista" />
      ) : (
        <div className="table-scroll rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-rim text-xs uppercase tracking-wider text-muted">
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
            <tbody className="divide-y divide-border">
              {bets.map((bet) => (
                <tr key={bet.id}>
                  <td className="px-4 py-3 font-semibold">{bet.profiles?.display_name ?? "Okänd"}</td>
                  <td className="px-4 py-3">
                    {bet.matches
                      ? `#${bet.matches.match_no} ${bet.matches.home_team} - ${bet.matches.away_team}`
                      : bet.match_label ?? "Fritext"}
                  </td>
                  <td className="px-4 py-3">{bet.description}</td>
                  <td className="px-4 py-3">{formatDecimal(bet.odds)}</td>
                  <td className="px-4 py-3">{formatCurrency(bet.stake)}</td>
                  <td className="px-4 py-3">{formatCurrency(bet.payout)}</td>
                  <td className="px-4 py-3"><StatusPill status={bet.status} /></td>
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
