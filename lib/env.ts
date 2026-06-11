export function hasPocketBaseEnv() {
  return Boolean(process.env.POCKETBASE_URL);
}

export function getPocketBaseEnv() {
  const url = process.env.POCKETBASE_URL;

  if (!url) {
    throw new Error("Missing POCKETBASE_URL.");
  }

  return { url: url.replace(/\/$/, "") };
}

export function getPocketBaseAdminToken() {
  return process.env.POCKETBASE_ADMIN_TOKEN ?? null;
}
