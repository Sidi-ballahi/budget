import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { newTransactionSchema } from "@/lib/validation";
import { upsertTransactionByClientId } from "@/lib/create-transaction";

const syncBodySchema = z.object({
  transactions: z.array(newTransactionSchema),
});

// Replays a batch of offline-queued writes. Each item is idempotent on
// clientId (last-write-wins is moot here since offline transactions are
// create-only in V1 — see cahier des charges 4.2).
export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = syncBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const results = [];
  for (const item of parsed.data.transactions) {
    try {
      const transaction = await upsertTransactionByClientId(item);
      results.push({ clientId: item.clientId, ok: true, transaction });
    } catch (err) {
      results.push({ clientId: item.clientId, ok: false, error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
