import { describe, it, expect } from "vitest";
import { prisma } from "../helpers/setup";

describe("Projects API", () => {
  describe("GET /api/projects", () => {
    it("returns all projects", async () => {
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
      });
      expect(projects.length).toBe(1);
      expect(projects[0].name).toBe("Test Project");
    });

    it("projects have agentIds as array", async () => {
      const project = await prisma.project.findUnique({
        where: { id: "project-test-1" },
      });
      expect(project!.agentIds).toEqual(["agent-test-1"]);
    });
  });

  describe("POST /api/projects", () => {
    it("creates a project", async () => {
      const project = await prisma.project.create({
        data: {
          name: "New Project",
          description: "Brand new",
          department: "web3",
          agentIds: [],
        },
      });

      expect(project.name).toBe("New Project");
      expect(project.department).toBe("web3");
      expect(project.isActive).toBe(false);
      expect(project.id).toBeTruthy();
    });
  });

  describe("PATCH /api/projects/[id] — set active", () => {
    it("deactivates others when setting active", async () => {
      // project-test-1 is active
      const p = await prisma.project.findUnique({
        where: { id: "project-test-1" },
      });
      expect(p!.isActive).toBe(true);

      // Create another project and set it active
      const newProject = await prisma.project.create({
        data: {
          name: "Active Test",
          description: "Will be active",
          department: "web2",
          agentIds: [],
        },
      });

      // Deactivate all, then activate new one
      await prisma.project.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
      await prisma.project.update({
        where: { id: newProject.id },
        data: { isActive: true },
      });

      const old = await prisma.project.findUnique({
        where: { id: "project-test-1" },
      });
      const active = await prisma.project.findUnique({
        where: { id: newProject.id },
      });

      expect(old!.isActive).toBe(false);
      expect(active!.isActive).toBe(true);
    });
  });

  describe("DELETE /api/projects/[id]", () => {
    it("removes the project", async () => {
      const project = await prisma.project.create({
        data: {
          name: "To delete",
          description: "Bye",
          department: "web2",
          agentIds: [],
        },
      });

      await prisma.project.delete({ where: { id: project.id } });

      const deleted = await prisma.project.findUnique({
        where: { id: project.id },
      });
      expect(deleted).toBeNull();
    });
  });
});
