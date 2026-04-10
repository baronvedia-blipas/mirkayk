import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  const parsed = projects.map((p) => ({
    ...p,
    agentIds: p.agentIds as string[],
  }));

  return NextResponse.json(parsed);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description,
      department: body.department,
      agentIds: body.agentIds || [],
    },
  });

  return NextResponse.json(
    { ...project, agentIds: project.agentIds as string[] },
    { status: 201 }
  );
}
