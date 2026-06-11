import { redirect } from "next/navigation";
import { MessageBanner } from "@/components/message-banner";
import { SubmitButton } from "@/components/submit-button";
import { getUserProfile } from "@/lib/auth";
import { listPlayers } from "@/lib/db/data";
import type { PlayerRecord } from "@/lib/db/data";
import { addUserAction, selectUserAction } from "./actions";

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { user } = await getUserProfile();
  if (user) redirect("/leaderboard");

  let players: PlayerRecord[] = [];
  try { players = listPlayers(); } catch { /* db not ready yet */ }

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      {/* Hero */}
      <div className="text-center space-y-2 pb-2">
        <div className="text-6xl">⚽</div>
        <h1 className="text-3xl font-black tracking-tight logo-text">VM-hundringen 2026 🏆</h1>
        <p className="text-muted text-sm">Välj vem du är för att komma in i tävlingen.</p>
      </div>

      <MessageBanner searchParams={searchParams} />

      {players.length > 0 ? (
        <form action={selectUserAction} className="space-y-3 rounded-lg border border-border bg-surface p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Välj spelare</p>
          <div className="space-y-2">
            {players.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition hover:border-turf/60 hover:bg-rim has-[:checked]:border-turf has-[:checked]:bg-turf/10"
              >
                <input className="accent-turf" name="user_id" type="radio" value={p.id} />
                <span className="font-semibold text-bright">{p.name}</span>
              </label>
            ))}
          </div>
          <SubmitButton pendingText="Väljer..." className="w-full">Välj och fortsätt</SubmitButton>
        </form>
      ) : null}

      <form action={addUserAction} className="space-y-3 rounded-lg border border-border bg-surface p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Ny spelare 🍺</p>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-body" htmlFor="display_name">Ditt namn</label>
          <input
            autoComplete="off"
            className="focus-ring w-full rounded-lg border border-border bg-rim px-3 py-2 text-bright placeholder:text-muted"
            id="display_name"
            name="display_name"
            placeholder="t.ex. Rasmus"
            required
            type="text"
          />
        </div>
        <SubmitButton pendingText="Lägger till..." variant="secondary" className="w-full">
          Lägg till och välj
        </SubmitButton>
      </form>
    </div>
  );
}
