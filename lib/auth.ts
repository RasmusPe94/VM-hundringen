import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  display_name: string;
  role: "player" | "admin";
  starting_bankroll: number | string;
};

export async function getUserProfile() {
  if (!hasSupabaseEnv()) {
    return {
      user: null,
      profile: null,
      supabaseConfigured: false
    };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      supabaseConfigured: true
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role, starting_bankroll")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile as Profile | null,
    supabaseConfigured: true
  };
}

export async function requireUser() {
  const session = await getUserProfile();

  if (!session.supabaseConfigured) {
    redirect("/login?error=Supabase-miljovariabler saknas.");
  }

  if (!session.user) {
    redirect("/login");
  }

  return {
    user: session.user,
    profile: session.profile,
    supabaseConfigured: true
  };
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.profile?.role !== "admin") {
    redirect("/leaderboard");
  }

  return session;
}
