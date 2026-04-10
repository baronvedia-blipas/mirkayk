"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/stores/projects";
import { ProjectCard } from "@/components/projects/project-card";
import { NewProjectModal } from "@/components/projects/new-project-modal";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const setActive = useProjectStore((s) => s.setActive);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-900">Projects</h1>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          New Project
        </Button>
      </div>

      {/* Grid or empty state */}
      {projects.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-text-500">No projects yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isActive={project.id === activeProjectId}
              onSetActive={() => setActive(project.id)}
              onDelete={() => deleteProject(project.id)}
            />
          ))}
        </div>
      )}

      {/* New project modal */}
      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
