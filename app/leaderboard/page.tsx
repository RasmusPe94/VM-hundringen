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
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {rows.map((row) => (
              <div
                key={row.player_id}
                className={`rounded-lg border bg-surface p-4 shadow-card ${
                  row.rank <= 3 ? "border-gold/40" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xl ${medalClass[row.rank - 1] ?? "text-muted"}`}>
                      {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : `#${row.rank}`}
                    </span>
                    <span className="font-bold text-bright">{row.display_name}</span>
                  </div>
                  <span className="text-lg font-black text-foam">{formatCurrency(row.current_balance)}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted uppercase tracking-wide">Satsat</p>
                    <p className="font-semibold text-body">{formatCurrency(row.total_staked)}</p>
                  </div>
                  <div>
                    <p className="text-muted uppercase tracking-wide">Saldo+möjlig</p>
                    <p className="font-semibold text-body">{formatCurrency(row.balance_including_possible_payout)}</p>
                  </div>
                  <div>
                    <p className="text-muted uppercase tracking-wide">ROI</p>
                    <p className="font-semibold text-body">{formatRoi(row.roi)}</p>
                  </div>
                  <div>
                    <p className="text-muted uppercase tracking-wide">Spel</p>
                    <p className="font-semibold text-body">{row.bet_count}</p>
                  </div>
                  <div>
                    <p className="text-muted uppercase tracking-wide">Vunna</p>
                    <p className="font-semibold text-emerald-400">{row.won_bet_count}</p>
                  </div>
                  <div>
                    <p className="text-muted uppercase tracking-wide">Pågående</p>
                    <p className="font-semibold text-body">{formatCurrency(row.pending_stake)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block table-scroll rounded-lg border border-border bg-surface shadow-card">
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
        </>
      )}
    </div>
  );
}
