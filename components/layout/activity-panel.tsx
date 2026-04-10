"use client";

import { useActivityStore } from "@/lib/stores/activity";
import { AGENT_COLOR_MAP } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ActivityPanel() {
  const entries = useActivityStore((s) => s.entries);

  return (
    <aside className="w-[280px] h-screen sticky top-0 flex flex-col bg-surface border-l border-border">
      <div className="p-4 border-b border-border">
        <h2 className="font-display text-base font-semibold text-text-900">Live activity</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const colorMap = AGENT_COLOR_MAP[entry.agentColor];
            return (
              <div key={entry.id} className="flex flex-col gap-1 pb-3 border-b border-border last:border-0">
                <div className="flex items-center justify-between">
                  <Badge className={`${colorMap.bg} ${colorMap.text}`}>{entry.agentName}</Badge>
                  <span className="text-[10px] font-body text-text-500">{formatTimeAgo(entry.timestamp)}</span>
                </div>
                <p className="text-xs font-body text-text-700 leading-relaxed">{entry.action}</p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
