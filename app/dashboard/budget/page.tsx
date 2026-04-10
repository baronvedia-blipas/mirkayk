"use client";

import { Card } from "@/components/ui/card";
import { useRunsStore } from "@/lib/stores/runs";
import { useAgentStore } from "@/lib/stores/agents";
import { cn } from "@/lib/utils";

export default function BudgetPage() {
  const runs = useRunsStore((s) => s.runs);
  const agents = useAgentStore((s) => s.agents);

  const totalOutputChars = runs.reduce((sum, r) => sum + (r.output?.length || 0), 0);
  const estTokens = Math.round(totalOutputChars / 4);
  const estCost = (estTokens * 0.003 / 1000).toFixed(2);

  const agentStats = agents
    .map((agent) => {
      const agentRuns = runs.filter((r) => r.agentId === agent.id);
      const outputChars = agentRuns.reduce((sum, r) => sum + (r.output?.length || 0), 0);
      return {
        agent,
        runCount: agentRuns.length,
        outputChars,
        estTokens: Math.round(outputChars / 4),
      };
    })
    .filter((s) => s.runCount > 0)
    .sort((a, b) => b.outputChars - a.outputChars);

  const maxOutputChars = agentStats.length > 0 ? agentStats[0].outputChars : 0;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <h1 className="font-display text-2xl font-semibold text-text-900">Token Budget</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-text-500 mb-1">Total Runs</p>
          <p className="text-2xl font-display font-bold text-text-900">{runs.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-text-500 mb-1">Est. Tokens</p>
          <p className="text-2xl font-display font-bold text-text-900">{estTokens.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-xs text-text-500 mb-1">Est. Cost</p>
          <p className="text-2xl font-display font-bold text-text-900">${estCost}</p>
        </Card>
      </div>

      {/* Usage by Agent bar chart */}
      <Card>
        <p className="text-sm font-semibold text-text-900 mb-4">Usage by Agent</p>
        {agentStats.length === 0 ? (
          <p className="text-xs text-text-500">No usage data yet.</p>
        ) : (
          <div className="space-y-3">
            {agentStats.map(({ agent, outputChars }) => {
              const barWidth = maxOutputChars > 0
                ? Math.max(4, Math.round((outputChars / maxOutputChars) * 100))
                : 4;
              return (
                <div key={agent.id} className="flex items-center gap-3">
                  <span
                    className="text-xs text-text-700 shrink-0 truncate"
                    style={{ width: 80 }}
                  >
                    {agent.name}
                  </span>
                  <div className="flex-1">
                    <div
                      className="bg-pink-100 rounded"
                      style={{ height: 20, width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-500 shrink-0">
                    {outputChars.toLocaleString()} chars
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Runs Table */}
      <Card>
        <p className="text-sm font-semibold text-text-900 mb-4">Agent Breakdown</p>
        {agentStats.length === 0 ? (
          <p className="text-xs text-text-500">No usage data yet.</p>
        ) : (
          <div>
            {/* Header row */}
            <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs text-text-500 font-semibold">
              <span>Agent</span>
              <span className="text-right">Runs</span>
              <span className="text-right">Output</span>
              <span className="text-right">Est. Tokens</span>
              <span className="text-right">Est. Cost</span>
            </div>
            {/* Data rows */}
            {agentStats.map(({ agent, runCount, outputChars, estTokens: agentTokens }, index) => {
              const agentCost = (agentTokens * 0.003 / 1000).toFixed(4);
              return (
                <div
                  key={agent.id}
                  className={cn(
                    "grid grid-cols-5 gap-2 px-3 py-2 rounded-btn text-sm",
                    index % 2 === 1 && "bg-surface-2"
                  )}
                >
                  <span className="text-xs text-text-900 font-medium truncate">{agent.name}</span>
                  <span className="text-xs text-text-700 text-right">{runCount}</span>
                  <span className="text-xs text-text-500 text-right">{outputChars.toLocaleString()}</span>
                  <span className="text-xs text-text-500 text-right">{agentTokens.toLocaleString()}</span>
                  <span className="text-xs text-text-500 text-right">${agentCost}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Footer note */}
      <p className="text-xs text-text-500 italic mt-4">
        Token estimates are approximate (1 token ~ 4 chars). Real tracking coming in a future update.
      </p>
    </div>
  );
}
