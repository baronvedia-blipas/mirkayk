import { create } from "zustand";
import { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { MOCK_TASKS } from "@/lib/mock/tasks";
import { generateId } from "@/lib/utils";
import { useAgentStore } from "./agents";
import { useActivityStore } from "./activity";

interface TaskStore {
  tasks: Task[];
  createTask: (data: { title: string; description: string; agentId: string | null; priority: TaskPriority }) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateStatus: (id: string, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: MOCK_TASKS,
  createTask: (data) => {
    const newTask: Task = {
      id: generateId(),
      ...data,
      status: data.agentId ? "in_progress" : "pending",
      createdAt: new Date(),
      completedAt: null,
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));

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
  },
  deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  updateStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
}));
