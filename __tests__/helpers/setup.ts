import { PrismaClient } from "../../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { beforeEach, afterAll } from "vitest";

const TEST_DATABASE_URL =
  process.env.DATABASE_URL_TEST ||
  "postgresql://mirkayk:mirkayk_test@localhost:5434/mirkayk_test";

const adapter = new PrismaPg({ connectionString: TEST_DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

// Override so lib/db.ts would use test DB too
process.env.DATABASE_URL = TEST_DATABASE_URL;

async function cleanAndSeed() {
  // Delete in FK order
  await prisma.run.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.agent.deleteMany();

  // Seed fresh
  await prisma.agent.createMany({
    data: [
      {
        id: "agent-test-1",
        name: "Test Agent",
        role: "Tester",
        color: "sage",
        provider: "claude",
        model: "claude-sonnet-4-6",
        status: "idle",
        instructions: ["instruction 1"],
        skills: ["skill 1"],
      },
      {
        id: "agent-test-2",
        name: "Agent Two",
        role: "Developer",
        color: "pink",
        provider: "gemini",
        model: "gemini-2.5-pro",
        status: "active",
        instructions: [],
        skills: [],
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        id: "task-test-1",
        title: "Test Task",
        description: "A test task",
        status: "pending",
        priority: "P1",
        agentId: "agent-test-1",
      },
      {
        id: "task-test-2",
        title: "Completed Task",
        description: "Already done",
        status: "completed",
        priority: "P2",
        agentId: null,
        completedAt: new Date("2026-04-10T12:00:00Z"),
      },
    ],
  });

  await prisma.project.create({
    data: {
      id: "project-test-1",
      name: "Test Project",
      description: "For testing",
      department: "web2",
      agentIds: ["agent-test-1"],
      isActive: true,
    },
  });
}

// Clean and re-seed before EVERY test to avoid cross-test contamination
beforeEach(async () => {
  await cleanAndSeed();
});

afterAll(async () => {
  await prisma.run.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.$disconnect();
});
