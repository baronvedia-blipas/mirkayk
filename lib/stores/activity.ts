import { create } from "zustand";
import { ActivityEntry, AgentColor } from "@/lib/types";
import { MOCK_ACTIVITY } from "@/lib/mock/activity";
import { generateId } from "@/lib/utils";

const MAX_ENTRIES = 50;

interface ActivityStore {
  entries: ActivityEntry[];
  addEntry: (data: { agentId: string; agentName: string; agentColor: AgentColor; action: string }) => void;
  clear: () => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  entries: MOCK_ACTIVITY.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  addEntry: (data) =>
    set((state) => ({
      entries: [
        { id: generateId(), ...data, timestamp: new Date() },
        ...state.entries,
      ].slice(0, MAX_ENTRIES),
    })),
  clear: () => set({ entries: [] }),
}));
