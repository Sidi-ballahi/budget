import type { NextRequest } from "next/server";
import { prisma } from "./prisma";

// Single-user app: relying party identity is derived from the request itself
// (works for localhost dev and whatever domain it's deployed on) rather than
// a hardcoded value.
export function rpFromRequest(req: NextRequest): { rpID: string; origin: string } {
  return { rpID: req.nextUrl.hostname, origin: req.nextUrl.origin };
}

export async function storeChallenge(challenge: string): Promise<void> {
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: { webauthnChallenge: challenge },
    create: { id: 1, pinHash: "", pinSalt: "", webauthnChallenge: challenge },
  });
}

export async function consumeChallenge(): Promise<string | null> {
  const row = await prisma.appSettings.findUnique({ where: { id: 1 } });
  if (!row?.webauthnChallenge) return null;
  await prisma.appSettings.update({ where: { id: 1 }, data: { webauthnChallenge: null } });
  return row.webauthnChallenge;
}
