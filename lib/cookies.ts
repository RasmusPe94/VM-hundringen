import { cookies } from "next/headers";

const USER_COOKIE = "vm_user_id";
const ADMIN_COOKIE = "vm_is_admin";

const COOKIE_OPTS = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production"
};

// Admin session expires when the browser is closed (no maxAge)
const ADMIN_COOKIE_OPTS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production"
};

export function getSelectedUserId() {
  return cookies().get(USER_COOKIE)?.value ?? null;
}

export function setSelectedUserId(id: string) {
  cookies().set(USER_COOKIE, id, COOKIE_OPTS);
}

export function clearSelectedUserId() {
  cookies().delete(USER_COOKIE);
}

export function getIsAdmin() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

export function setIsAdmin() {
  cookies().set(ADMIN_COOKIE, "1", ADMIN_COOKIE_OPTS);
}

export function clearIsAdmin() {
  cookies().delete(ADMIN_COOKIE);
}
