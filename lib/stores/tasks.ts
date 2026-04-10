import { create } from "zustand";
import { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { useAgentStore } from "./agents";
import { useActivityStore } from "./activity";

interface TaskStore {
  tasks: Task[];
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  createTask: (data: { title: string; description: string; agentId: string | null; priority: TaskPriority }) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateStatus: (id: string, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isHydrated: false,

  hydrate: async () => {
    const res = await fetch("/api/tasks");
    const tasks = await res.json();
    const parsed = tasks.map((t: Record<string, unknown>) => ({
      ...t,
      createdAt: new Date(t.createdAt as string),
      completedAt: t.completedAt ? new Date(t.completedAt as string) : null,
    }));
    set({ tasks: parsed, isHydrated: true });
  },

  createTask: (data) => {
    const tempId = crypto.randomUUID();
    const newTask: Task = {
      id: tempId,
      ...data,
      status: data.agentId ? "in_progress" : "pending",
      createdAt: new Date(),
      completedAt: null,
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));

    // Cross-store effects
    if (data.agentId) {
      const agent = useAgentStore.getState().agents.find((a) => a.id === data.agentId);
      if (agent) {
        useAgentStore.getState().updateStatus(data.agentId, "working", data.title);
        useActivityStore.getState().addEntry({
          agentId: agent.id,
          agentName: agent.name,
          agentColor: agent.color,
          action: `Started working on: ${data.title}`,
        });
      }
    }

    // Persist and replace temp ID
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((real) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === tempId
              ? { ...real, createdAt: new Date(real.createdAt), completedAt: real.completedAt ? new Date(real.completedAt) : null }
              : t
          ),
        }));
      });
  },

  completeTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: "completed" as const, completedAt: new Date() } : t
      ),
    }));

    if (task.agentId) {
      const agent = useAgentStore.getState().agents.find((a) => a.id === task.agentId);
      if (agent) {
        useAgentStore.getState().updateStatus(task.agentId, "idle", null);
        useActivityStore.getState().addEntry({
          agentId: agent.id,
          agentName: agent.name,
          agentColor: agent.color,
          action: `Completed: ${task.title}`,
        });
      }
    }

    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", completedAt: new Date().toISOString() }),
    });
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    fetch(`/api/tasks/${id}`, { method: "DELETE" });
  },

  updateStatus: (id, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },
}));
