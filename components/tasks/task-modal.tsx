"use client";

import { useState } from "react";
import { useTaskStore } from "@/lib/stores/tasks";
import { useAgentStore } from "@/lib/stores/agents";
import { TaskPriority } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useAgentStream } from "@/lib/hooks/use-agent-stream";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
  { value: "P3", label: "P3" },
];

export function TaskModal({ open, onClose }: TaskModalProps) {
  const agents = useAgentStore((s) => s.agents);
  const createTask = useTaskStore((s) => s.createTask);
  const [description, setDescription] = useState("");
  const [agentId, setAgentId] = useState<string>("");
  const [priority, setPriority] = useState<TaskPriority>("P2");
  const { run: runAgent } = useAgentStream();
  const [runImmediately, setRunImmediately] = useState(true);

  const handleSubmit = () => {
    if (!description.trim()) return;
    createTask({
      title: description.trim(),
      description: description.trim(),
      agentId: agentId || null,
      priority,
    });
    if (agentId && runImmediately) {
      runAgent(agentId, description.trim());
    }
    setDescription("");
    setAgentId("");
    setPriority("P2");
    setRunImmediately(true);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <div className="flex flex-col gap-4">
        <Textarea
          label="Task description"
          name="description"
          placeholder="Describe what needs to be done..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          id="task-description"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="agent-select" className="text-sm font-body font-medium text-text-700">
            Assign to agent
          </label>
          <select
            id="agent-select"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-btn border border-border bg-surface font-body text-text-900 focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-body font-medium text-text-700">Priority</span>
          <SegmentedControl options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
        </div>

        {agentId && (
          <label className="flex items-center gap-2 text-sm font-body text-text-700">
            <input
              type="checkbox"
              checked={runImmediately}
              onChange={(e) => setRunImmediately(e.target.checked)}
              className="accent-pink-300"
            />
            Run agent immediately
          </label>
        )}

        <Button onClick={handleSubmit} disabled={!description.trim()} className="mt-2">
          Assign task
        </Button>
      </div>
    </Modal>
  );
}
