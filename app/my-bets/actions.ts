"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { money, toNumber } from "@/lib/format";
import {
  deleteBet,
  getCurrentBalance,
  getPendingOwnBet,
  updateOwnPendingBet
} from "@/lib/pocketbase/data";
import { redirectPath } from "@/lib/strings";
import { betInputSchema, formError } from "@/lib/validation";

export async function updateMyBetAction(formData: FormData) {
  const { user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const parsed = betInputSchema.safeParse({
    match_id: formData.get("match_id"),
    match_label: formData.get("match_label"),
    description: formData.get("description"),
    odds: formData.get("odds"),
    stake: formData.get("stake")
  });

  if (!id) {
    redirect(redirectPath("/my-bets", "error", "Saknar bet-id."));
  }

  if (!parsed.success) {
    redirect(redirectPath("/my-bets", "error", formError(parsed.error)));
  }

  const existing = await getPendingOwnBet(id, user.id);

  if (!existing) {
    redirect(
      redirectPath("/my-bets", "error", "Du kan bara ändra egna pågående spel.")
    );
  }

  const currentBalance = toNumber(await getCurrentBalance(user.id));
  const oldStake = toNumber(existing.stake);
  const newStake = money(parsed.data.stake);

  if (newStake > currentBalance + oldStake) {
    redirect(
      redirectPath(
        "/my-bets",
        "error",
        "Den nya insatsen är högre än ditt tillgängliga saldo."
      )
    );
  }

  try {
    await updateOwnPendingBet(id, {
      description: parsed.data.description,
      match_id: parsed.data.match_id,
      match_label: parsed.data.match_label,
      odds: money(parsed.data.odds),
      stake: newStake
    });
  } catch (error) {
    redirect(
      redirectPath(
        "/my-bets",
        "error",
        error instanceof Error ? error.message : "Spelet kunde inte uppdateras."
      )
    );
  }

  redirect(redirectPath("/my-bets", "message", "Spelet är uppdaterat."));
}

export async function deleteMyBetAction(formData: FormData) {
  const { user } = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect(redirectPath("/my-bets", "error", "Saknar bet-id."));
  }

  const existing = await getPendingOwnBet(id, user.id);

  if (!existing) {
    redirect(
      redirectPath("/my-bets", "error", "Du kan bara ta bort egna pågående spel.")
    );
  }

  try {
    await deleteBet(id);
  } catch (error) {
    redirect(
      redirectPath(
        "/my-bets",
        "error",
        error instanceof Error ? error.message : "Spelet kunde inte tas bort."
      )
    );
  }

  redirect(redirectPath("/my-bets", "message", "Spelet är borttaget."));
}
