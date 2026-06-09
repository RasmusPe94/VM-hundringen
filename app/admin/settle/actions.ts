"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { money, toNumber } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

  const supabase = createSupabaseServerClient();
  const betResult = await supabase
    .from("bets")
    .select("stake, odds")
    .eq("id", parsed.data.id)
    .eq("status", "pending")
    .maybeSingle();

  if (betResult.error) {
    redirect(redirectPath("/admin/settle", "error", betResult.error.message));
  }

  if (!betResult.data) {
    redirect(redirectPath("/admin/settle", "error", "Spelet är inte pågående."));
  }

  const stake = toNumber(betResult.data.stake);
  const odds = toNumber(betResult.data.odds);
  const defaultPayouts = {
    won: stake * odds,
    lost: 0,
    void: stake
  };
  const payout = money(parsed.data.payout ?? defaultPayouts[parsed.data.status]);

  const { error } = await supabase
    .from("bets")
    .update({
      status: parsed.data.status,
      payout,
      settled_at: new Date().toISOString(),
      settled_by: user.id
    })
    .eq("id", parsed.data.id)
    .eq("status", "pending");

  if (error) {
    redirect(redirectPath("/admin/settle", "error", error.message));
  }

  redirect(redirectPath("/admin/settle", "message", "Spelet är avgjort."));
}
