import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { consumeChallenge, rpFromRequest } from "@/lib/webauthn-server";

export async function POST(req: NextRequest) {
  const response = (await req.json()) as AuthenticationResponseJSON;
  const expectedChallenge = await consumeChallenge();
  if (!expectedChallenge) {
    return NextResponse.json({ error: "Aucune tentative de connexion en cours" }, { status: 400 });
  }
  const passkey = await prisma.passkey.findUnique({ where: { credentialId: response.id } });
  if (!passkey) {
    return NextResponse.json({ error: "Clé d'accès inconnue" }, { status: 400 });
  }
  const { rpID, origin } = rpFromRequest(req);

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialId,
        publicKey: new Uint8Array(passkey.publicKey),
        counter: Number(passkey.counter),
      },
    });
    if (!verification.verified) {
      return NextResponse.json({ error: "Vérification échouée" }, { status: 400 });
    }
    await prisma.passkey.update({
      where: { id: passkey.id },
      data: { counter: verification.authenticationInfo.newCounter },
    });
    return NextResponse.json({ verified: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
