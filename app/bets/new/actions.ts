"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { money, toNumber } from "@/lib/format";
import {
  createBet,
  getCompetitionSettings,
  getCurrentBalance
} from "@/lib/pocketbase/data";
import { redirectPath } from "@/lib/strings";
import { betInputSchema, formError } from "@/lib/validation";

export async function createBetAction(formData: FormData) {
  const { user } = await requireUser();
  const parsed = betInputSchema.safeParse({
    match_id: formData.get("match_id"),
    match_label: formData.get("match_label"),
    description: formData.get("description"),
    odds: formData.get("odds"),
    stake: formData.get("stake")
  });

  if (!parsed.success) {
    redirect(redirectPath("/bets/new", "error", formError(parsed.error)));
  }

  const settings = await getCompetitionSettings();

  if (settings?.locked) {
    redirect(redirectPath("/bets/new", "error", "Tävlingen är låst."));
  }

  const currentBalance = toNumber(await getCurrentBalance(user.id));
  const stake = money(parsed.data.stake);

  if (stake > currentBalance) {
    redirect(
      redirectPath(
        "/bets/new",
        "error",
        `Insatsen är högre än ditt nuvarande saldo (${currentBalance.toFixed(2)} SEK).`
      )
    );
  }

  try {
    await createBet(user.id, {
      description: parsed.data.description,
      match_id: parsed.data.match_id,
      match_label: parsed.data.match_label,
      odds: money(parsed.data.odds),
      stake
    });
  } catch (error) {
    redirect(
      redirectPath(
        "/bets/new",
        "error",
        error instanceof Error ? error.message : "Spelet kunde inte sparas."
      )
    );
  }

  redirect(redirectPath("/my-bets", "message", "Spelet är sparat."));
}
