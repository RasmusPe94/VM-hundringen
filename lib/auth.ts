import { redirect } from "next/navigation";
import { getIsAdmin, getSelectedUserId } from "@/lib/cookies";
import { listPlayers } from "@/lib/db/data";

export type Profile = {
  id: string;
  display_name: string;
};

export async function getUserProfile() {
  const userId = getSelectedUserId();

  if (!userId) {
    return { user: null, profile: null };
  }

  try {
    const players = listPlayers();
    const player = players.find((p) => p.id === userId) ?? null;

    if (!player) return { user: null, profile: null };

    return {
      user: player,
      profile: { id: player.id, display_name: player.name }
    };
  } catch {
    return { user: null, profile: null };
  }
}

export async function requireUser() {
  const session = await getUserProfile();

  if (!session.user) redirect("/login");

  return session;
}

export async function requireAdmin() {
  if (!getIsAdmin()) redirect("/admin/login");

  return {};
}
