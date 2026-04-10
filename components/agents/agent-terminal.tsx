"use client";

import { useEffect, useRef } from "react";
import { useRunsStore } from "@/lib/stores/runs";
import { useAgentStream } from "@/lib/hooks/use-agent-stream";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AgentTerminalProps {
  agentId: string;
}

export function AgentTerminal({ agentId }: AgentTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeRun = useRunsStore((s) => s.getActiveRun(agentId));
  const allRuns = useRunsStore((s) => s.runs);

  const agentRuns = allRuns.filter((r) => r.agentId === agentId);
  const lastCompletedRun = agentRuns.find((r) => r.status !== "running");
  const displayRun = activeRun ?? lastCompletedRun;

  const { stop, isRunning } = useAgentStream();
  const running = isRunning(agentId);

  // Auto-scroll to bottom when output updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayRun?.output]);

  return (
    <div className="flex flex-col rounded-btn overflow-hidden border border-border">
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {!displayRun && (
            <span className="text-xs font-body text-gray-400">No runs yet</span>
          )}
          {displayRun?.status === "running" && (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-status-pulse" />
              <span className="text-xs font-body text-green-400">Running...</span>
            </>
          )}
          {displayRun?.status === "completed" && (
            <>
              <span className="text-xs text-sage-200">✓</span>
              <span className="text-xs font-body text-sage-200">Completed</span>
            </>
          )}
          {displayRun?.status === "failed" && (
            <>
              <span className="text-xs text-red-400">✗</span>
              <span className="text-xs font-body text-red-400">Failed</span>
            </>
          )}
        </div>

        {running && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => stop(agentId)}
            className="text-red-400 hover:text-red-300 hover:bg-gray-700 px-2 py-0.5 text-xs"
          >
            Stop
          </Button>
        )}
      </div>

      {/* Terminal output */}
      <div
        ref={scrollRef}
        className={cn(
          "bg-gray-900 font-mono text-xs text-green-400 p-3",
          "min-h-[200px] max-h-[400px] overflow-y-auto"
        )}
      >
        {!displayRun ? (
          <span className="text-gray-500">Assign a task to see output here.</span>
        ) : (
          <>
            <div className="mb-1">
              <span className="text-gray-500">$ </span>
              <span className="text-green-300">{displayRun.input.slice(0, 100)}</span>
            </div>
            {displayRun.output && (
              <pre className="whitespace-pre-wrap text-green-400 leading-relaxed">
                {displayRun.output}
              </pre>
            )}
            {running && (
              <span className="inline-block w-2 h-3.5 bg-green-400 animate-blink ml-0.5" />
            )}
          </>
        )}
      </div>

      {/* Run count */}
      {agentRuns.length > 1 && (
        <div className="px-3 py-1.5 bg-gray-800 border-t border-gray-700">
          <span className="text-[10px] font-body text-gray-500">
            {agentRuns.length} runs total
          </span>
        </div>
      )}
    </div>
  );
}
