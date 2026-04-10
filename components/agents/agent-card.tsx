"use client";

import { Agent, AGENT_COLOR_MAP, STATUS_CONFIG, PROVIDER_INFO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const colorMap = AGENT_COLOR_MAP[agent.color];
  const statusConfig = STATUS_CONFIG[agent.status];
  const providerInfo = PROVIDER_INFO[agent.provider];

  return (
    <Card hoverable onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn("w-2.5 h-2.5 rounded-full", statusConfig.dotColor, agent.status !== "idle" && "animate-status-pulse")}
          />
          <h3 className="font-display font-bold text-text-900">{agent.name}</h3>
        </div>
        <Badge className={`${colorMap.bg} ${colorMap.text}`}>{statusConfig.label}</Badge>
      </div>
      <p className="text-sm font-body text-text-500 mb-3">{agent.role}</p>
      {agent.currentTask && (
        <p className="text-xs font-body text-text-700 italic truncate mb-3">{agent.currentTask}</p>
      )}
      <div className="flex items-center justify-between">
        <Badge variant="outline">{providerInfo.label}</Badge>
        <span className="text-[10px] font-mono text-text-500">{agent.model}</span>
      </div>
    </Card>
  );
}
