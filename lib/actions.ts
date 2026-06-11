"use server";

import { redirect } from "next/navigation";
import { clearIsAdmin, clearSelectedUserId } from "@/lib/cookies";

export async function signOutAction() {
  clearSelectedUserId();
  redirect("/login");
}

export async function adminSignOutAction() {
  clearIsAdmin();
  redirect("/");
}
