"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { MatchRecord } from "@/lib/db/data";

type Props = {
  matches: MatchRecord[];
};

export function MatchSelect({ matches }: Props) {
  const [showAll, setShowAll] = useState(false);

  // Yesterday midnight (local) — hide matches that started before this
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const upcoming = matches.filter((m) => m.starts_at && new Date(m.starts_at) >= yesterday);
  const hidden = matches.length - upcoming.length;
  const visible = showAll ? matches : upcoming;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-bright" htmlFor="match_id">
          Match
        </label>
        {hidden > 0 && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-xs text-muted underline underline-offset-2 hover:text-body transition"
          >
            Visa alla ({hidden} dolda)
          </button>
        )}
        {showAll && hidden > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="text-xs text-muted underline underline-offset-2 hover:text-body transition"
          >
            Dölj gamla matcher
          </button>
        )}
      </div>
      <select
        className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
        id="match_id"
        name="match_id"
      >
        <option value="">Välj match eller ange fritext nedan</option>
        {visible.map((match) => (
          <option key={match.id} value={match.id}>
            #{match.match_no} {match.home_team} - {match.away_team} ·{" "}
            {match.phase ?? "Grupp"} · {formatDate(match.starts_at)}
          </option>
        ))}
      </select>
    </div>
  );
}
