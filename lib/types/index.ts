export type ProviderName = "claude" | "codex" | "gemini";
export type AgentStatus = "idle" | "active" | "working";
export type TaskPriority = "P1" | "P2" | "P3";
export type TaskStatus = "pending" | "in_progress" | "completed" | "failed";
export type RunStatus = "running" | "completed" | "failed";
export type AgentColor = "sage" | "lavender" | "pink" | "sand" | "sky" | "peach";

export interface Provider {
  id: string;
  name: ProviderName;
  connected: boolean;
  connectedAt: Date | null;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  color: AgentColor;
  provider: ProviderName;
  model: string;
  status: AgentStatus;
  currentTask: string | null;
  systemPrompt: string;
  instructions: string[];
  skills: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  agentId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  completedAt: Date | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  department: "web2" | "web3";
  agentIds: string[];
  createdAt: Date;
}

export interface AgentRun {
  id: string;
  agentId: string;
  taskId: string | null;
  input: string;
  output: string | null;
  tokensUsed: number;
  costUsd: number;
  status: RunStatus;
  startedAt: Date;
  completedAt: Date | null;
}

export interface ActivityEntry {
  id: string;
  agentId: string;
  agentName: string;
  agentColor: AgentColor;
  action: string;
  timestamp: Date;
}

export const AGENT_COLOR_MAP: Record<AgentColor, { bg: string; text: string }> = {
  sage: { bg: "bg-sage-100", text: "text-sage-200" },
  lavender: { bg: "bg-lavender-100", text: "text-lavender-200" },
  pink: { bg: "bg-pink-100", text: "text-pink-300" },
  sand: { bg: "bg-sand-100", text: "text-sand-200" },
  sky: { bg: "bg-sky-100", text: "text-blue-600" },
  peach: { bg: "bg-peach-100", text: "text-orange-600" },
};

export const PROVIDER_INFO: Record<ProviderName, { label: string; company: string; hint: string; icon: string; iconBg: string }> = {
  claude: { label: "Claude", company: "Anthropic", hint: "Max, Pro or API key", icon: "A", iconBg: "bg-amber-100 text-amber-700" },
  codex: { label: "Codex", company: "OpenAI", hint: "ChatGPT Plus or API key", icon: "✨", iconBg: "bg-gray-900 text-white" },
  gemini: { label: "Gemini", company: "Google", hint: "Gemini Advanced or API key", icon: "G", iconBg: "bg-blue-50 text-blue-600" },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  P1: { label: "P1", color: "bg-red-100 text-red-700" },
  P2: { label: "P2", color: "bg-amber-100 text-amber-700" },
  P3: { label: "P3", color: "bg-green-100 text-green-700" },
};

export const STATUS_CONFIG: Record<AgentStatus, { label: string; dotColor: string }> = {
  idle: { label: "idle", dotColor: "bg-text-500" },
  active: { label: "active", dotColor: "bg-sage-200" },
  working: { label: "working", dotColor: "bg-pink-300" },
};
