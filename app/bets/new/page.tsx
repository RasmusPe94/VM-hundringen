import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getCurrentBalance, listMatches } from "@/lib/db/data";
import { createBetAction } from "./actions";
import { MatchSelect } from "./match-select";

type NewBetPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function NewBetPage({ searchParams }: NewBetPageProps) {
  const { user } = await requireUser();
  const [matches, currentBalance] = await Promise.all([
    listMatches(),
    getCurrentBalance(user.id)
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        description={`Nuvarande saldo: ${formatCurrency(currentBalance)}`}
        title="Nytt spel"
      />
      <MessageBanner searchParams={searchParams} />
      <form
        action={createBetAction}
        className="space-y-5 rounded-lg border border-border bg-surface p-5 shadow-card"
      >
        <MatchSelect matches={matches} />
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-bright"
            htmlFor="match_label"
          >
            Fritextmatch
          </label>
          <input
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            id="match_label"
            name="match_label"
            placeholder="Till exempel: Finalen eller Sverige v Danmark"
            type="text"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-bright"
            htmlFor="description"
          >
            Beskrivning
          </label>
          <textarea
            className="focus-ring min-h-24 w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            id="description"
            name="description"
            placeholder="Till exempel: Argentina vinner efter ordinarie tid"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bright" htmlFor="odds">
              Odds
            </label>
            <input
              className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
              id="odds"
              min="1.01"
              name="odds"
              required
              step="0.01"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bright" htmlFor="stake">
              Insats
            </label>
            <input
              className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
              id="stake"
              min="0.01"
              name="stake"
              required
              step="0.01"
              type="number"
            />
          </div>
        </div>
        <SubmitButton pendingText="Sparar spel...">Spara spel</SubmitButton>
      </form>
    </div>
  );
}
