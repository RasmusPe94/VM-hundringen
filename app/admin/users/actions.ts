"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { deletePlayer, updatePlayer } from "@/lib/db/data";
import { redirectPath } from "@/lib/strings";

export async function updateUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("display_name") ?? "").trim();

  if (!id || !name) redirect(redirectPath("/admin/users", "error", "Namn krävs."));

  try {
    await updatePlayer(id, name);
  } catch (error) {
    redirect(redirectPath("/admin/users", "error", error instanceof Error ? error.message : "Kunde inte uppdatera."));
  }

  redirect(redirectPath("/admin/users", "message", `${name} uppdaterad.`));
}

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (!id) redirect(redirectPath("/admin/users", "error", "Saknar id."));

  try {
    await deletePlayer(id);
  } catch (error) {
    redirect(redirectPath("/admin/users", "error", error instanceof Error ? error.message : "Kunde inte ta bort spelare."));
  }

  redirect(redirectPath("/admin/users", "message", "Spelare borttagen."));
}
