"use client";

import { useState } from "react";
import { useAgentStore } from "@/lib/stores/agents";
import { AgentCard } from "@/components/agents/agent-card";
import { AgentDetail } from "@/components/agents/agent-detail";
import { Input } from "@/components/ui/input";

export default function AgentsPage() {
  const { agents, selectAgent } = useAgentStore();
  const [search, setSearch] = useState("");

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-900">Agents</h1>
        <div className="w-64">
          <Input placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onClick={() => selectAgent(agent.id)} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm font-body text-text-500 py-8 text-center">No agents match your search.</p>
      )}
      <AgentDetail />
    </div>
  );
}
