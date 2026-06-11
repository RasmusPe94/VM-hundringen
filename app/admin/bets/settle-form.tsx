"use client";

import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { money } from "@/lib/format";
import { adminSettleBetAction } from "./actions";

type SettleFormProps = {
  betId: string;
  stake: number;
  odds: number;
};

export function SettleForm({ betId, stake, odds }: SettleFormProps) {
  const defaults = useMemo(
    () => ({
      won: money(stake * odds),
      lost: 0,
      void: money(stake)
    }),
    [odds, stake]
  );
  const [status, setStatus] = useState<"won" | "lost" | "void">("won");
  const [payout, setPayout] = useState(defaults.won.toFixed(2));

  return (
    <form action={adminSettleBetAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <input name="id" type="hidden" value={betId} />
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foam" htmlFor={`status_${betId}`}>
          Resultat
        </label>
        <select
          className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
          id={`status_${betId}`}
          name="status"
          onChange={(event) => {
            const nextStatus = event.target.value as "won" | "lost" | "void";
            setStatus(nextStatus);
            setPayout(defaults[nextStatus].toFixed(2));
          }}
          value={status}
        >
          <option value="won">Vunnen</option>
          <option value="lost">Förlorad</option>
          <option value="void">Void</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foam" htmlFor={`payout_${betId}`}>
          Vinst (kr)
        </label>
        <input
          className="focus-ring w-full rounded-md border border-border bg-rim px-3 py-2 text-bright"
          id={`payout_${betId}`}
          min="0"
          name="payout"
          onChange={(event) => setPayout(event.target.value)}
          step="0.01"
          type="number"
          value={payout}
        />
      </div>
      <div className="flex items-end">
        <SubmitButton className="w-full" pendingText="Avgör...">
          Avgör
        </SubmitButton>
      </div>
    </form>
  );
}
