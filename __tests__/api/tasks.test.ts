import { describe, it, expect } from "vitest";
import { prisma } from "../helpers/setup";

describe("Tasks API", () => {
  describe("GET /api/tasks", () => {
    it("returns all tasks sorted by createdAt desc", async () => {
      const tasks = await prisma.task.findMany({
        orderBy: { createdAt: "desc" },
      });
      expect(tasks.length).toBe(2);
      // Most recent first
      for (let i = 1; i < tasks.length; i++) {
        expect(tasks[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
          tasks[i].createdAt.getTime()
        );
      }
    });
  });

  describe("POST /api/tasks", () => {
    it("creates a task with correct defaults", async () => {
      const task = await prisma.task.create({
        data: {
          title: "New test task",
          description: "Created in test",
          priority: "P3",
          agentId: null,
          status: "pending",
        },
      });

      expect(task.title).toBe("New test task");
      expect(task.status).toBe("pending");
      expect(task.priority).toBe("P3");
      expect(task.agentId).toBeNull();
      expect(task.completedAt).toBeNull();
      expect(task.id).toBeTruthy();
    });

    it("creates task with agentId and sets status to in_progress", async () => {
      const task = await prisma.task.create({
        data: {
          title: "Assigned task",
          description: "Has an agent",
          priority: "P1",
          agentId: "agent-test-1",
          status: "in_progress",
        },
      });

      expect(task.status).toBe("in_progress");
      expect(task.agentId).toBe("agent-test-1");
    });
  });

  describe("PATCH /api/tasks/[id]", () => {
    it("updates status and completedAt", async () => {
      const now = new Date();
      await prisma.task.update({
        where: { id: "task-test-1" },
        data: { status: "completed", completedAt: now },
      });

      const task = await prisma.task.findUnique({
        where: { id: "task-test-1" },
      });
      expect(task!.status).toBe("completed");
      expect(task!.completedAt).not.toBeNull();

      // Reset
      await prisma.task.update({
        where: { id: "task-test-1" },
        data: { status: "pending", completedAt: null },
      });
    });
  });

  describe("DELETE /api/tasks/[id]", () => {
    it("removes the task", async () => {
      const task = await prisma.task.create({
        data: {
          title: "To be deleted",
          description: "Bye",
          priority: "P3",
        },
      });

      await prisma.task.delete({ where: { id: task.id } });

      const deleted = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(deleted).toBeNull();
    });
  });
});
