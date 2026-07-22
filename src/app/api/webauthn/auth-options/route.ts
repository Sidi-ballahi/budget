import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { rpFromRequest, storeChallenge } from "@/lib/webauthn-server";

export async function GET(req: NextRequest) {
  const { rpID } = rpFromRequest(req);
  const passkeys = await prisma.passkey.findMany();
  if (passkeys.length === 0) {
    return NextResponse.json({ error: "Aucune clé d'accès enregistrée" }, { status: 404 });
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: passkeys.map((p) => ({ id: p.credentialId })),
    userVerification: "preferred",
  });

  await storeChallenge(options.challenge);
  return NextResponse.json(options);
}
