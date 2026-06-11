"use server";

import { redirect } from "next/navigation";
import { setIsAdmin } from "@/lib/cookies";
import { getAdminCode } from "@/lib/env";
import { redirectPath } from "@/lib/strings";

export async function adminLoginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const adminCode = getAdminCode();

  if (username !== adminCode) {
    redirect(redirectPath("/admin/login", "error", "Fel lösenord."));
  }

  setIsAdmin();
  redirect("/admin/bets");
}
