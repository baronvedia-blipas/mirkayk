"use client";

import { useState } from "react";
import { useTaskStore } from "@/lib/stores/tasks";
import { useAgentStore } from "@/lib/stores/agents";
import { TaskStatus } from "@/lib/types";
import { TaskCard } from "./task-card";
import { SegmentedControl } from "@/components/ui/segmented-control";

type StatusFilter = "all" | TaskStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const agents = useAgentStore((s) => s.agents);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const filtered = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (agentFilter !== "all" && t.agentId !== agentFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        <SegmentedControl options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          aria-label="Filter by agent"
          className="px-3 py-1.5 rounded-btn border border-border bg-surface font-body text-sm text-text-900 focus:outline-none focus:ring-2 focus:ring-pink-200"
        >
          <option value="all">All agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <p className="text-sm font-body text-text-500 py-8 text-center">No tasks match your filters.</p>
        ) : (
          filtered.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
