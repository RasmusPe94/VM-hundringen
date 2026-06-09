import { EmptyState } from "@/components/empty-state";
import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate, formatDecimal, toNumber } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettleForm } from "./settle-form";

type BetRow = {
  id: string;
  match_label: string | null;
  description: string;
  odds: number | string;
  stake: number | string;
  created_at: string;
  profiles: { display_name: string } | null;
  matches: {
    match_no: number;
    home_team: string;
    away_team: string;
  } | null;
};

type AdminSettlePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function matchName(bet: BetRow) {
  if (bet.matches) {
    return `#${bet.matches.match_no} ${bet.matches.home_team} - ${bet.matches.away_team}`;
  }

  return bet.match_label ?? "Fritext";
}

export default async function AdminSettlePage({
  searchParams
}: AdminSettlePageProps) {
  await requireAdmin();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bets")
    .select(
      "id, match_label, description, odds, stake, created_at, profiles!bets_user_id_fkey(display_name), matches(match_no, home_team, away_team)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const bets = (data ?? []) as BetRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Välj status. Vinst föreslås enligt Excel-regeln: vunnen = insats gånger odds, förlorad = 0, void = insats."
        title="Admin: avgör spel"
      />
      <MessageBanner searchParams={searchParams} />
      {bets.length === 0 ? (
        <EmptyState text="Det finns inga pågående spel att avgöra." title="Klart" />
      ) : (
        <div className="space-y-4">
          {bets.map((bet) => (
            <section
              className="rounded-md border border-neutral-200 bg-white p-4 shadow-soft"
              key={bet.id}
            >
              <div className="mb-4 grid gap-3 border-b border-neutral-100 pb-4 md:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="text-base font-bold text-ink">{matchName(bet)}</h2>
                  <p className="mt-1 text-sm text-neutral-700">{bet.description}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {bet.profiles?.display_name ?? "Okänd"} ·{" "}
                    {formatDate(bet.created_at)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase text-neutral-500">Odds</p>
                    <p className="font-semibold">{formatDecimal(bet.odds)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-neutral-500">Insats</p>
                    <p className="font-semibold">{formatCurrency(bet.stake)}</p>
                  </div>
                </div>
              </div>
              <SettleForm
                betId={bet.id}
                odds={toNumber(bet.odds)}
                stake={toNumber(bet.stake)}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
