import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import { getCurrentBalance, listMatches } from "@/lib/pocketbase/data";
import { createBetAction } from "./actions";

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
        className="space-y-5 rounded-md border border-neutral-200 bg-white p-5 shadow-soft"
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-800" htmlFor="match_id">
            Match
          </label>
          <select
            className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
            id="match_id"
            name="match_id"
          >
            <option value="">Välj match eller ange fritext nedan</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                #{match.match_no} {match.home_team} - {match.away_team} ·{" "}
                {match.phase ?? "Grupp"} · {formatDate(match.starts_at)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-neutral-800"
            htmlFor="match_label"
          >
            Fritextmatch
          </label>
          <input
            className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
            id="match_label"
            name="match_label"
            placeholder="Till exempel: Finalen eller Sverige v Danmark"
            type="text"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-neutral-800"
            htmlFor="description"
          >
            Beskrivning
          </label>
          <textarea
            className="focus-ring min-h-24 w-full rounded-md border border-neutral-300 px-3 py-2"
            id="description"
            name="description"
            placeholder="Till exempel: Argentina vinner efter ordinarie tid"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-800" htmlFor="odds">
              Odds
            </label>
            <input
              className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
              id="odds"
              min="1.01"
              name="odds"
              required
              step="0.01"
              type="number"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-800" htmlFor="stake">
              Insats
            </label>
            <input
              className="focus-ring w-full rounded-md border border-neutral-300 px-3 py-2"
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
