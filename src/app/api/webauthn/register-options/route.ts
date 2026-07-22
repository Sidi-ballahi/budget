import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { rpFromRequest, storeChallenge } from "@/lib/webauthn-server";

export async function GET(req: NextRequest) {
  const { rpID } = rpFromRequest(req);
  const existing = await prisma.passkey.findMany();

  const options = await generateRegistrationOptions({
    rpName: "Dépenses",
    rpID,
    userName: "Sidi",
    attestationType: "none",
    excludeCredentials: existing.map((p) => ({ id: p.credentialId })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred", authenticatorAttachment: "platform" },
  });

  await storeChallenge(options.challenge);
  return NextResponse.json(options);
}
