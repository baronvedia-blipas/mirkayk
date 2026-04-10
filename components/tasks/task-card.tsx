"use client";

import { Task, PRIORITY_CONFIG } from "@/lib/types";
import { useAgentStore } from "@/lib/stores/agents";
import { useTaskStore } from "@/lib/stores/tasks";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const agents = useAgentStore((s) => s.agents);
  const completeTask = useTaskStore((s) => s.completeTask);
  const agent = agents.find((a) => a.id === task.agentId);
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <Card className="flex items-center gap-4">
      {task.status !== "completed" && task.status !== "failed" && (
        <button
          onClick={() => completeTask(task.id)}
          className="w-5 h-5 rounded-full border-2 border-border hover:border-sage-200 hover:bg-sage-100 transition-colors flex-shrink-0"
          title="Mark as complete"
        />
      )}
      {task.status === "completed" && (
        <div className="w-5 h-5 rounded-full bg-sage-200 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs">&#10003;</span>
        </div>
      )}
      {task.status === "failed" && (
        <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
          <span className="text-red-700 text-xs">&times;</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-body font-medium", task.status === "completed" && "line-through text-text-500")}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {agent && <span className="text-xs font-body text-text-500">{agent.name}</span>}
          <span className="text-[10px] font-body text-text-500">{formatDate(task.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
        <Badge>{task.status.replace("_", " ")}</Badge>
      </div>
    </Card>
  );
}
