import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.currentTask !== undefined) updateData.currentTask = body.currentTask;
  if (body.systemPrompt !== undefined) updateData.systemPrompt = body.systemPrompt;
  if (body.instructions !== undefined) updateData.instructions = body.instructions;

  const agent = await prisma.agent.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    ...agent,
    instructions: agent.instructions as string[],
    skills: agent.skills as string[],
  });
}
