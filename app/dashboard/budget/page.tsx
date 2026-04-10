import { EmptyState } from "@/components/shared/empty-state";

export default function BudgetPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-text-900 mb-6">Budget</h1>
      <EmptyState title="Token Budget" description="Cost tracking and usage analytics are blooming shortly." />
    </div>
  );
}
