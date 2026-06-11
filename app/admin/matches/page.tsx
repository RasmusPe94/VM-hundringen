import { MessageBanner } from "@/components/message-banner";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";
import { getCompetitionSettings, listMatches } from "@/lib/db/data";
import {
  createMatchAction,
  deleteMatchAction,
  updateCompetitionLockAction,
  updateMatchAction
} from "./actions";

type AdminMatchesPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function dateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}

export default async function AdminMatchesPage({
  searchParams
}: AdminMatchesPageProps) {
  await requireAdmin();
  const [matches, settings] = await Promise.all([
    listMatches(),
    getCompetitionSettings()
  ]);
  const locked = Boolean(settings?.locked);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Admin kan skapa, ändra och ta bort matcher som används i spel-formuläret."
        title="Admin: matcher"
      />
      <MessageBanner searchParams={searchParams} />
      <form
        action={updateCompetitionLockAction}
        className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-base font-bold text-bright">Tävlingslås</h2>
          <p className="mt-1 text-sm text-muted">
            När tävlingen är låst kan deltagare inte lägga nya spel.
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-bright">
          <input
            className="h-5 w-5 accent-grass"
            defaultChecked={locked}
            name="locked"
            type="checkbox"
          />
          Låst
        </label>
        <SubmitButton pendingText="Sparar lås...">Spara lås</SubmitButton>
      </form>
      <form
        action={createMatchAction}
        className="grid gap-4 rounded-lg border border-border bg-surface p-4 shadow-card md:grid-cols-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor="match_no">
            Nr
          </label>
          <input
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            id="match_no"
            min="1"
            name="match_no"
            required
            type="number"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-bright" htmlFor="starts_at">
            Start
          </label>
          <input
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            id="starts_at"
            name="starts_at"
            type="datetime-local"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor="home_team">
            Hemma
          </label>
          <input
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            id="home_team"
            name="home_team"
            required
            type="text"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor="away_team">
            Borta
          </label>
          <input
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            id="away_team"
            name="away_team"
            required
            type="text"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor="phase">
            Fas
          </label>
          <input
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            id="phase"
            name="phase"
            placeholder="Grupp"
            type="text"
          />
        </div>
        <div className="md:col-span-6">
          <SubmitButton pendingText="Skapar...">Skapa match</SubmitButton>
        </div>
      </form>
      <div className="space-y-3">
        {matches.map((match) => (
          <section
            className="rounded-lg border border-border bg-surface p-4 shadow-card"
            key={match.id}
          >
            <div className="mb-4 text-sm font-semibold text-body">
              #{match.match_no} {match.home_team} - {match.away_team} ·{" "}
              {match.phase ?? "Ingen fas"} · {formatDate(match.starts_at)}
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <form
                action={updateMatchAction}
                className="grid gap-4 md:grid-cols-6"
              >
                <input name="id" type="hidden" value={match.id} />
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-bright"
                    htmlFor={`match_no_${match.id}`}
                  >
                    Nr
                  </label>
                  <input
                    className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                    defaultValue={match.match_no}
                    id={`match_no_${match.id}`}
                    min="1"
                    name="match_no"
                    required
                    type="number"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label
                    className="text-sm font-semibold text-bright"
                    htmlFor={`starts_at_${match.id}`}
                  >
                    Start
                  </label>
                  <input
                    className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                    defaultValue={dateTimeLocalValue(match.starts_at)}
                    id={`starts_at_${match.id}`}
                    name="starts_at"
                    type="datetime-local"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-bright"
                    htmlFor={`home_team_${match.id}`}
                  >
                    Hemma
                  </label>
                  <input
                    className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                    defaultValue={match.home_team}
                    id={`home_team_${match.id}`}
                    name="home_team"
                    required
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-bright"
                    htmlFor={`away_team_${match.id}`}
                  >
                    Borta
                  </label>
                  <input
                    className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                    defaultValue={match.away_team}
                    id={`away_team_${match.id}`}
                    name="away_team"
                    required
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold text-bright"
                    htmlFor={`phase_${match.id}`}
                  >
                    Fas
                  </label>
                  <input
                    className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
                    defaultValue={match.phase ?? ""}
                    id={`phase_${match.id}`}
                    name="phase"
                    type="text"
                  />
                </div>
                <div className="md:col-span-6">
                  <SubmitButton pendingText="Uppdaterar...">
                    Uppdatera match
                  </SubmitButton>
                </div>
              </form>
              <form action={deleteMatchAction}>
                <input name="id" type="hidden" value={match.id} />
                <SubmitButton
                  className="w-full lg:w-auto"
                  pendingText="Tar bort..."
                  variant="danger"
                >
                  Ta bort
                </SubmitButton>
              </form>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
