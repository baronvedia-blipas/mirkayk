import { create } from "zustand";
import { Project } from "@/lib/types";
import { MOCK_PROJECTS } from "@/lib/mock/projects";
import { generateId } from "@/lib/utils";

interface ProjectStore {
  projects: Project[];
  activeProjectId: string;
  createProject: (data: { name: string; description: string; department: "web2" | "web3" }) => void;
  setActive: (id: string) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: MOCK_PROJECTS,
  activeProjectId: MOCK_PROJECTS[0].id,
  createProject: (data) =>
    set((state) => ({
      projects: [
        ...state.projects,
        { id: generateId(), ...data, agentIds: [], createdAt: new Date() },
      ],
    })),
  setActive: (id) => set({ activeProjectId: id }),
  deleteProject: (id) =>
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
}));
