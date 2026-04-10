"use client";

import { useState } from "react";
import { useRunsStore } from "@/lib/stores/runs";
import { useAgentStore } from "@/lib/stores/agents";
import { RunStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { RunEntry } from "@/components/logs/run-entry";

type StatusFilter = "all" | RunStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

export default function LogsPage() {
  const runs = useRunsStore((s) => s.runs);
  const agents = useAgentStore((s) => s.agents);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const sorted = [...runs].sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
  );

  const filtered = sorted.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (agentFilter !== "all" && r.agentId !== agentFilter) return false;
    return true;
  });

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-900">
          Agent Logs
        </h1>
        <Badge>{runs.length}</Badge>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap mb-4">
        <SegmentedControl
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          aria-label="Filter by agent"
          className="px-3 py-1.5 rounded-btn border border-border bg-surface font-body text-sm text-text-900 focus:outline-none focus:ring-2 focus:ring-pink-200"
        >
          <option value="all">All agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Run list */}
      {runs.length === 0 ? (
        <p className="text-sm font-body text-text-500 py-8 text-center">
          Run an agent to see logs here.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm font-body text-text-500 py-8 text-center">
          No logs match your filters.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((run) => (
            <RunEntry key={run.id} run={run} />
          ))}
        </div>
      )}
    </div>
  );
}
