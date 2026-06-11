"use server";

import { redirect } from "next/navigation";
import { setIsAdmin } from "@/lib/cookies";
import { redirectPath } from "@/lib/strings";

export async function adminLoginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const adminCode = process.env.ADMIN_CODE ?? "admin";

  if (username !== adminCode) {
    redirect(redirectPath("/admin/login", "error", "Fel lösenord."));
  }

  setIsAdmin();
  redirect("/admin/bets");
}
