"use client";

import { useState } from "react";
import { TaskList } from "@/components/tasks/task-list";
import { TaskModal } from "@/components/tasks/task-modal";
import { Button } from "@/components/ui/button";

export default function TasksPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-900">Tasks</h1>
        <Button onClick={() => setShowModal(true)}>New Task +</Button>
      </div>
      <TaskList />
      <TaskModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
