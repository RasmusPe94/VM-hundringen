"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { money, toNumber } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

  const supabase = createSupabaseServerClient();
  const existingResult = await supabase
    .from("bets")
    .select("stake")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingResult.error) {
    redirect(redirectPath("/my-bets", "error", existingResult.error.message));
  }

  if (!existingResult.data) {
    redirect(
      redirectPath("/my-bets", "error", "Du kan bara ändra egna pågående spel.")
    );
  }

  const balanceResult = await supabase
    .from("leaderboard")
    .select("current_balance")
    .eq("user_id", user.id)
    .maybeSingle();

  if (balanceResult.error) {
    redirect(redirectPath("/my-bets", "error", balanceResult.error.message));
  }

  const currentBalance = toNumber(balanceResult.data?.current_balance);
  const oldStake = toNumber(existingResult.data.stake);
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

  const { error } = await supabase
    .from("bets")
    .update({
      match_id: parsed.data.match_id ?? null,
      match_label: parsed.data.match_label ?? null,
      description: parsed.data.description,
      odds: money(parsed.data.odds),
      stake: newStake
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) {
    redirect(redirectPath("/my-bets", "error", error.message));
  }

  redirect(redirectPath("/my-bets", "message", "Spelet är uppdaterat."));
}

export async function deleteMyBetAction(formData: FormData) {
  const { user } = await requireUser();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect(redirectPath("/my-bets", "error", "Saknar bet-id."));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("bets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) {
    redirect(redirectPath("/my-bets", "error", error.message));
  }

  redirect(redirectPath("/my-bets", "message", "Spelet är borttaget."));
}
