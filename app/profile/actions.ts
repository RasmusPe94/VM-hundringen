"use server";

import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import { requireUser } from "@/lib/auth";
import { setPlayerAvatar, updatePlayer } from "@/lib/db/data";
import { redirectPath } from "@/lib/strings";

const DATA_DIR = process.env.DATABASE_PATH
  ? path.dirname(process.env.DATABASE_PATH)
  : path.join(process.cwd(), "data");

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function updateNameAction(formData: FormData) {
  const { user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect(redirectPath("/profile", "error", "Ange ett namn."));

  try {
    updatePlayer(user.id, name);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("UNIQUE constraint failed")) {
      redirect(redirectPath("/profile", "error", `Namnet "${name}" är redan taget.`));
    }
    throw e;
  }

  redirect(redirectPath("/profile", "message", "Namnet uppdaterat!"));
}

export async function uploadAvatarAction(formData: FormData) {
  const { user } = await requireUser();
  const file = formData.get("avatar") as File | null;

  if (!file || file.size === 0) {
    redirect(redirectPath("/profile", "error", "Välj en bild."));
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    redirect(redirectPath("/profile", "error", "Tillåtna format: JPG, PNG, WebP, GIF."));
  }

  if (file.size > MAX_BYTES) {
    redirect(redirectPath("/profile", "error", "Bilden får max vara 5 MB."));
  }

  const avatarsDir = path.join(DATA_DIR, "avatars");
  fs.mkdirSync(avatarsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(avatarsDir, `${user.id}.${ext}`);

  // Remove old avatar files with other extensions
  for (const oldExt of Object.values(ALLOWED_TYPES)) {
    const old = path.join(avatarsDir, `${user.id}.${oldExt}`);
    if (old !== filePath && fs.existsSync(old)) fs.unlinkSync(old);
  }

  fs.writeFileSync(filePath, buffer);
  setPlayerAvatar(user.id, ext);

  redirect(redirectPath("/profile", "message", "Profilbild uppdaterad!"));
}

export async function removeAvatarAction() {
  const { user } = await requireUser();
  const avatarsDir = path.join(DATA_DIR, "avatars");

  for (const ext of Object.values(ALLOWED_TYPES)) {
    const f = path.join(avatarsDir, `${user.id}.${ext}`);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }

  setPlayerAvatar(user.id, null);
  redirect(redirectPath("/profile", "message", "Profilbild borttagen."));
}
