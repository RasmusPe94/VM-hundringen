"use server";

import { redirect } from "next/navigation";
import { setSelectedUserId } from "@/lib/cookies";
import { createPlayer, listPlayers } from "@/lib/db/data";
import { redirectPath } from "@/lib/strings";

export async function selectUserAction(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "").trim();
  if (!userId) redirect(redirectPath("/login", "error", "Välj vem du är."));

  const players = listPlayers();
  const player = players.find((p) => p.id === userId);
  if (!player) redirect(redirectPath("/login", "error", "Spelaren hittades inte."));

  setSelectedUserId(userId);
  redirect("/leaderboard");
}

export async function addUserAction(formData: FormData) {
  const name = String(formData.get("display_name") ?? "").trim();
  if (!name) redirect(redirectPath("/login", "error", "Ange ett namn."));

  try {
    const player = createPlayer(name);
    setSelectedUserId(player.id);
  } catch (e) {
    redirect(redirectPath("/login", "error", e instanceof Error ? e.message : "Kunde inte skapa spelare."));
  }

  redirect("/leaderboard");
}
