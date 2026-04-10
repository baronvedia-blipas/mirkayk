import { CLIConfig } from "@/lib/types";

export const AGENT_CLI_CONFIG: Record<string, CLIConfig> = {
  "agent-pm":        { provider: "claude", model: "claude-sonnet-4-6" },
  "agent-architect": { provider: "claude", model: "claude-opus-4-6" },
  "agent-frontend":  { provider: "claude", model: "claude-sonnet-4-6" },
  "agent-backend":   { provider: "claude", model: "claude-sonnet-4-6" },   // fallback from codex
  "agent-qa":        { provider: "claude", model: "claude-sonnet-4-6" },   // fallback from codex
  "agent-devops":    { provider: "gemini", model: "gemini-2.5-pro" },
};

export function getAgentCLIConfig(agentId: string): CLIConfig | undefined {
  return AGENT_CLI_CONFIG[agentId];
}
