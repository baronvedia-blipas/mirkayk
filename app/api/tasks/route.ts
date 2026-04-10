import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority || "P2",
      agentId: body.agentId || null,
      status: body.agentId ? "in_progress" : "pending",
    },
  });

  return NextResponse.json(task, { status: 201 });
}
