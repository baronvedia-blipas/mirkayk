import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // If setting active, deactivate all others first
  if (body.isActive === true) {
    await prisma.project.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.agentIds !== undefined) updateData.agentIds = body.agentIds;

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    ...project,
    agentIds: project.agentIds as string[],
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
