import { Project, Provider } from "@/lib/types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "project-1",
    name: "mirkayk v1",
    description: "AI agent orchestration dashboard — Phase 1 UI build",
    department: "web2",
    agentIds: ["agent-pm", "agent-architect", "agent-frontend", "agent-backend", "agent-qa", "agent-devops"],
    createdAt: new Date("2026-04-09T08:00:00"),
  },
];

export const MOCK_PROVIDERS: Provider[] = [
  { id: "prov-claude", name: "claude", connected: true, connectedAt: new Date("2026-04-09T07:00:00") },
  { id: "prov-codex", name: "codex", connected: true, connectedAt: new Date("2026-04-09T07:05:00") },
  { id: "prov-gemini", name: "gemini", connected: false, connectedAt: null },
];
