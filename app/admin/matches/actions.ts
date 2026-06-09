"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createMatch,
  deleteMatch,
  setCompetitionLocked,
  updateMatch
} from "@/lib/pocketbase/data";
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

  try {
    await createMatch({
      away_team: parsed.data.away_team,
      home_team: parsed.data.home_team,
      match_no: parsed.data.match_no,
      phase: parsed.data.phase,
      starts_at: parsed.data.starts_at
    });
  } catch (error) {
    redirect(
      redirectPath(
        "/admin/matches",
        "error",
        error instanceof Error ? error.message : "Matchen kunde inte skapas."
      )
    );
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

  try {
    await updateMatch(id, {
      away_team: parsed.data.away_team,
      home_team: parsed.data.home_team,
      match_no: parsed.data.match_no,
      phase: parsed.data.phase,
      starts_at: parsed.data.starts_at
    });
  } catch (error) {
    redirect(
      redirectPath(
        "/admin/matches",
        "error",
        error instanceof Error ? error.message : "Matchen kunde inte uppdateras."
      )
    );
  }

  redirect(redirectPath("/admin/matches", "message", "Matchen är uppdaterad."));
}

export async function deleteMatchAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect(redirectPath("/admin/matches", "error", "Saknar match-id."));
  }

  try {
    await deleteMatch(id);
  } catch (error) {
    redirect(
      redirectPath(
        "/admin/matches",
        "error",
        error instanceof Error ? error.message : "Matchen kunde inte tas bort."
      )
    );
  }

  redirect(redirectPath("/admin/matches", "message", "Matchen är borttagen."));
}

export async function updateCompetitionLockAction(formData: FormData) {
  const { user } = await requireAdmin();
  const locked = formData.get("locked") === "on";
  try {
    await setCompetitionLocked(locked, user.id);
  } catch (error) {
    redirect(
      redirectPath(
        "/admin/matches",
        "error",
        error instanceof Error ? error.message : "Låset kunde inte sparas."
      )
    );
  }

  redirect(
    redirectPath(
      "/admin/matches",
      "message",
      locked ? "Tävlingen är låst." : "Tävlingen är upplåst."
    )
  );
}
