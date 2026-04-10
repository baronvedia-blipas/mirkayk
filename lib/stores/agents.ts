import { create } from "zustand";
import { Agent, AgentStatus } from "@/lib/types";
import { MOCK_AGENTS } from "@/lib/mock/agents";

interface AgentStore {
  agents: Agent[];
  selectedAgentId: string | null;
  selectAgent: (id: string | null) => void;
  updateStatus: (id: string, status: AgentStatus, currentTask?: string | null) => void;
  updatePrompt: (id: string, systemPrompt: string) => void;
  updateInstructions: (id: string, instructions: string[]) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: MOCK_AGENTS,
  selectedAgentId: null,
  selectAgent: (id) => set({ selectedAgentId: id }),
  updateStatus: (id, status, currentTask) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, status, currentTask: currentTask !== undefined ? currentTask : a.currentTask } : a
      ),
    })),
  updatePrompt: (id, systemPrompt) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, systemPrompt } : a)),
    })),
  updateInstructions: (id, instructions) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, instructions } : a)),
    })),
}));
