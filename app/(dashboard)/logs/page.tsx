import { EmptyState } from "@/components/shared/empty-state";

export default function LogsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-text-900 mb-6">Logs</h1>
      <EmptyState title="Agent Logs" description="Run history and output logs are blooming shortly." />
    </div>
  );
}
