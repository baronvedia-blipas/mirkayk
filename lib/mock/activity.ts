import { ActivityEntry } from "@/lib/types";

export const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "act-1", agentId: "agent-pm", agentName: "PM Agent", agentColor: "sage", action: "Assigned 'Design database schema' to Architect", timestamp: new Date("2026-04-10T08:01:00") },
  { id: "act-2", agentId: "agent-architect", agentName: "Architect", agentColor: "lavender", action: "Started working on database schema", timestamp: new Date("2026-04-10T08:02:00") },
  { id: "act-3", agentId: "agent-pm", agentName: "PM Agent", agentColor: "sage", action: "Created task: Build login page UI", timestamp: new Date("2026-04-10T08:15:00") },
  { id: "act-4", agentId: "agent-backend", agentName: "Backend", agentColor: "sand", action: "Completed JWT middleware implementation", timestamp: new Date("2026-04-09T16:30:00") },
  { id: "act-5", agentId: "agent-frontend", agentName: "Frontend", agentColor: "pink", action: "Completed responsive navigation sidebar", timestamp: new Date("2026-04-09T17:00:00") },
  { id: "act-6", agentId: "agent-qa", agentName: "QA", agentColor: "sky", action: "Started E2E tests for login flow", timestamp: new Date("2026-04-10T09:00:00") },
  { id: "act-7", agentId: "agent-pm", agentName: "PM Agent", agentColor: "sage", action: "Escalated: Backend blocked on auth schema", timestamp: new Date("2026-04-10T09:15:00") },
  { id: "act-8", agentId: "agent-architect", agentName: "Architect", agentColor: "lavender", action: "Completed component tree for dashboard", timestamp: new Date("2026-04-09T12:00:00") },
  { id: "act-9", agentId: "agent-devops", agentName: "DevOps", agentColor: "peach", action: "Configured GitHub Actions pipeline", timestamp: new Date("2026-04-10T08:45:00") },
  { id: "act-10", agentId: "agent-pm", agentName: "PM Agent", agentColor: "sage", action: "Sprint update: 3/10 tasks completed", timestamp: new Date("2026-04-10T10:00:00") },
  { id: "act-11", agentId: "agent-qa", agentName: "QA", agentColor: "sky", action: "BUG-001: Login button unresponsive on mobile", timestamp: new Date("2026-04-10T09:30:00") },
  { id: "act-12", agentId: "agent-frontend", agentName: "Frontend", agentColor: "pink", action: "Picked up: Build login page UI", timestamp: new Date("2026-04-10T10:15:00") },
  { id: "act-13", agentId: "agent-backend", agentName: "Backend", agentColor: "sand", action: "Started /api/auth endpoint implementation", timestamp: new Date("2026-04-10T09:35:00") },
  { id: "act-14", agentId: "agent-architect", agentName: "Architect", agentColor: "lavender", action: "Published API contract v2 for auth module", timestamp: new Date("2026-04-10T10:45:00") },
  { id: "act-15", agentId: "agent-pm", agentName: "PM Agent", agentColor: "sage", action: "Next 3 actions: finish schema, start login UI, deploy staging", timestamp: new Date("2026-04-10T11:00:00") },
];
