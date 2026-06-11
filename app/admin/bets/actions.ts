"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { money, toNumber } from "@/lib/format";
import { deleteBet, getBet, getPendingBet, settleBet, updateAnyBet, updateAnyPendingBet } from "@/lib/db/data";
import { redirectPath } from "@/lib/strings";
import { betInputSchema, formError, settleInputSchema } from "@/lib/validation";

export async function adminUpdateBetAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = betInputSchema.safeParse({
    match_id:    formData.get("match_id"),
    match_label: formData.get("match_label"),
    description: formData.get("description"),
    odds:        formData.get("odds"),
    stake:       formData.get("stake")
  });

  if (!id) redirect(redirectPath("/admin/bets", "error", "Saknar bet-id."));
  if (!parsed.success) redirect(redirectPath("/admin/bets", "error", formError(parsed.error)));

  const existing = getBet(id);
  if (!existing) redirect(redirectPath("/admin/bets", "error", "Spelet hittades inte."));

  try {
    updateAnyBet(id, {
      description: parsed.data.description,
      match_id:    parsed.data.match_id,
      match_label: parsed.data.match_label,
      odds:        money(parsed.data.odds),
      stake:       money(parsed.data.stake)
    });
  } catch (error) {
    redirect(redirectPath("/admin/bets", "error", error instanceof Error ? error.message : "Kunde inte uppdatera."));
  }

  redirect(redirectPath("/admin/bets", "message", "Spelet är uppdaterat."));
}

export async function adminSettleBetAction(formData: FormData) {
  await requireAdmin();
  const parsed = settleInputSchema.safeParse({
    id:     formData.get("id"),
    status: formData.get("status"),
    payout: formData.get("payout")
  });

  if (!parsed.success) redirect(redirectPath("/admin/bets", "error", formError(parsed.error)));

  const bet = getPendingBet(parsed.data.id);
  if (!bet) redirect(redirectPath("/admin/bets", "error", "Spelet är inte pågående."));

  const stake = toNumber(bet.stake);
  const odds  = toNumber(bet.odds);
  const defaultPayouts = { won: stake * odds, lost: 0, void: stake };
  const payout = money(parsed.data.payout ?? defaultPayouts[parsed.data.status]);

  try {
    settleBet(parsed.data.id, parsed.data.status, payout);
  } catch (error) {
    redirect(redirectPath("/admin/bets", "error", error instanceof Error ? error.message : "Spelet kunde inte avgöras."));
  }

  redirect(redirectPath("/admin/bets", "message", "Spelet är avgjort."));
}

export async function adminDeleteBetAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(redirectPath("/admin/bets", "error", "Saknar bet-id."));

  try {
    deleteBet(id);
  } catch (error) {
    redirect(redirectPath("/admin/bets", "error", error instanceof Error ? error.message : "Kunde inte ta bort."));
  }

  redirect(redirectPath("/admin/bets", "message", "Spelet är borttaget."));
}
