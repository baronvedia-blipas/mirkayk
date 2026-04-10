"use client";

import { useAgentStore } from "@/lib/stores/agents";
import { AgentCard } from "./agent-card";

export function AgentGrid() {
  const { agents, selectAgent } = useAgentStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} onClick={() => selectAgent(agent.id)} />
      ))}
    </div>
  );
}
