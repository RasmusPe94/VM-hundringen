import { EmptyState } from "@/components/empty-state";
import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency, formatDate, formatDecimal, toNumber } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";
import { listBets, listMatches } from "@/lib/db/data";
import { adminDeleteBetAction, adminUpdateBetAction } from "./actions";
import { SettleForm } from "./settle-form";
import { SettledBetEdit } from "@/components/settled-bet-edit";

type AdminBetsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function matchName(bet: {
  match_label: string | null;
  matches: { match_no: number; home_team: string; away_team: string } | null;
}) {
  if (bet.matches) {
    return `#${bet.matches.match_no} ${bet.matches.home_team} - ${bet.matches.away_team}`;
  }
  return bet.match_label ?? "Fritext";
}

export default async function AdminBetsPage({ searchParams }: AdminBetsPageProps) {
  await requireAdmin();
  const [matches, bets] = await Promise.all([listMatches(), listBets()]);

  const pending = bets.filter((b) => b.status === "pending");
  const settled = bets.filter((b) => b.status !== "pending");

  return (
    <div className="space-y-8">
      <PageHeader
        description="Redigera, avgör eller ta bort spel för alla spelare."
        title="Admin – alla spel"
      />
      <MessageBanner searchParams={searchParams} />

      {/* ── Pending bets ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foam">Pågående spel ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState title="Inga pågående spel" text="Alla spel är avgjorda." />
        ) : (
          <div className="space-y-6">
            {pending.map((bet) => {
              const playerName = bet.profiles?.display_name ?? "Okänd";
              return (
                <article
                  key={bet.id}
                  className="rounded-lg border border-border bg-surface shadow-card overflow-hidden"
                >
                  {/* Header row */}
                  <div className="flex flex-col gap-2 border-b border-border bg-rim/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-turf/20 px-2 py-0.5 text-xs font-bold text-turf uppercase tracking-wider">
                        {playerName}
                      </span>
                      <h3 className="font-semibold text-bright">{matchName(bet)}</h3>
                      <StatusPill status={bet.status} />
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted">
                        Odds <span className="font-semibold text-body">{formatDecimal(bet.odds)}</span>
                      </span>
                      <span className="text-muted">
                        Insats <span className="font-semibold text-body">{formatCurrency(bet.stake)}</span>
                      </span>
                      <span className="text-muted">
                        Pot. vinst{" "}
                        <span className="font-semibold text-foam">
                          {formatCurrency(toNumber(bet.odds) * toNumber(bet.stake))}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5 p-4">
                    <div>
                      <p className="text-sm text-body italic">{bet.description}</p>
                      <p className="mt-1 text-xs text-muted">Skapat {formatDate(bet.created_at)}</p>
                    </div>

                    {/* Edit form */}
                    <div className="rounded-md border border-border/60 bg-pitch/40 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                        Redigera
                      </p>
                      <form action={adminUpdateBetAction} className="grid gap-4 md:grid-cols-2">
                        <input name="id" type="hidden" value={bet.id} />
                        <div className="space-y-2">
                          <label
                            className="text-sm font-semibold text-bright"
                            htmlFor={`match_id_${bet.id}`}
                          >
                            Match
                          </label>
                          <select
                            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                            defaultValue={bet.match_id ?? ""}
                            id={`match_id_${bet.id}`}
                            name="match_id"
                          >
                            <option value="">Fritext</option>
                            {matches.map((m) => (
                              <option key={m.id} value={m.id}>
                                #{m.match_no} {m.home_team} - {m.away_team}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label
                            className="text-sm font-semibold text-bright"
                            htmlFor={`match_label_${bet.id}`}
                          >
                            Fritextmatch
                          </label>
                          <input
                            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                            defaultValue={bet.match_label ?? ""}
                            id={`match_label_${bet.id}`}
                            name="match_label"
                            type="text"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label
                            className="text-sm font-semibold text-bright"
                            htmlFor={`description_${bet.id}`}
                          >
                            Beskrivning
                          </label>
                          <textarea
                            className="focus-ring min-h-20 w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                            defaultValue={bet.description}
                            id={`description_${bet.id}`}
                            name="description"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            className="text-sm font-semibold text-bright"
                            htmlFor={`odds_${bet.id}`}
                          >
                            Odds
                          </label>
                          <input
                            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                            defaultValue={toNumber(bet.odds).toFixed(2)}
                            id={`odds_${bet.id}`}
                            min="1.01"
                            name="odds"
                            required
                            step="0.01"
                            type="number"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            className="text-sm font-semibold text-bright"
                            htmlFor={`stake_${bet.id}`}
                          >
                            Insats
                          </label>
                          <input
                            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                            defaultValue={toNumber(bet.stake).toFixed(2)}
                            id={`stake_${bet.id}`}
                            min="0.01"
                            name="stake"
                            required
                            step="0.01"
                            type="number"
                          />
                        </div>
                        <div className="flex items-center gap-3 md:col-span-2">
                          <SubmitButton pendingText="Uppdaterar...">Spara ändringar</SubmitButton>
                          <form action={adminDeleteBetAction}>
                            <input name="id" type="hidden" value={bet.id} />
                            <SubmitButton variant="danger" pendingText="Tar bort...">
                              Ta bort
                            </SubmitButton>
                          </form>
                        </div>
                      </form>
                    </div>

                    {/* Settle form */}
                    <div className="rounded-md border border-amber/30 bg-amber/5 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber">
                        Avgör spel
                      </p>
                      <SettleForm
                        betId={bet.id}
                        odds={toNumber(bet.odds)}
                        stake={toNumber(bet.stake)}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Settled bets ── */}
      {settled.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-muted">Avgjorda spel ({settled.length})</h2>
          <div className="space-y-4">
            {settled.map((bet) => {
              const playerName = bet.profiles?.display_name ?? "Okänd";
              return (
                <article
                  key={bet.id}
                  className="rounded-lg border border-border/60 bg-surface/70 shadow-card overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex flex-col gap-2 border-b border-border/60 bg-rim/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-rim px-2 py-0.5 text-xs font-bold text-muted uppercase tracking-wider">
                        {playerName}
                      </span>
                      <h3 className="font-semibold text-bright">{matchName(bet)}</h3>
                      <StatusPill status={bet.status} />
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted">
                        Insats <span className="font-semibold text-body">{formatCurrency(bet.stake)}</span>
                      </span>
                      <span className="text-muted">
                        Utbet. <span className="font-semibold text-body">{formatCurrency(bet.payout)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-body italic">{bet.description}</p>
                    <p className="mt-1 text-xs text-muted">Skapat {formatDate(bet.created_at)}</p>

                    <SettledBetEdit
                      bet={bet}
                      matches={matches}
                      updateAction={adminUpdateBetAction}
                      deleteAction={adminDeleteBetAction}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
