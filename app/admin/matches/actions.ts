"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirectPath } from "@/lib/strings";
import { formError, matchInputSchema } from "@/lib/validation";

function matchPayload(formData: FormData) {
  return {
    match_no: formData.get("match_no"),
    starts_at: formData.get("starts_at"),
    home_team: formData.get("home_team"),
    away_team: formData.get("away_team"),
    phase: formData.get("phase")
  };
}

export async function createMatchAction(formData: FormData) {
  await requireAdmin();
  const parsed = matchInputSchema.safeParse(matchPayload(formData));

  if (!parsed.success) {
    redirect(redirectPath("/admin/matches", "error", formError(parsed.error)));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("matches").insert({
    match_no: parsed.data.match_no,
    starts_at: parsed.data.starts_at ?? null,
    home_team: parsed.data.home_team,
    away_team: parsed.data.away_team,
    phase: parsed.data.phase ?? null
  });

  if (error) {
    redirect(redirectPath("/admin/matches", "error", error.message));
  }

  redirect(redirectPath("/admin/matches", "message", "Matchen är skapad."));
}

export async function updateMatchAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = matchInputSchema.safeParse(matchPayload(formData));

  if (!id) {
    redirect(redirectPath("/admin/matches", "error", "Saknar match-id."));
  }

  if (!parsed.success) {
    redirect(redirectPath("/admin/matches", "error", formError(parsed.error)));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("matches")
    .update({
      match_no: parsed.data.match_no,
      starts_at: parsed.data.starts_at ?? null,
      home_team: parsed.data.home_team,
      away_team: parsed.data.away_team,
      phase: parsed.data.phase ?? null
    })
    .eq("id", id);

  if (error) {
    redirect(redirectPath("/admin/matches", "error", error.message));
  }

  redirect(redirectPath("/admin/matches", "message", "Matchen är uppdaterad."));
}

export async function deleteMatchAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect(redirectPath("/admin/matches", "error", "Saknar match-id."));
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("matches").delete().eq("id", id);

  if (error) {
    redirect(redirectPath("/admin/matches", "error", error.message));
  }

  redirect(redirectPath("/admin/matches", "message", "Matchen är borttagen."));
}

export async function updateCompetitionLockAction(formData: FormData) {
  const { user } = await requireAdmin();
  const locked = formData.get("locked") === "on";
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("competition_settings")
    .update({
      locked,
      updated_by: user.id
    })
    .eq("id", true);

  if (error) {
    redirect(redirectPath("/admin/matches", "error", error.message));
  }

  redirect(
    redirectPath(
      "/admin/matches",
      "message",
      locked ? "Tävlingen är låst." : "Tävlingen är upplåst."
    )
  );
}
