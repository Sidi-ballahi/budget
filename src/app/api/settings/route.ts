import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const row = await prisma.appSettings.findUnique({ where: { id: 1 } });
  if (!row) return NextResponse.json({ exists: false });
  return NextResponse.json({
    exists: true,
    accentColor: row.accentColor,
    aiSuggestions: row.aiSuggestions,
    autoLockMinutes: row.autoLockMinutes,
    pinHash: row.pinHash,
    pinSalt: row.pinSalt,
  });
}

// Body may contain a PIN change (pinHash/pinSalt, already hashed client-side —
// the plaintext PIN never leaves the device) and/or preference updates.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.pinHash === "string" && typeof body.pinSalt === "string") {
    data.pinHash = body.pinHash;
    data.pinSalt = body.pinSalt;
  }
  if (typeof body.accentColor === "string") data.accentColor = body.accentColor;
  if (typeof body.aiSuggestions === "boolean") data.aiSuggestions = body.aiSuggestions;
  if (typeof body.autoLockMinutes === "number") data.autoLockMinutes = body.autoLockMinutes;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no valid fields" }, { status: 400 });
  }

  const row = await prisma.appSettings.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      pinHash: (data.pinHash as string) ?? "",
      pinSalt: (data.pinSalt as string) ?? "",
      accentColor: (data.accentColor as string) ?? "oklch(0.72 0.14 150)",
      aiSuggestions: (data.aiSuggestions as boolean) ?? true,
      autoLockMinutes: (data.autoLockMinutes as number) ?? 2,
    },
  });

  return NextResponse.json({
    exists: true,
    accentColor: row.accentColor,
    aiSuggestions: row.aiSuggestions,
    autoLockMinutes: row.autoLockMinutes,
    pinHash: row.pinHash,
    pinSalt: row.pinSalt,
  });
}
