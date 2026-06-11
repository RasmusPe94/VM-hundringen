import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatRoi } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getLeaderboardRows } from "@/lib/db/data";

const medalClass = ["rank-1", "rank-2", "rank-3"];

export default async function LeaderboardPage() {
  await requireUser();
  const rows = getLeaderboardRows();

  return (
    <div className="space-y-6">
      <PageHeader
        title="🏆 Topplista"
        description="Saldo och möjlig vinst räknas med samma regler som Excel-filen."
      />
      {rows.length === 0 ? (
        <EmptyState title="Inga deltagare än" text="Lägg till spelare för att starta tävlingen." />
      ) : (
        <div className="table-scroll rounded-lg border border-border bg-surface shadow-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-rim text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Namn</th>
                <th className="px-4 py-3">Totalt satsat</th>
                <th className="px-4 py-3 text-bright">Saldo</th>
                <th className="px-4 py-3">Pågående insats</th>
                <th className="px-4 py-3">Möjlig utbetalning</th>
                <th className="px-4 py-3">Saldo + möjlig</th>
                <th className="px-4 py-3">ROI</th>
                <th className="px-4 py-3">Spel</th>
                <th className="px-4 py-3">Vunna</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.player_id} className="transition-colors">
                  <td className={`px-4 py-3 text-base ${medalClass[row.rank - 1] ?? "text-muted"}`}>
                    {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : row.rank}
                  </td>
                  <td className="px-4 py-3 font-bold text-bright">{row.display_name}</td>
                  <td className="px-4 py-3 text-muted">{formatCurrency(row.total_staked)}</td>
                  <td className="px-4 py-3 font-bold text-foam">{formatCurrency(row.current_balance)}</td>
                  <td className="px-4 py-3 text-muted">{formatCurrency(row.pending_stake)}</td>
                  <td className="px-4 py-3 text-muted">{formatCurrency(row.potential_payout)}</td>
                  <td className="px-4 py-3 text-body">{formatCurrency(row.balance_including_possible_payout)}</td>
                  <td className="px-4 py-3 text-body">{formatRoi(row.roi)}</td>
                  <td className="px-4 py-3 text-muted">{row.bet_count}</td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">{row.won_bet_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
