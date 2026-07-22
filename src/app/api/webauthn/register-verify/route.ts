import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { consumeChallenge, rpFromRequest } from "@/lib/webauthn-server";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { response: RegistrationResponseJSON; deviceName?: string };
  const expectedChallenge = await consumeChallenge();
  if (!expectedChallenge) {
    return NextResponse.json({ error: "Aucune tentative d'enregistrement en cours" }, { status: 400 });
  }
  const { rpID, origin } = rpFromRequest(req);

  try {
    const verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Vérification échouée" }, { status: 400 });
    }
    const { credential } = verification.registrationInfo;
    await prisma.passkey.create({
      data: {
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
        deviceName: body.deviceName ?? null,
      },
    });
    return NextResponse.json({ verified: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
