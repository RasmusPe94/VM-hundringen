"use server";

import { redirect } from "next/navigation";
import { hasPocketBaseEnv } from "@/lib/env";
import { setAuthToken } from "@/lib/pocketbase/client";
import { authWithUsername } from "@/lib/pocketbase/data";
import { redirectPath } from "@/lib/strings";

export async function signInAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    redirect(redirectPath("/login", "error", "Ange användare och lösenord."));
  }

  if (!hasPocketBaseEnv()) {
    redirect(
      redirectPath(
        "/login",
        "error",
        "PocketBase-miljövariabel saknas. Se README.md."
      )
    );
  }

  try {
    const auth = await authWithUsername(username, password);
    setAuthToken(auth.token);
  } catch (error) {
    redirect(
      redirectPath(
        "/login",
        "error",
        error instanceof Error ? error.message : "Kunde inte logga in."
      )
    );
  }

  redirect("/leaderboard");
}
