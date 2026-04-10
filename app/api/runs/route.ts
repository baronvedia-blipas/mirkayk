import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const runs = await prisma.run.findMany({
    orderBy: { startedAt: "desc" },
    include: { agent: { select: { name: true, color: true } } },
  });
  return NextResponse.json(runs);
}
