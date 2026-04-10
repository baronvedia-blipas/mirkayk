"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useProjectStore } from "@/lib/stores/projects";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
}

const DEPARTMENT_OPTIONS: { value: "web2" | "web3"; label: string }[] = [
  { value: "web2", label: "Web2" },
  { value: "web3", label: "Web3" },
];

export function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const createProject = useProjectStore((s) => s.createProject);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState<"web2" | "web3">("web2");

  function handleSubmit() {
    if (!name.trim()) return;
    createProject({ name: name.trim(), description: description.trim(), department });
    setName("");
    setDescription("");
    setDepartment("web2");
    onClose();
  }

  function handleClose() {
    setName("");
    setDescription("");
    setDepartment("web2");
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Project">
      <div className="flex flex-col gap-4">
        <Input
          label="Project name"
          id="project-name"
          placeholder="My awesome project"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <Textarea
          label="Description"
          id="project-description"
          placeholder="What is this project about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-body font-medium text-text-700">Department</span>
          <SegmentedControl
            options={DEPARTMENT_OPTIONS}
            value={department}
            onChange={setDepartment}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Create Project
          </Button>
        </div>
      </div>
    </Modal>
  );
}
