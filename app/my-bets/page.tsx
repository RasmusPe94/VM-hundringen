import { EmptyState } from "@/components/empty-state";
import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency, formatDate, formatDecimal, toNumber } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { listMatches, listMyBets } from "@/lib/db/data";
import type { BetWithRelations, MatchRecord } from "@/lib/db/data";
import { deleteMyBetAction, deleteMySettledBetAction, updateMyBetAction, updateMySettledBetAction } from "./actions";
import { SettleForm } from "./settle-form";
import { SettledBetEdit } from "@/components/settled-bet-edit";

type MyBetsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function matchName(bet: BetWithRelations) {
  if (bet.matches) {
    return `#${bet.matches.match_no} ${bet.matches.home_team} - ${bet.matches.away_team}`;
  }
  return bet.match_label ?? "Fritext";
}

function EditForm({
  bet,
  matches,
  updateAction,
  deleteAction,
}: {
  bet: BetWithRelations;
  matches: MatchRecord[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="mt-4 rounded-md border border-border/60 bg-pitch/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Redigera</p>
      <form action={updateAction} className="grid gap-4 md:grid-cols-2">
        <input name="id" type="hidden" value={bet.id} />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor={`match_id_${bet.id}`}>
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
          <label className="text-sm font-semibold text-bright" htmlFor={`match_label_${bet.id}`}>
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
          <label className="text-sm font-semibold text-bright" htmlFor={`description_${bet.id}`}>
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
          <label className="text-sm font-semibold text-bright" htmlFor={`odds_${bet.id}`}>
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
          <label className="text-sm font-semibold text-bright" htmlFor={`stake_${bet.id}`}>
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
          <form action={deleteAction}>
            <input name="id" type="hidden" value={bet.id} />
            <SubmitButton variant="danger" pendingText="Tar bort...">
              Ta bort
            </SubmitButton>
          </form>
        </div>
      </form>
    </div>
  );
}

export default async function MyBetsPage({ searchParams }: MyBetsPageProps) {
  const { user } = await requireUser();
  const [matches, bets] = await Promise.all([listMatches(), listMyBets(user!.id)]);

  const pending = bets.filter((b) => b.status === "pending");
  const settled = bets.filter((b) => b.status !== "pending");

  return (
    <div className="space-y-8">
      <PageHeader
        description="Du kan ändra, avgöra eller ta bort alla dina spel."
        title="Mina spel"
      />
      <MessageBanner searchParams={searchParams} />

      {bets.length === 0 ? (
        <EmptyState text="Lägg första spelet från sidan Nytt spel." title="Inga spel än" />
      ) : (
        <>
          {/* ── Pending ── */}
          {pending.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-foam">Pågående spel ({pending.length})</h2>
              <div className="space-y-4">
                {pending.map((bet) => (
                  <div
                    key={bet.id}
                    className="rounded-lg border border-border bg-surface p-4 shadow-card"
                  >
                    {/* Header */}
                    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-bright">{matchName(bet)}</h3>
                          <StatusPill status={bet.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted">Skapat {formatDate(bet.created_at)}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase text-muted">Odds</p>
                          <p className="font-semibold">{formatDecimal(bet.odds)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted">Insats</p>
                          <p className="font-semibold">{formatCurrency(bet.stake)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted">Pot. vinst</p>
                          <p className="font-semibold text-foam">{formatCurrency(toNumber(bet.odds) * toNumber(bet.stake))}</p>
                        </div>
                      </div>
                    </div>

                    <EditForm
                      bet={bet}
                      matches={matches}
                      updateAction={updateMyBetAction}
                      deleteAction={deleteMyBetAction}
                    />

                    {/* Settle section */}
                    <div className="mt-4 rounded-md border border-amber/30 bg-amber/5 p-4">
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
                ))}
              </div>
            </section>
          )}

          {/* ── Settled ── */}
          {settled.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-muted">Avgjorda spel ({settled.length})</h2>
              <div className="space-y-4">
                {settled.map((bet) => (
                  <div
                    key={bet.id}
                    className="rounded-lg border border-border/60 bg-surface/70 p-4 shadow-card"
                  >
                    {/* Header */}
                    <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-bright">{matchName(bet)}</h3>
                          <StatusPill status={bet.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted">Skapat {formatDate(bet.created_at)}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase text-muted">Odds</p>
                          <p className="font-semibold">{formatDecimal(bet.odds)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted">Insats</p>
                          <p className="font-semibold">{formatCurrency(bet.stake)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted">Utbet.</p>
                          <p className="font-semibold">{formatCurrency(bet.payout)}</p>
                        </div>
                      </div>
                    </div>

                    <SettledBetEdit
                      bet={bet}
                      matches={matches}
                      updateAction={updateMySettledBetAction}
                      deleteAction={deleteMySettledBetAction}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
