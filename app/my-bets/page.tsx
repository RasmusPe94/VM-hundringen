import { EmptyState } from "@/components/empty-state";
import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency, formatDate, formatDecimal, toNumber } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { listMatches, listMyBets } from "@/lib/pocketbase/data";
import { deleteMyBetAction, updateMyBetAction } from "./actions";

type MatchOption = {
  id: string;
  match_no: number;
  home_team: string;
  away_team: string;
};

type BetRow = {
  id: string;
  match_id: string | null;
  match_label: string | null;
  description: string;
  odds: number | string;
  stake: number | string;
  status: string;
  payout: number | string | null;
  created_at: string;
  matches: MatchOption | null;
};

type MyBetsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function matchName(bet: BetRow) {
  if (bet.matches) {
    return `#${bet.matches.match_no} ${bet.matches.home_team} - ${bet.matches.away_team}`;
  }

  return bet.match_label ?? "Fritext";
}

export default async function MyBetsPage({ searchParams }: MyBetsPageProps) {
  const { user } = await requireUser();
  const [matches, bets] = await Promise.all([
    listMatches(),
    listMyBets(user.id)
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Du kan ändra eller ta bort egna spel så länge de är pågående."
        title="Mina spel"
      />
      <MessageBanner searchParams={searchParams} />
      {bets.length === 0 ? (
        <EmptyState text="Lägg första spelet från sidan Nytt spel." title="Inga spel än" />
      ) : (
        <div className="space-y-4">
          {bets.map((bet) => {
            const isPending = bet.status === "pending";

            return (
              <section
                className="rounded-md border border-neutral-200 bg-white p-4 shadow-soft"
                key={bet.id}
              >
                <div className="flex flex-col gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-ink">{matchName(bet)}</h2>
                      <StatusPill status={bet.status} />
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">
                      Skapat {formatDate(bet.created_at)}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase text-neutral-500">Odds</p>
                      <p className="font-semibold">{formatDecimal(bet.odds)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-neutral-500">Insats</p>
                      <p className="font-semibold">{formatCurrency(bet.stake)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-neutral-500">Vinst</p>
                      <p className="font-semibold">{formatCurrency(bet.payout)}</p>
                    </div>
                  </div>
                </div>
                {isPending ? (
                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
                    <form
                      action={updateMyBetAction}
                      className="grid gap-4 md:grid-cols-2"
                    >
                      <input name="id" type="hidden" value={bet.id} />
                      <div className="space-y-2">
                        <label
                          className="text-sm font-semibold text-neutral-800"
                          htmlFor={`match_id_${bet.id}`}
                        >
                          Match
                        </label>
                        <select
                          className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
                          defaultValue={bet.match_id ?? ""}
                          id={`match_id_${bet.id}`}
                          name="match_id"
                        >
                          <option value="">Fritext</option>
                          {matches.map((match) => (
                            <option key={match.id} value={match.id}>
                              #{match.match_no} {match.home_team} - {match.away_team}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label
                          className="text-sm font-semibold text-neutral-800"
                          htmlFor={`match_label_${bet.id}`}
                        >
                          Fritextmatch
                        </label>
                        <input
                          className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
                          defaultValue={bet.match_label ?? ""}
                          id={`match_label_${bet.id}`}
                          name="match_label"
                          type="text"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label
                          className="text-sm font-semibold text-neutral-800"
                          htmlFor={`description_${bet.id}`}
                        >
                          Beskrivning
                        </label>
                        <textarea
                          className="focus-ring min-h-20 w-full rounded-md border border-neutral-300 px-3 py-2"
                          defaultValue={bet.description}
                          id={`description_${bet.id}`}
                          name="description"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          className="text-sm font-semibold text-neutral-800"
                          htmlFor={`odds_${bet.id}`}
                        >
                          Odds
                        </label>
                        <input
                          className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
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
                          className="text-sm font-semibold text-neutral-800"
                          htmlFor={`stake_${bet.id}`}
                        >
                          Insats
                        </label>
                        <input
                          className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
                          defaultValue={toNumber(bet.stake).toFixed(2)}
                          id={`stake_${bet.id}`}
                          min="0.01"
                          name="stake"
                          required
                          step="0.01"
                          type="number"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <SubmitButton pendingText="Uppdaterar...">
                          Uppdatera spel
                        </SubmitButton>
                      </div>
                    </form>
                    <form action={deleteMyBetAction} className="flex items-start">
                      <input name="id" type="hidden" value={bet.id} />
                      <SubmitButton
                        className="w-full lg:w-auto"
                        pendingText="Tar bort..."
                        variant="danger"
                      >
                        Ta bort
                      </SubmitButton>
                    </form>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-neutral-600">{bet.description}</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
