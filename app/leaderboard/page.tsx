import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatRoi } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getLeaderboardRows } from "@/lib/db/data";

const medalClass = ["rank-1", "rank-2", "rank-3"];

function Avatar({ playerId, avatarExt, name, size = 32 }: {
  playerId: string;
  avatarExt: string | null;
  name: string;
  size?: number;
}) {
  if (avatarExt) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/avatar/${playerId}`}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover ring-1 ring-border shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-rim ring-1 ring-border shrink-0 font-bold text-muted"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

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
                    <Avatar playerId={row.player_id} avatarExt={row.avatar_ext} name={row.display_name} size={36} />
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar playerId={row.player_id} avatarExt={row.avatar_ext} name={row.display_name} size={28} />
                        <span className="font-bold text-bright">{row.display_name}</span>
                      </div>
                    </td>
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
      {/* Floating action button – mobile only */}
      <Link
        href="/bets/new"
        className="md:hidden fixed bottom-6 right-5 flex items-center gap-2 rounded-full bg-turf px-5 py-3 text-sm font-bold text-white shadow-lg active:scale-95 transition-transform"
      >
        <span className="text-lg leading-none">+</span> Nytt spel
      </Link>
    </div>
  );
}
