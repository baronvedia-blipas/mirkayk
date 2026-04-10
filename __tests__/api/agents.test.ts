import { describe, it, expect } from "vitest";
import { prisma } from "../helpers/setup";

describe("Agents API", () => {
  describe("GET /api/agents", () => {
    it("returns all agents from DB", async () => {
      const agents = await prisma.agent.findMany({
        orderBy: { name: "asc" },
      });
      expect(agents.length).toBe(2);
      // Sorted by name: "Agent Two" comes before "Test Agent"
      expect(agents[0].name).toBe("Agent Two");
      expect(agents[1].name).toBe("Test Agent");
    });

    it("agents have correct fields", async () => {
      const agent = await prisma.agent.findUnique({
        where: { id: "agent-test-1" },
      });
      expect(agent).not.toBeNull();
      expect(agent!.name).toBe("Test Agent");
      expect(agent!.role).toBe("Tester");
      expect(agent!.color).toBe("sage");
      expect(agent!.provider).toBe("claude");
      expect(agent!.status).toBe("idle");
      expect(agent!.instructions).toEqual(["instruction 1"]);
      expect(agent!.skills).toEqual(["skill 1"]);
    });
  });

  describe("PATCH /api/agents/[id]", () => {
    it("updates agent status", async () => {
      await prisma.agent.update({
        where: { id: "agent-test-1" },
        data: { status: "working", currentTask: "Testing something" },
      });

      const agent = await prisma.agent.findUnique({
        where: { id: "agent-test-1" },
      });
      expect(agent!.status).toBe("working");
      expect(agent!.currentTask).toBe("Testing something");

      // Reset
      await prisma.agent.update({
        where: { id: "agent-test-1" },
        data: { status: "idle", currentTask: null },
      });
    });

    it("updates agent systemPrompt", async () => {
      const newPrompt = "You are a test agent.";
      await prisma.agent.update({
        where: { id: "agent-test-1" },
        data: { systemPrompt: newPrompt },
      });

      const agent = await prisma.agent.findUnique({
        where: { id: "agent-test-1" },
      });
      expect(agent!.systemPrompt).toBe(newPrompt);

      // Reset
      await prisma.agent.update({
        where: { id: "agent-test-1" },
        data: { systemPrompt: "" },
      });
    });

    it("updates agent instructions", async () => {
      const newInstructions = ["new instruction 1", "new instruction 2"];
      await prisma.agent.update({
        where: { id: "agent-test-1" },
        data: { instructions: newInstructions },
      });

      const agent = await prisma.agent.findUnique({
        where: { id: "agent-test-1" },
      });
      expect(agent!.instructions).toEqual(newInstructions);

      // Reset
      await prisma.agent.update({
        where: { id: "agent-test-1" },
        data: { instructions: ["instruction 1"] },
      });
    });
  });
});
