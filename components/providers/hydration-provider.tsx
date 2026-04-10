"use client";

import { useEffect } from "react";
import { useAgentStore } from "@/lib/stores/agents";
import { useTaskStore } from "@/lib/stores/tasks";
import { useProjectStore } from "@/lib/stores/projects";
import { useRunsStore } from "@/lib/stores/runs";

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAgentStore.getState().hydrate();
    useTaskStore.getState().hydrate();
    useProjectStore.getState().hydrate();
    useRunsStore.getState().hydrate();
  }, []);

  return <>{children}</>;
}
