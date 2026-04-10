"use client";

import { useCallback } from "react";
import { useRunsStore } from "@/lib/stores/runs";

// Module-level map — persists across renders, one controller per agentId
const controllers = new Map<string, AbortController>();

export function useAgentStream(): {
  run: (agentId: string, prompt: string, taskId?: string) => void;
  stop: (agentId: string) => void;
  isRunning: (agentId: string) => boolean;
} {
  const { startRun, appendOutput, completeRun, activeRunByAgent } =
    useRunsStore();

  const run = useCallback(
    async (agentId: string, prompt: string, taskId?: string) => {
      // Prevent duplicate runs for the same agent
      if (controllers.has(agentId)) return;

      const runId = startRun(agentId, taskId ?? null, prompt);

      const controller = new AbortController();
      controllers.set(agentId, controller);

      const cleanup = () => {
        controllers.delete(agentId);
      };

      let response: Response;
      try {
        response = await fetch("/api/agent/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId, prompt, taskId }),
          signal: controller.signal,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          completeRun(runId, "failed");
        } else {
          appendOutput(runId, `Error: ${(err as Error).message}\n`);
          completeRun(runId, "failed");
        }
        cleanup();
        return;
      }

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const body = await response.json();
          message = body?.error ?? body?.message ?? message;
        } catch {
          // ignore parse errors
        }
        appendOutput(runId, `Error: ${message}\n`);
        completeRun(runId, "failed");
        cleanup();
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let eventType = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice("event: ".length).trim();
            } else if (line.startsWith("data: ")) {
              let data: { content: string; timestamp: number };
              try {
                data = JSON.parse(line.slice("data: ".length));
              } catch {
                continue;
              }

              if (eventType === "output") {
                appendOutput(runId, data.content + "\n");
              } else if (eventType === "error") {
                appendOutput(runId, "[stderr] " + data.content + "\n");
              } else if (eventType === "done") {
                const status = data.content.includes("exit_code:0")
                  ? "completed"
                  : "failed";
                completeRun(runId, status);
                cleanup();
                return;
              }
            }
          }
        }

        // Stream ended without a "done" event
        completeRun(runId, "completed");
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          completeRun(runId, "failed");
        } else {
          appendOutput(runId, `Error: ${(err as Error).message}\n`);
          completeRun(runId, "failed");
        }
      } finally {
        cleanup();
      }
    },
    [startRun, appendOutput, completeRun]
  );

  const stop = useCallback((agentId: string) => {
    const controller = controllers.get(agentId);
    if (controller) {
      controller.abort();
      controllers.delete(agentId);
    }
  }, []);

  const isRunning = useCallback(
    (agentId: string) => !!activeRunByAgent[agentId],
    [activeRunByAgent]
  );

  return { run, stop, isRunning };
}
