import { EmptyState } from "@/components/shared/empty-state";

export default function ProjectsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-text-900 mb-6">Projects</h1>
      <EmptyState title="Projects" description="Project management is blooming shortly." />
    </div>
  );
}
