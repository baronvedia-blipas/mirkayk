"use client";

import { Project } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  onSetActive: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, isActive, onSetActive, onDelete }: ProjectCardProps) {
  return (
    <Card
      className={cn(
        isActive && "ring-2 ring-sage-200"
      )}
    >
      {/* Top row: name + department badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-bold text-text-900 leading-tight">
          {project.name}
        </h3>
        <Badge
          className={cn(
            "shrink-0",
            project.department === "web2"
              ? "bg-lavender-100 text-lavender-200"
              : "bg-sky-100 text-blue-600"
          )}
        >
          {project.department}
        </Badge>
      </div>

      {/* Middle: description */}
      <p className="text-sm text-text-700 line-clamp-2 mb-4">
        {project.description}
      </p>

      {/* Bottom row: date + agent count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-text-500">{formatDate(project.createdAt)}</span>
        <Badge variant="outline">{project.agentIds.length} agents</Badge>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2">
        {!isActive && (
          <Button variant="secondary" size="sm" onClick={onSetActive}>
            Set Active
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-400 hover:text-red-500 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
