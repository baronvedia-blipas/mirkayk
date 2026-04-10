"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/lib/stores/projects";
import { TokenMeter } from "@/components/ui/token-meter";
import { Badge } from "@/components/ui/badge";
import { BotanicalDecor } from "@/components/shared/botanical-decor";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "\u25A3" },
  { label: "Agents", href: "/dashboard/agents", icon: "\u2662" },
  { label: "Tasks", href: "/dashboard/tasks", icon: "\u2611" },
  { label: "Projects", href: "/dashboard/projects", icon: "\u2740" },
  { label: "Logs", href: "/dashboard/logs", icon: "\u2263" },
  { label: "Budget", href: "/dashboard/budget", icon: "\u2726" },
];

export function Sidebar() {
  const pathname = usePathname();
  const project = useProjectStore((s) => s.projects.find((p) => p.id === s.activeProjectId));

  return (
    <aside className="w-[220px] h-screen sticky top-0 flex flex-col bg-surface border-r border-border p-4 relative overflow-hidden">
      <div className="mb-6">
        <h1 className="font-display text-2xl italic text-text-900">mirkayk</h1>
      </div>

      {project && (
        <div className="mb-6 p-3 bg-surface-2 rounded-btn">
          <p className="font-body text-sm font-semibold text-text-900 truncate">{project.name}</p>
          <Badge className="mt-1 bg-lavender-100 text-lavender-200">{project.department}</Badge>
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-btn text-sm font-body transition-all duration-200",
                isActive
                  ? "bg-pink-100 text-pink-300 font-semibold"
                  : "text-text-700 hover:bg-surface-2"
              )}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 flex justify-center">
        <TokenMeter percentage={62} label="Monthly budget" />
      </div>

      <BotanicalDecor position="sidebar-bottom" />
    </aside>
  );
}
