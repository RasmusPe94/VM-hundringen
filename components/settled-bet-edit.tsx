"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { toNumber } from "@/lib/format";
import type { BetWithRelations, MatchRecord } from "@/lib/db/data";

type Props = {
  bet: BetWithRelations;
  matches: MatchRecord[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
};

export function SettledBetEdit({ bet, matches, updateAction, deleteAction }: Props) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        className="mt-4 flex items-center gap-2 rounded-md border border-border/50 px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-border hover:text-body"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span>🔒</span> Ändra stängt spel
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-md border border-amber/40 bg-amber/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber">Redigera stängt spel</p>
        <button
          className="text-xs text-muted hover:text-body transition"
          onClick={() => setOpen(false)}
          type="button"
        >
          ✕ Stäng
        </button>
      </div>

      <form action={updateAction} className="grid gap-4 md:grid-cols-2">
        <input name="id" type="hidden" value={bet.id} />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor={`s_match_id_${bet.id}`}>Match</label>
          <select
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            defaultValue={bet.match_id ?? ""}
            id={`s_match_id_${bet.id}`}
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
          <label className="text-sm font-semibold text-bright" htmlFor={`s_match_label_${bet.id}`}>Fritextmatch</label>
          <input
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            defaultValue={bet.match_label ?? ""}
            id={`s_match_label_${bet.id}`}
            name="match_label"
            type="text"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-bright" htmlFor={`s_description_${bet.id}`}>Beskrivning</label>
          <textarea
            className="focus-ring min-h-20 w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            defaultValue={bet.description}
            id={`s_description_${bet.id}`}
            name="description"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor={`s_odds_${bet.id}`}>Odds</label>
          <input
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            defaultValue={toNumber(bet.odds).toFixed(2)}
            id={`s_odds_${bet.id}`}
            min="1.01" name="odds" required step="0.01" type="number"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-bright" htmlFor={`s_stake_${bet.id}`}>Insats</label>
          <input
            className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
            defaultValue={toNumber(bet.stake).toFixed(2)}
            id={`s_stake_${bet.id}`}
            min="0.01" name="stake" required step="0.01" type="number"
          />
        </div>
        <div className="md:col-span-2">
          <SubmitButton pendingText="Uppdaterar...">Spara ändringar</SubmitButton>
        </div>
      </form>
      <form action={deleteAction} className="mt-3">
        <input name="id" type="hidden" value={bet.id} />
        <SubmitButton variant="danger" pendingText="Tar bort...">Ta bort</SubmitButton>
      </form>
    </div>
  );
}
