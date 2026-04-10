import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { name: "asc" },
  });

  const parsed = agents.map((a) => ({
    ...a,
    instructions: a.instructions as string[],
    skills: a.skills as string[],
  }));

  return NextResponse.json(parsed);
}
