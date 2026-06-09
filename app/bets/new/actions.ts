"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { money, toNumber } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

  const supabase = createSupabaseServerClient();
  const settingsResult = await supabase
    .from("competition_settings")
    .select("locked")
    .eq("id", true)
    .maybeSingle();

  if (settingsResult.error) {
    redirect(redirectPath("/bets/new", "error", settingsResult.error.message));
  }

  if (settingsResult.data?.locked) {
    redirect(redirectPath("/bets/new", "error", "Tävlingen är låst."));
  }

  const balanceResult = await supabase
    .from("leaderboard")
    .select("current_balance")
    .eq("user_id", user.id)
    .maybeSingle();

  if (balanceResult.error) {
    redirect(redirectPath("/bets/new", "error", balanceResult.error.message));
  }

  const currentBalance = toNumber(balanceResult.data?.current_balance);
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

  const { error } = await supabase.from("bets").insert({
    user_id: user.id,
    match_id: parsed.data.match_id ?? null,
    match_label: parsed.data.match_label ?? null,
    description: parsed.data.description,
    odds: money(parsed.data.odds),
    stake,
    status: "pending"
  });

  if (error) {
    redirect(redirectPath("/bets/new", "error", error.message));
  }

  redirect(redirectPath("/my-bets", "message", "Spelet är sparat."));
}
