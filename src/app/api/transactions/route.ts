import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTransaction } from "@/lib/serialize";
import { newTransactionSchema } from "@/lib/validation";
import { upsertTransactionByClientId } from "@/lib/create-transaction";

export async function GET() {
  const rows = await prisma.transaction.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json({ transactions: rows.map(serializeTransaction) });
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = newTransactionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const transaction = await upsertTransactionByClientId(parsed.data);
  return NextResponse.json({ transaction });
}
