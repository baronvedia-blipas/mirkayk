import { describe, it, expect } from "vitest";
import { prisma } from "../helpers/setup";

describe("Runs API", () => {
  describe("GET /api/runs", () => {
    it("returns empty array when no runs", async () => {
      const runs = await prisma.run.findMany();
      expect(runs).toEqual([]);
    });

    it("returns runs with agent relation", async () => {
      // Create a run
      await prisma.run.create({
        data: {
          agentId: "agent-test-1",
          input: "Test prompt",
          output: "Test output",
          status: "completed",
          endedAt: new Date(),
        },
      });

      const runs = await prisma.run.findMany({
        orderBy: { startedAt: "desc" },
        include: { agent: { select: { name: true, color: true } } },
      });

      expect(runs.length).toBe(1);
      expect(runs[0].input).toBe("Test prompt");
      expect(runs[0].output).toBe("Test output");
      expect(runs[0].status).toBe("completed");
      expect(runs[0].agent.name).toBe("Test Agent");
      expect(runs[0].agent.color).toBe("sage");
    });
  });
});
