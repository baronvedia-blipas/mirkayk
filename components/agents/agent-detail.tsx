"use client";

import { useState } from "react";
import { useAgentStore } from "@/lib/stores/agents";
import { useTaskStore } from "@/lib/stores/tasks";
import { AGENT_COLOR_MAP, STATUS_CONFIG, PROVIDER_INFO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

type Tab = "overview" | "prompt" | "instructions" | "skills";

export function AgentDetail() {
  const { agents, selectedAgentId, selectAgent, updatePrompt, updateInstructions } = useAgentStore();
  const tasks = useTaskStore((s) => s.tasks);
  const createTask = useTaskStore((s) => s.createTask);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [newTaskText, setNewTaskText] = useState("");

  const agent = agents.find((a) => a.id === selectedAgentId);
  if (!agent) return null;

  const colorMap = AGENT_COLOR_MAP[agent.color];
  const statusConfig = STATUS_CONFIG[agent.status];
  const recentTasks = tasks.filter((t) => t.agentId === agent.id).slice(0, 5);

  const handleAssignTask = () => {
    if (!newTaskText.trim()) return;
    createTask({ title: newTaskText.trim(), description: newTaskText.trim(), agentId: agent.id, priority: "P2" });
    setNewTaskText("");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "prompt", label: "Prompt" },
    { key: "instructions", label: "Instructions" },
    { key: "skills", label: "Skills" },
  ];

  return (
    <div className="fixed inset-y-0 right-[280px] w-[420px] bg-surface border-l border-border shadow-card-hover z-30 flex flex-col transition-transform duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={cn("w-3 h-3 rounded-full", statusConfig.dotColor, agent.status !== "idle" && "animate-status-pulse")} />
          <h2 className="font-display text-lg font-bold text-text-900">{agent.name}</h2>
          <Badge className={`${colorMap.bg} ${colorMap.text}`}>{statusConfig.label}</Badge>
        </div>
        <button onClick={() => selectAgent(null)} className="text-text-500 hover:text-text-700 text-xl">&times;</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-2.5 text-sm font-body transition-all border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-pink-300 text-pink-300 font-semibold"
                : "border-transparent text-text-500 hover:text-text-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-body text-text-700 leading-relaxed">{agent.role}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{PROVIDER_INFO[agent.provider].label}</Badge>
                <span className="text-xs font-mono text-text-500">{agent.model}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-body font-semibold text-text-900 mb-2">Recent tasks</h3>
              {recentTasks.length === 0 ? (
                <p className="text-xs text-text-500 font-body">No tasks yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-surface-2 rounded-btn">
                      <span className="text-xs font-body text-text-700 truncate flex-1">{t.title}</span>
                      <Badge className="ml-2 text-[10px]">{t.status.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-body font-semibold text-text-900 mb-2">Token usage (7 days)</h3>
              <div className="flex items-end gap-1 h-16">
                {[35, 52, 28, 64, 45, 72, 40].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-pink-100" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[10px] text-text-500 font-body">{d}</span>
                ))}
              </div>
            </div>

            <div>
              <Textarea placeholder="Describe a task to assign..." value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} rows={3} />
              <Button onClick={handleAssignTask} className="mt-2 w-full" size="sm" disabled={!newTaskText.trim()}>
                Assign task
              </Button>
            </div>
          </div>
        )}

        {activeTab === "prompt" && (
          <div>
            <textarea
              value={agent.systemPrompt}
              onChange={(e) => updatePrompt(agent.id, e.target.value)}
              className="w-full h-[400px] p-4 font-mono text-xs bg-surface-2 border border-border rounded-btn text-text-900 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
            />
          </div>
        )}

        {activeTab === "instructions" && (
          <div className="flex flex-col gap-2">
            {agent.instructions.map((inst, i) => (
              <label key={i} className="flex items-start gap-2 p-2 bg-surface-2 rounded-btn">
                <input type="checkbox" defaultChecked className="mt-0.5 accent-pink-300" />
                <span className="text-xs font-body text-text-700">{inst}</span>
              </label>
            ))}
          </div>
        )}

        {activeTab === "skills" && (
          <div className="flex flex-wrap gap-2">
            {agent.skills.map((skill) => (
              <Badge key={skill} className="bg-lavender-100 text-lavender-200">{skill}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
