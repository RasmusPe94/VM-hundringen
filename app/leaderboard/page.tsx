import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatRoi } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getLeaderboardRows } from "@/lib/pocketbase/data";

export default async function LeaderboardPage() {
  await requireUser();
  const rows = await getLeaderboardRows();

  return (
    <div className="space-y-6">
      <PageHeader
        description="Saldo och möjlig vinst räknas på servern med samma regler som Excel-filen."
        title="Topplista"
      />
      {rows.length === 0 ? (
        <EmptyState
          text="När deltagare finns i PocketBase visas tabellen här."
          title="Inga deltagare än"
        />
      ) : (
        <div className="table-scroll rounded-md border border-neutral-200 bg-white shadow-soft">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-neutral-100 text-xs uppercase tracking-normal text-neutral-600">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Namn</th>
                <th className="px-4 py-3">Totalt satsat</th>
                <th className="px-4 py-3">Nuvarande saldo</th>
                <th className="px-4 py-3">Pågående insats</th>
                <th className="px-4 py-3">Möjlig vinst</th>
                <th className="px-4 py-3">Saldo + möjlig vinst</th>
                <th className="px-4 py-3">ROI</th>
                <th className="px-4 py-3">Spel</th>
                <th className="px-4 py-3">Vunna</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((row) => (
                <tr key={row.user_id}>
                  <td className="px-4 py-3 font-bold">{row.rank}</td>
                  <td className="px-4 py-3 font-semibold">{row.display_name}</td>
                  <td className="px-4 py-3">{formatCurrency(row.total_staked)}</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(row.current_balance)}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(row.pending_stake)}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(row.potential_payout)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(row.balance_including_possible_payout)}
                  </td>
                  <td className="px-4 py-3">{formatRoi(row.roi)}</td>
                  <td className="px-4 py-3">{row.bet_count}</td>
                  <td className="px-4 py-3">{row.won_bet_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
