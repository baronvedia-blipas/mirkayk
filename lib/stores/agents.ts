import { create } from "zustand";
import { Agent, AgentStatus } from "@/lib/types";

interface AgentStore {
  agents: Agent[];
  selectedAgentId: string | null;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  selectAgent: (id: string | null) => void;
  updateStatus: (id: string, status: AgentStatus, currentTask?: string | null) => void;
  updatePrompt: (id: string, systemPrompt: string) => void;
  updateInstructions: (id: string, instructions: string[]) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  selectedAgentId: null,
  isHydrated: false,

  hydrate: async () => {
    const res = await fetch("/api/agents");
    const agents = await res.json();
    set({ agents, isHydrated: true });
  },

  selectAgent: (id) => set({ selectedAgentId: id }),

  updateStatus: (id, status, currentTask) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id
          ? { ...a, status, currentTask: currentTask !== undefined ? currentTask : a.currentTask }
          : a
      ),
    }));
    fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, currentTask: currentTask ?? null }),
    });
  },

  updatePrompt: (id, systemPrompt) => {
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, systemPrompt } : a)),
    }));
    fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt }),
    });
  },

  updateInstructions: (id, instructions) => {
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, instructions } : a)),
    }));
    fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructions }),
    });
  },
}));
