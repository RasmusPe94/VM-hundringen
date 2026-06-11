export function getAdminCode(): string {
  return process.env.ADMIN_CODE ?? "admin";
}
