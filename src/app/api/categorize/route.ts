import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serialize";
import { suggestCategoryLocal } from "@/lib/finance";
import { suggestCategoryAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { label } = await req.json();
  if (typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ categoryId: null, source: "local" });
  }

  const categoryRows = await prisma.category.findMany();
  const categories = categoryRows.map(serializeCategory);

  const aiResult = await suggestCategoryAI(label, categories);
  if (aiResult) {
    return NextResponse.json({ categoryId: aiResult, source: "ai" });
  }

  const localResult = suggestCategoryLocal(label, categories);
  return NextResponse.json({ categoryId: localResult, source: "local" });
}
