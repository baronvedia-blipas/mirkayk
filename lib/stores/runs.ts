import { create } from "zustand";
import { AgentRun } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { useAgentStore } from "./agents";
import { useActivityStore } from "./activity";
import { useTaskStore } from "./tasks";

interface RunsStore {
  runs: AgentRun[];
  activeRunByAgent: Record<string, string>; // agentId → runId
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  startRun(agentId: string, taskId: string | null, prompt: string): string;
  appendOutput(runId: string, content: string): void;
  completeRun(runId: string, status: "completed" | "failed"): void;
  getRun(runId: string): AgentRun | undefined;
  getActiveRun(agentId: string): AgentRun | undefined;
}

export const useRunsStore = create<RunsStore>((set, get) => ({
  runs: [],
  activeRunByAgent: {},
  isHydrated: false,

  hydrate: async () => {
    const res = await fetch("/api/runs");
    const runs = await res.json();
    const parsed: AgentRun[] = runs.map((r: Record<string, unknown>) => ({
      id: r.id,
      agentId: r.agentId,
      taskId: r.taskId || null,
      input: r.input,
      output: (r.output as string) || "",
      tokensUsed: 0,
      costUsd: 0,
      status: r.status as AgentRun["status"],
      startedAt: new Date(r.startedAt as string),
      completedAt: r.endedAt ? new Date(r.endedAt as string) : null,
    }));
    set({ runs: parsed, isHydrated: true });
  },

  startRun: (agentId, taskId, prompt) => {
    const runId = generateId();
    const newRun: AgentRun = {
      id: runId,
      agentId,
      taskId,
      input: prompt,
      output: "",
      tokensUsed: 0,
      costUsd: 0,
      status: "running",
      startedAt: new Date(),
      completedAt: null,
    };

    set((state) => ({
      runs: [newRun, ...state.runs],
      activeRunByAgent: { ...state.activeRunByAgent, [agentId]: runId },
    }));

    useAgentStore.getState().updateStatus(agentId, "working", prompt.slice(0, 60));

    const agent = useAgentStore.getState().agents.find((a) => a.id === agentId);
    if (agent) {
      useActivityStore.getState().addEntry({
        agentId: agent.id,
        agentName: agent.name,
        agentColor: agent.color,
        action: `Started working on: ${prompt.slice(0, 80)}`,
      });
    }

    return runId;
  },

  appendOutput: (runId, content) => {
    set((state) => ({
      runs: state.runs.map((r) =>
        r.id === runId ? { ...r, output: (r.output ?? "") + content } : r
      ),
    }));
  },

  completeRun: (runId, status) => {
    const run = get().runs.find((r) => r.id === runId);
    if (!run) return;

    set((state) => {
      const { [run.agentId]: _, ...remainingActive } = state.activeRunByAgent;
      return {
        runs: state.runs.map((r) =>
          r.id === runId ? { ...r, status, completedAt: new Date() } : r
        ),
        activeRunByAgent: remainingActive,
      };
    });

    useAgentStore.getState().updateStatus(run.agentId, "idle", null);

    const agent = useAgentStore.getState().agents.find((a) => a.id === run.agentId);
    if (agent) {
      const prefix = status === "completed" ? "Completed:" : "Failed:";
      useActivityStore.getState().addEntry({
        agentId: agent.id,
        agentName: agent.name,
        agentColor: agent.color,
        action: `${prefix} ${run.input.slice(0, 80)}`,
      });
    }

    if (run.taskId && status === "completed") {
      useTaskStore.getState().completeTask(run.taskId);
    }
  },

  getRun: (runId) => get().runs.find((r) => r.id === runId),

  getActiveRun: (agentId) => {
    const runId = get().activeRunByAgent[agentId];
    if (!runId) return undefined;
    return get().runs.find((r) => r.id === runId);
  },
}));
