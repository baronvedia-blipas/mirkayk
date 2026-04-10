"use client";

import { useState } from "react";
import { AgentRun, AGENT_COLOR_MAP } from "@/lib/types";
import { useAgentStore } from "@/lib/stores/agents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatTimeAgo } from "@/lib/utils";

const RUN_STATUS_CONFIG: Record<
  AgentRun["status"],
  { className: string; label: string }
> = {
  running: { className: "bg-pink-100 text-pink-300", label: "Running" },
  completed: { className: "bg-sage-100 text-sage-200", label: "Completed" },
  failed: { className: "bg-red-100 text-red-700", label: "Failed" },
};

interface RunEntryProps {
  run: AgentRun;
}

export function RunEntry({ run }: RunEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const agent = useAgentStore((s) => s.agents.find((a) => a.id === run.agentId));

  const agentName = agent?.name ?? "Unknown Agent";
  const colorMap = agent ? AGENT_COLOR_MAP[agent.color] : null;
  const statusConfig = RUN_STATUS_CONFIG[run.status];

  const terminalContent =
    run.status === "running"
      ? "(still running...)"
      : run.output || "(no output)";

  return (
    <Card
      onClick={() => setExpanded((prev) => !prev)}
      hoverable
      className="select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Agent dot + name */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn("w-3 h-3 rounded-full shrink-0", colorMap?.bg ?? "bg-text-500")}
          />
          <span className="text-sm font-semibold font-body text-text-900 whitespace-nowrap">
            {agentName}
          </span>
        </div>

        {/* Input (truncated) */}
        <p className="text-sm font-body text-text-700 truncate flex-1 min-w-0">
          {run.input}
        </p>

        {/* Status + timestamp */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
          <span className="text-xs font-body text-text-500 whitespace-nowrap">
            {formatTimeAgo(run.startedAt)}
          </span>
        </div>
      </div>

      {/* Expandable output */}
      {expanded && (
        <div
          className={cn(
            "bg-gray-900 rounded-btn p-4 mt-3 font-mono text-xs whitespace-pre-wrap max-h-[300px] overflow-y-auto",
            run.status === "running" ? "text-text-500" : "text-green-400"
          )}
        >
          {terminalContent}
        </div>
      )}
    </Card>
  );
}
