import { Sidebar } from "@/components/layout/sidebar";
import { ActivityPanel } from "@/components/layout/activity-panel";
import { HydrationProvider } from "@/components/providers/hydration-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationProvider>
      <div className="flex min-h-screen">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
        <div className="hidden xl:block">
          <ActivityPanel />
        </div>
      </div>
    </HydrationProvider>
  );
}
