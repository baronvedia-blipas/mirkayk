import { create } from "zustand";
import { Project } from "@/lib/types";

interface ProjectStore {
  projects: Project[];
  activeProjectId: string;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  createProject: (data: { name: string; description: string; department: "web2" | "web3" }) => void;
  setActive: (id: string) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  activeProjectId: "",
  isHydrated: false,

  hydrate: async () => {
    const res = await fetch("/api/projects");
    const projects = await res.json();
    const parsed = projects.map((p: Record<string, unknown>) => ({
      ...p,
      createdAt: new Date(p.createdAt as string),
    }));
    const active = parsed.find((p: { isActive: boolean }) => p.isActive);
    set({ projects: parsed, activeProjectId: active?.id || "", isHydrated: true });
  },

  createProject: (data) => {
    const tempId = crypto.randomUUID();
    set((state) => ({
      projects: [
        ...state.projects,
        { id: tempId, ...data, agentIds: [], createdAt: new Date() },
      ],
    }));

    fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((real) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === tempId ? { ...real, createdAt: new Date(real.createdAt) } : p
          ),
        }));
      });
  },

  setActive: (id) => {
    set({ activeProjectId: id });
    fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
  },

  deleteProject: (id) => {
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    fetch(`/api/projects/${id}`, { method: "DELETE" });
  },
}));
