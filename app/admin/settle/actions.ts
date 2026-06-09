"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { money, toNumber } from "@/lib/format";
import { getPendingBet, settleBet } from "@/lib/pocketbase/data";
import { redirectPath } from "@/lib/strings";
import { formError, settleInputSchema } from "@/lib/validation";

export async function settleBetAction(formData: FormData) {
  const { user } = await requireAdmin();
  const parsed = settleInputSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    payout: formData.get("payout")
  });

  if (!parsed.success) {
    redirect(redirectPath("/admin/settle", "error", formError(parsed.error)));
  }

  const bet = await getPendingBet(parsed.data.id);

  if (!bet) {
    redirect(redirectPath("/admin/settle", "error", "Spelet är inte pågående."));
  }

  const stake = toNumber(bet.stake);
  const odds = toNumber(bet.odds);
  const defaultPayouts = {
    won: stake * odds,
    lost: 0,
    void: stake
  };
  const payout = money(parsed.data.payout ?? defaultPayouts[parsed.data.status]);

  try {
    await settleBet(parsed.data.id, parsed.data.status, payout, user.id);
  } catch (error) {
    redirect(
      redirectPath(
        "/admin/settle",
        "error",
        error instanceof Error ? error.message : "Spelet kunde inte avgöras."
      )
    );
  }

  redirect(redirectPath("/admin/settle", "message", "Spelet är avgjort."));
}
