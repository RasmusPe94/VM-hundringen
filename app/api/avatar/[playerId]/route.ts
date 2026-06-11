import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db/client";

const DATA_DIR = process.env.DATABASE_PATH
  ? path.dirname(process.env.DATABASE_PATH)
  : path.join(process.cwd(), "data");

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { playerId: string } }
) {
  const { playerId } = params;

  const row = getDb()
    .prepare("SELECT avatar_ext FROM players WHERE id = ?")
    .get(playerId) as { avatar_ext: string | null } | undefined;

  if (!row?.avatar_ext) {
    return new NextResponse(null, { status: 404 });
  }

  const filePath = path.join(DATA_DIR, "avatars", `${playerId}.${row.avatar_ext}`);
  if (!fs.existsSync(filePath)) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const mime = MIME[row.avatar_ext] ?? "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
