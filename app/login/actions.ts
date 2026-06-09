"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirectPath } from "@/lib/strings";

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirect(redirectPath("/login", "error", "Ange en e-postadress."));
  }

  if (!hasSupabaseEnv()) {
    redirect(
      redirectPath(
        "/login",
        "error",
        "Supabase-miljövariabler saknas. Se README.md."
      )
    );
  }

  const origin = headers().get("origin") ?? "http://localhost:3000";
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: false
    }
  });

  if (error) {
    redirect(redirectPath("/login", "error", error.message));
  }

  redirect(
    redirectPath(
      "/login",
      "message",
      "Kolla din mejl och öppna länken för att logga in."
    )
  );
}
