"use server";

import { redirect } from "next/navigation";
import { clearAuthToken } from "@/lib/pocketbase/client";

export async function signOutAction() {
  clearAuthToken();
  redirect("/login");
}
