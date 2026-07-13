import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAccount, serializeTransaction } from "@/lib/serialize";
import { newAccountSchema } from "@/lib/validation";

export async function GET() {
  const [rows, transactionRows] = await Promise.all([
    prisma.account.findMany({ where: { actif: true }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany(),
  ]);
  const transactions = transactionRows.map(serializeTransaction);
  return NextResponse.json({ accounts: rows.map((a) => serializeAccount(a, transactions)) });
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = newAccountSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const row = await prisma.account.create({ data: parsed.data });
  return NextResponse.json({ account: serializeAccount(row, []) });
}
