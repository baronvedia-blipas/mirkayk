"use client";

import { useState } from "react";
import { useAgentStore } from "@/lib/stores/agents";
import { useTaskStore } from "@/lib/stores/tasks";
import { AgentGrid } from "@/components/agents/agent-grid";
import { AgentDetail } from "@/components/agents/agent-detail";
import { TaskModal } from "@/components/tasks/task-modal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const agents = useAgentStore((s) => s.agents);
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const tasks = useTaskStore((s) => s.tasks);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const activeCount = agents.filter((a) => a.status !== "idle").length;
  const idleCount = agents.length - activeCount;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const totalTokens = "48.2k";
  const deploys = 3;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-900">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{agents.length} agents</Badge>
            <Badge className="bg-sage-100 text-sage-200">{activeCount} active</Badge>
            <Badge variant="outline">{idleCount} idle</Badge>
          </div>
        </div>
        <Button onClick={() => setShowTaskModal(true)}>New Task +</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm font-body text-text-500">Tasks completed</p>
          <p className="text-2xl font-display font-bold text-text-900 mt-1">{completedTasks}</p>
        </Card>
        <Card>
          <p className="text-sm font-body text-text-500">Tokens used</p>
          <p className="text-2xl font-display font-bold text-text-900 mt-1">{totalTokens}</p>
        </Card>
        <Card>
          <p className="text-sm font-body text-text-500">Deploys</p>
          <p className="text-2xl font-display font-bold text-text-900 mt-1">{deploys}</p>
        </Card>
      </div>

      <AgentGrid />
      <AgentDetail />
      <TaskModal open={showTaskModal} onClose={() => setShowTaskModal(false)} />
    </div>
  );
}
