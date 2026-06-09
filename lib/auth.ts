import { redirect } from "next/navigation";
import { hasPocketBaseEnv } from "@/lib/env";
import { getAuthToken } from "@/lib/pocketbase/client";
import { refreshUserAuth } from "@/lib/pocketbase/data";

export type Profile = {
  id: string;
  display_name: string;
  role: "player" | "admin";
  starting_bankroll: number | string;
};

export async function getUserProfile() {
  if (!hasPocketBaseEnv()) {
    return {
      user: null,
      profile: null,
      pocketBaseConfigured: false
    };
  }

  const token = getAuthToken();

  if (!token) {
    return {
      user: null,
      profile: null,
      pocketBaseConfigured: true
    };
  }

  try {
    const { record } = await refreshUserAuth(token);
    const profile = {
      display_name: record.display_name || record.username,
      id: record.id,
      role: record.role,
      starting_bankroll: record.starting_bankroll
    } satisfies Profile;

    return {
      user: record,
      profile,
      pocketBaseConfigured: true
    };
  } catch {
    return {
      user: null,
      profile: null,
      pocketBaseConfigured: true
    };
  }
}

export async function requireUser() {
  const session = await getUserProfile();

  if (!session.pocketBaseConfigured) {
    redirect("/login?error=PocketBase-miljovariabel saknas.");
  }

  if (!session.user) {
    redirect("/login");
  }

  return {
    user: session.user,
    profile: session.profile,
    pocketBaseConfigured: true
  };
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.profile?.role !== "admin") {
    redirect("/leaderboard");
  }

  return session;
}
