# Phase 2A: CLI Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect dashboard agents to real Claude and Gemini CLIs via Next.js API Routes with SSE streaming, so clicking "Assign task" actually runs the AI and streams output back to the UI.

**Architecture:** Next.js API Route spawns CLI child processes (claude/gemini) server-side. Output streams to browser via SSE (text/event-stream). A Zustand runs store tracks active executions with cross-store effects to agent status and activity feed. A new "Terminal" tab in the AgentDetail panel shows live output.

**Tech Stack:** Next.js 16 API Routes, Node.js child_process (spawn), SSE (ReadableStream), Zustand 5, existing Phase 1 UI components.

**Spec:** `docs/superpowers/specs/2026-04-10-mirkayk-phase2a-cli-integration.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/types/index.ts` | Modify | Add CLIConfig, CLIRunOptions, CLIEvent types |
| `lib/cli/config.ts` | Create | Agent-to-CLI mapping (provider, model, flags per agent ID) |
| `lib/cli/adapter.ts` | Create | Spawn CLI processes, normalize output to CLIEvent ReadableStream |
| `app/api/agent/run/route.ts` | Create | POST endpoint: validate, spawn CLI via adapter, return SSE stream |
| `lib/stores/runs.ts` | Create | Zustand store: runs[], activeRunByAgent, cross-store effects |
| `lib/hooks/use-agent-stream.ts` | Create | React hook: fetch SSE, parse events, update runs store |
| `components/agents/agent-terminal.tsx` | Create | Terminal output UI: dark bg, streaming text, auto-scroll, stop button |
| `components/agents/agent-detail.tsx` | Modify | Add "Terminal" tab, wire "Assign task" to useAgentStream |
| `components/tasks/task-modal.tsx` | Modify | Add "Run agent immediately" checkbox |

---

### Task 1: Add CLI Types

**Files:**
- Modify: `lib/types/index.ts`

- [ ] **Step 1: Add CLI-related types to the types file**

Add these types at the end of `lib/types/index.ts`, before the config maps:

```typescript
// ── CLI Integration Types (Phase 2A) ──

export interface CLIConfig {
  provider: "claude" | "gemini";
  model: string;
  flags?: string[];
}

export interface CLIRunOptions {
  provider: "claude" | "gemini";
  model: string;
  prompt: string;
  systemPrompt?: string;
  workingDir?: string;
  flags?: string[];
}

export interface CLIEvent {
  type: "output" | "error" | "done";
  content: string;
  timestamp: number;
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx next build`
Expected: Clean build with zero errors.

- [ ] **Step 3: Commit**

```bash
git add lib/types/index.ts
git commit -m "feat: add CLI integration types (CLIConfig, CLIRunOptions, CLIEvent)"
```

---

### Task 2: Create Agent CLI Config

**Files:**
- Create: `lib/cli/config.ts`

- [ ] **Step 1: Create the config file**

Create `lib/cli/config.ts`:

```typescript
import { CLIConfig } from "@/lib/types";

export const AGENT_CLI_CONFIG: Record<string, CLIConfig> = {
  "agent-pm":        { provider: "claude", model: "claude-sonnet-4-6" },
  "agent-architect": { provider: "claude", model: "claude-opus-4-6" },
  "agent-frontend":  { provider: "claude", model: "claude-sonnet-4-6" },
  "agent-backend":   { provider: "claude", model: "claude-sonnet-4-6" },   // fallback from codex
  "agent-qa":        { provider: "claude", model: "claude-sonnet-4-6" },   // fallback from codex
  "agent-devops":    { provider: "gemini", model: "gemini-2.5-pro" },
};

export function getAgentCLIConfig(agentId: string): CLIConfig | undefined {
  return AGENT_CLI_CONFIG[agentId];
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx next build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add lib/cli/config.ts
git commit -m "feat: add agent-to-CLI config mapping"
```

---

### Task 3: Create CLI Adapter

**Files:**
- Create: `lib/cli/adapter.ts`

This is the core piece. It spawns CLI processes and normalizes their output into a ReadableStream of CLIEvents.

- [ ] **Step 1: Create the adapter file**

Create `lib/cli/adapter.ts`:

```typescript
import { spawn, ChildProcess } from "child_process";
import { CLIRunOptions, CLIEvent } from "@/lib/types";

function buildClaudeArgs(options: CLIRunOptions): string[] {
  const args = ["-p", options.prompt, "--model", options.model, "--verbose", "--output-format", "stream-json"];
  if (options.systemPrompt) {
    args.push("--system-prompt", options.systemPrompt);
  }
  if (options.flags) {
    args.push(...options.flags);
  }
  return args;
}

function buildGeminiArgs(options: CLIRunOptions): string[] {
  const args = ["-p", options.prompt, "--model", options.model, "-s"];
  if (options.flags) {
    args.push(...options.flags);
  }
  return args;
}

function parseClaudeStreamLine(line: string): string | null {
  try {
    const event = JSON.parse(line);
    // Claude stream-json emits many event types. We care about assistant text output.
    if (event.type === "assistant" && event.message) {
      return event.message;
    }
    // Also capture content_block_delta for streaming text
    if (event.type === "content_block_delta" && event.delta?.text) {
      return event.delta.text;
    }
    // Capture the final result text
    if (event.type === "result" && event.result) {
      return event.result;
    }
    return null;
  } catch {
    // Non-JSON line from Claude (e.g., startup messages) — treat as output
    if (line.trim()) return line;
    return null;
  }
}

export function spawnCLI(options: CLIRunOptions): {
  stream: ReadableStream<CLIEvent>;
  kill: () => void;
} {
  const command = options.provider === "claude" ? "claude" : "gemini";
  const args = options.provider === "claude"
    ? buildClaudeArgs(options)
    : buildGeminiArgs(options);

  let proc: ChildProcess;

  const stream = new ReadableStream<CLIEvent>({
    start(controller) {
      proc = spawn(command, args, {
        cwd: options.workingDir || process.cwd(),
        env: { ...process.env },
        shell: true,
      });

      let stdoutBuffer = "";
      let stderrBuffer = "";

      proc.stdout?.on("data", (chunk: Buffer) => {
        stdoutBuffer += chunk.toString();
        const lines = stdoutBuffer.split("\n");
        stdoutBuffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          let content: string | null;
          if (options.provider === "claude") {
            content = parseClaudeStreamLine(line);
          } else {
            content = line.trim();
          }

          if (content) {
            controller.enqueue({
              type: "output",
              content,
              timestamp: Date.now(),
            });
          }
        }
      });

      proc.stderr?.on("data", (chunk: Buffer) => {
        stderrBuffer += chunk.toString();
        const lines = stderrBuffer.split("\n");
        stderrBuffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          controller.enqueue({
            type: "error",
            content: line.trim(),
            timestamp: Date.now(),
          });
        }
      });

      proc.on("close", (code) => {
        // Flush remaining buffers
        if (stdoutBuffer.trim()) {
          const content = options.provider === "claude"
            ? parseClaudeStreamLine(stdoutBuffer) || stdoutBuffer.trim()
            : stdoutBuffer.trim();
          if (content) {
            controller.enqueue({ type: "output", content, timestamp: Date.now() });
          }
        }
        if (stderrBuffer.trim()) {
          controller.enqueue({ type: "error", content: stderrBuffer.trim(), timestamp: Date.now() });
        }

        controller.enqueue({
          type: "done",
          content: `exit_code:${code ?? 0}`,
          timestamp: Date.now(),
        });
        controller.close();
      });

      proc.on("error", (err) => {
        controller.enqueue({
          type: "error",
          content: err.message,
          timestamp: Date.now(),
        });
        controller.enqueue({
          type: "done",
          content: "exit_code:1",
          timestamp: Date.now(),
        });
        controller.close();
      });
    },
    cancel() {
      proc?.kill("SIGTERM");
    },
  });

  return {
    stream,
    kill: () => proc?.kill("SIGTERM"),
  };
}

export async function isCLIAvailable(provider: "claude" | "gemini"): Promise<boolean> {
  const command = provider === "claude" ? "claude" : "gemini";
  return new Promise((resolve) => {
    const proc = spawn(command, ["--version"], { shell: true });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx next build`
Expected: Clean build. Note: `child_process` is Node.js-only; this file is only imported by the API route (server-side), never by client components.

- [ ] **Step 3: Commit**

```bash
git add lib/cli/adapter.ts
git commit -m "feat: CLI adapter — spawn claude/gemini, normalize output to CLIEvent stream"
```

---

### Task 4: Create API Route

**Files:**
- Create: `app/api/agent/run/route.ts`

- [ ] **Step 1: Create the API route directory and file**

Create `app/api/agent/run/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAgentCLIConfig } from "@/lib/cli/config";
import { spawnCLI, isCLIAvailable } from "@/lib/cli/adapter";
import { CLIEvent } from "@/lib/types";

// Track active runs server-side to prevent duplicate runs per agent
const activeRuns = new Map<string, { kill: () => void }>();

export async function POST(request: NextRequest) {
  let body: { agentId?: string; prompt?: string; taskId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { agentId, prompt, taskId } = body;

  // Validate agentId
  if (!agentId || typeof agentId !== "string") {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  const config = getAgentCLIConfig(agentId);
  if (!config) {
    return NextResponse.json({ error: `Unknown agentId: ${agentId}` }, { status: 400 });
  }

  // Validate prompt
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "prompt is required and must be non-empty" }, { status: 400 });
  }
  if (prompt.length > 10_000) {
    return NextResponse.json({ error: "prompt exceeds 10,000 character limit" }, { status: 400 });
  }

  // Check for active run
  if (activeRuns.has(agentId)) {
    return NextResponse.json({ error: "Agent already has an active run" }, { status: 409 });
  }

  // Check CLI availability
  const available = await isCLIAvailable(config.provider);
  if (!available) {
    return NextResponse.json(
      { error: `CLI '${config.provider}' not available. Install it or change agent config.` },
      { status: 503 }
    );
  }

  // Spawn CLI
  const { stream: cliStream, kill } = spawnCLI({
    provider: config.provider,
    model: config.model,
    prompt: prompt.trim(),
    flags: config.flags,
  });

  activeRuns.set(agentId, { kill });

  // Convert CLIEvent stream to SSE text stream
  const encoder = new TextEncoder();
  const sseStream = new ReadableStream({
    async start(controller) {
      const reader = cliStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const event = value as CLIEvent;
          const sseMessage = `event: ${event.type}\ndata: ${JSON.stringify({ content: event.content, timestamp: event.timestamp })}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));

          if (event.type === "done") {
            activeRuns.delete(agentId);
          }
        }
      } catch (err) {
        const errorMessage = `event: error\ndata: ${JSON.stringify({ content: String(err), timestamp: Date.now() })}\n\n`;
        controller.enqueue(encoder.encode(errorMessage));
        activeRuns.delete(agentId);
      } finally {
        controller.close();
      }
    },
    cancel() {
      kill();
      activeRuns.delete(agentId);
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx next build`
Expected: Clean build. The route should appear as a dynamic server route (not static) due to the POST handler.

- [ ] **Step 3: Quick manual test**

Start dev server: `npm run dev`

In a separate terminal:

```bash
curl -X POST http://localhost:3000/api/agent/run \
  -H "Content-Type: application/json" \
  -d '{"agentId":"agent-pm","prompt":"Say hello in one sentence"}'
```

Expected: SSE events streaming back with `event: output` lines followed by `event: done`.

- [ ] **Step 4: Commit**

```bash
git add app/api/agent/run/route.ts
git commit -m "feat: /api/agent/run — SSE endpoint spawning CLI child processes"
```

---

### Task 5: Create Runs Store

**Files:**
- Create: `lib/stores/runs.ts`

- [ ] **Step 1: Create the runs store**

Create `lib/stores/runs.ts`:

```typescript
import { create } from "zustand";
import { AgentRun, RunStatus } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { useAgentStore } from "./agents";
import { useActivityStore } from "./activity";
import { useTaskStore } from "./tasks";

interface RunsStore {
  runs: AgentRun[];
  activeRunByAgent: Record<string, string>;

  startRun: (agentId: string, taskId: string | null, prompt: string) => string;
  appendOutput: (runId: string, content: string) => void;
  completeRun: (runId: string, status: "completed" | "failed") => void;
  getRun: (runId: string) => AgentRun | undefined;
  getActiveRun: (agentId: string) => AgentRun | undefined;
}

export const useRunsStore = create<RunsStore>((set, get) => ({
  runs: [],
  activeRunByAgent: {},

  startRun: (agentId, taskId, prompt) => {
    const runId = generateId();
    const run: AgentRun = {
      id: runId,
      agentId,
      taskId,
      input: prompt,
      output: "",
      tokensUsed: 0,
      costUsd: 0,
      status: "running",
      startedAt: new Date(),
      completedAt: null,
    };

    set((state) => ({
      runs: [run, ...state.runs],
      activeRunByAgent: { ...state.activeRunByAgent, [agentId]: runId },
    }));

    // Cross-store: mark agent as working
    const agent = useAgentStore.getState().agents.find((a) => a.id === agentId);
    if (agent) {
      useAgentStore.getState().updateStatus(agentId, "working", prompt.slice(0, 60));
      useActivityStore.getState().addEntry({
        agentId: agent.id,
        agentName: agent.name,
        agentColor: agent.color,
        action: `Started working on: ${prompt.slice(0, 80)}`,
      });
    }

    return runId;
  },

  appendOutput: (runId, content) => {
    set((state) => ({
      runs: state.runs.map((r) =>
        r.id === runId ? { ...r, output: (r.output || "") + content } : r
      ),
    }));
  },

  completeRun: (runId, status) => {
    const run = get().runs.find((r) => r.id === runId);
    if (!run) return;

    set((state) => {
      const { [run.agentId]: _, ...remaining } = state.activeRunByAgent;
      return {
        runs: state.runs.map((r) =>
          r.id === runId ? { ...r, status, completedAt: new Date() } : r
        ),
        activeRunByAgent: remaining,
      };
    });

    // Cross-store: mark agent idle, update activity
    const agent = useAgentStore.getState().agents.find((a) => a.id === run.agentId);
    if (agent) {
      useAgentStore.getState().updateStatus(run.agentId, "idle", null);
      useActivityStore.getState().addEntry({
        agentId: agent.id,
        agentName: agent.name,
        agentColor: agent.color,
        action: status === "completed"
          ? `Completed: ${run.input.slice(0, 80)}`
          : `Failed: ${run.input.slice(0, 80)}`,
      });
    }

    // If linked to a task, complete it
    if (run.taskId && status === "completed") {
      useTaskStore.getState().completeTask(run.taskId);
    }
  },

  getRun: (runId) => get().runs.find((r) => r.id === runId),
  getActiveRun: (agentId) => {
    const runId = get().activeRunByAgent[agentId];
    return runId ? get().runs.find((r) => r.id === runId) : undefined;
  },
}));
```

- [ ] **Step 2: Verify build passes**

Run: `npx next build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add lib/stores/runs.ts
git commit -m "feat: runs store — track active CLI executions with cross-store effects"
```

---

### Task 6: Create useAgentStream Hook

**Files:**
- Create: `lib/hooks/use-agent-stream.ts`

- [ ] **Step 1: Create the hook file**

Create `lib/hooks/use-agent-stream.ts`:

```typescript
"use client";

import { useRef, useCallback } from "react";
import { useRunsStore } from "@/lib/stores/runs";

const activeControllers = new Map<string, AbortController>();

export function useAgentStream() {
  const startRun = useRunsStore((s) => s.startRun);
  const appendOutput = useRunsStore((s) => s.appendOutput);
  const completeRun = useRunsStore((s) => s.completeRun);
  const activeRunByAgent = useRunsStore((s) => s.activeRunByAgent);

  const run = useCallback(async (agentId: string, prompt: string, taskId?: string) => {
    // Prevent duplicate runs
    if (activeControllers.has(agentId)) return;

    const runId = startRun(agentId, taskId || null, prompt);
    const controller = new AbortController();
    activeControllers.set(agentId, controller);

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, prompt, taskId }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Request failed" }));
        appendOutput(runId, `Error: ${error.error || response.statusText}\n`);
        completeRun(runId, "failed");
        activeControllers.delete(agentId);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        completeRun(runId, "failed");
        activeControllers.delete(agentId);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if (eventType === "output") {
                appendOutput(runId, data.content + "\n");
              } else if (eventType === "error") {
                appendOutput(runId, `[stderr] ${data.content}\n`);
              } else if (eventType === "done") {
                completeRun(runId, data.content.includes("exit_code:0") ? "completed" : "failed");
                activeControllers.delete(agentId);
                return;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      // If stream ended without a done event
      if (activeControllers.has(agentId)) {
        completeRun(runId, "completed");
        activeControllers.delete(agentId);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        completeRun(runId, "failed");
      } else {
        appendOutput(runId, `Connection error: ${(err as Error).message}\n`);
        completeRun(runId, "failed");
      }
      activeControllers.delete(agentId);
    }
  }, [startRun, appendOutput, completeRun]);

  const stop = useCallback((agentId: string) => {
    const controller = activeControllers.get(agentId);
    if (controller) {
      controller.abort();
      activeControllers.delete(agentId);
    }
  }, []);

  const isRunning = useCallback((agentId: string) => {
    return !!activeRunByAgent[agentId];
  }, [activeRunByAgent]);

  return { run, stop, isRunning };
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx next build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add lib/hooks/use-agent-stream.ts
git commit -m "feat: useAgentStream hook — SSE client with abort support"
```

---

### Task 7: Create Agent Terminal Component

**Files:**
- Create: `components/agents/agent-terminal.tsx`

- [ ] **Step 1: Create the terminal component**

Create `components/agents/agent-terminal.tsx`:

```typescript
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
  const outputRef = useRef<HTMLDivElement>(null);
  const { stop, isRunning } = useAgentStream();
  const activeRun = useRunsStore((s) => s.getActiveRun(agentId));
  const pastRuns = useRunsStore((s) => s.runs.filter((r) => r.agentId === agentId));

  const displayRun = activeRun || pastRuns[0];

  // Auto-scroll to bottom when output updates
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [displayRun?.output]);

  const running = isRunning(agentId);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {running && (
            <>
              <span className="inline-block w-3 h-3 border-2 border-sage-200 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono text-sage-200">Running...</span>
            </>
          )}
          {!running && displayRun && (
            <>
              {displayRun.status === "completed" && (
                <span className="text-xs font-mono text-sage-200">&#10003; Completed</span>
              )}
              {displayRun.status === "failed" && (
                <span className="text-xs font-mono text-red-400">&#10007; Failed</span>
              )}
            </>
          )}
          {!running && !displayRun && (
            <span className="text-xs font-mono text-text-500">No runs yet</span>
          )}
        </div>
        {running && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => stop(agentId)}
            className="text-red-400 hover:text-red-300 text-xs"
          >
            Stop
          </Button>
        )}
      </div>

      {/* Terminal output */}
      <div
        ref={outputRef}
        className="flex-1 min-h-[200px] max-h-[400px] bg-gray-900 rounded-btn p-4 overflow-y-auto font-mono text-xs leading-relaxed"
      >
        {displayRun ? (
          <>
            <p className="text-text-500 mb-2">$ {displayRun.input.slice(0, 100)}{displayRun.input.length > 100 ? "..." : ""}</p>
            <pre className="whitespace-pre-wrap text-green-400">
              {displayRun.output || (running ? "" : "(no output)")}
            </pre>
            {running && <span className="text-green-400 animate-blink">|</span>}
          </>
        ) : (
          <p className="text-text-500">Assign a task to see output here.</p>
        )}
      </div>

      {/* Run history */}
      {pastRuns.length > 1 && (
        <div className="text-[10px] font-body text-text-500">
          {pastRuns.length} total runs for this agent
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx next build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add components/agents/agent-terminal.tsx
git commit -m "feat: AgentTerminal — streaming output panel with auto-scroll and stop"
```

---

### Task 8: Integrate Terminal Tab into AgentDetail

**Files:**
- Modify: `components/agents/agent-detail.tsx`

This task adds the "Terminal" tab and wires the "Assign task" button to actually run the agent via CLI.

- [ ] **Step 1: Update imports and tab type**

At the top of `components/agents/agent-detail.tsx`, add imports:

```typescript
import { AgentTerminal } from "@/components/agents/agent-terminal";
import { useAgentStream } from "@/lib/hooks/use-agent-stream";
```

Change the Tab type from:

```typescript
type Tab = "overview" | "prompt" | "instructions" | "skills";
```

To:

```typescript
type Tab = "overview" | "prompt" | "instructions" | "skills" | "terminal";
```

- [ ] **Step 2: Add terminal tab to the tabs array**

Change the tabs array from:

```typescript
const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "prompt", label: "Prompt" },
  { key: "instructions", label: "Instructions" },
  { key: "skills", label: "Skills" },
];
```

To:

```typescript
const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "prompt", label: "Prompt" },
  { key: "instructions", label: "Instructions" },
  { key: "skills", label: "Skills" },
  { key: "terminal", label: "Terminal" },
];
```

- [ ] **Step 3: Wire the Assign task button to useAgentStream**

Inside the component function, add the hook:

```typescript
const { run: runAgent } = useAgentStream();
```

Change `handleAssignTask` from:

```typescript
const handleAssignTask = () => {
  if (!newTaskText.trim()) return;
  createTask({ title: newTaskText.trim(), description: newTaskText.trim(), agentId: agent.id, priority: "P2" });
  setNewTaskText("");
};
```

To:

```typescript
const handleAssignTask = () => {
  if (!newTaskText.trim()) return;
  createTask({ title: newTaskText.trim(), description: newTaskText.trim(), agentId: agent.id, priority: "P2" });
  runAgent(agent.id, newTaskText.trim());
  setNewTaskText("");
  setActiveTab("terminal");
};
```

- [ ] **Step 4: Add terminal tab content**

After the skills tab content block (`{activeTab === "skills" && ...}`), add:

```typescript
{activeTab === "terminal" && (
  <AgentTerminal agentId={agent.id} />
)}
```

- [ ] **Step 5: Verify build passes**

Run: `npx next build`
Expected: Clean build.

- [ ] **Step 6: Commit**

```bash
git add components/agents/agent-detail.tsx
git commit -m "feat: integrate Terminal tab + wire Assign task to real CLI execution"
```

---

### Task 9: Add "Run Immediately" to TaskModal

**Files:**
- Modify: `components/tasks/task-modal.tsx`

- [ ] **Step 1: Add useAgentStream import and state**

Add import at top of `components/tasks/task-modal.tsx`:

```typescript
import { useAgentStream } from "@/lib/hooks/use-agent-stream";
```

Inside the `TaskModal` component function, add:

```typescript
const { run: runAgent } = useAgentStream();
const [runImmediately, setRunImmediately] = useState(true);
```

- [ ] **Step 2: Update handleSubmit to optionally run the agent**

Change `handleSubmit` from:

```typescript
const handleSubmit = () => {
  if (!description.trim()) return;
  createTask({
    title: description.trim(),
    description: description.trim(),
    agentId: agentId || null,
    priority,
  });
  setDescription("");
  setAgentId("");
  setPriority("P2");
  onClose();
};
```

To:

```typescript
const handleSubmit = () => {
  if (!description.trim()) return;
  createTask({
    title: description.trim(),
    description: description.trim(),
    agentId: agentId || null,
    priority,
  });
  if (agentId && runImmediately) {
    runAgent(agentId, description.trim());
  }
  setDescription("");
  setAgentId("");
  setPriority("P2");
  setRunImmediately(true);
  onClose();
};
```

- [ ] **Step 3: Add the checkbox to the form**

After the Priority SegmentedControl section and before the submit Button, add:

```typescript
{agentId && (
  <label className="flex items-center gap-2 text-sm font-body text-text-700">
    <input
      type="checkbox"
      checked={runImmediately}
      onChange={(e) => setRunImmediately(e.target.checked)}
      className="accent-pink-300"
    />
    Run agent immediately
  </label>
)}
```

- [ ] **Step 4: Verify build passes**

Run: `npx next build`
Expected: Clean build.

- [ ] **Step 5: Commit**

```bash
git add components/tasks/task-modal.tsx
git commit -m "feat: TaskModal — add 'Run agent immediately' checkbox for CLI execution"
```

---

### Task 10: End-to-End Verification

**Files:** None (testing only)

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Test the connect flow**

Navigate to `http://localhost:3000`. Connect all providers if not already connected. Navigate to dashboard.

- [ ] **Step 3: Test CLI execution via AgentDetail**

1. Click on an agent card (e.g., PM Agent)
2. In the Overview tab, type "Say hello and introduce yourself as the PM agent" in the task textarea
3. Click "Assign task"
4. Verify: tab auto-switches to "Terminal"
5. Verify: green streaming text appears in the terminal panel
6. Verify: agent status dot shows "working" (pulsing pink)
7. Verify: activity feed shows "Started working on: ..."
8. Wait for completion
9. Verify: status returns to idle
10. Verify: activity feed shows "Completed: ..."

- [ ] **Step 4: Test CLI execution via TaskModal**

1. Click "New Task +" button
2. Type a description, select an agent, leave "Run agent immediately" checked
3. Submit
4. Click on the assigned agent card → Terminal tab
5. Verify: output is streaming

- [ ] **Step 5: Test abort**

1. Assign a long task to an agent
2. Go to Terminal tab
3. Click "Stop" button
4. Verify: run shows as failed, agent returns to idle

- [ ] **Step 6: Test Gemini (DevOps agent)**

1. Click DevOps agent card
2. Assign task: "List 3 best practices for CI/CD pipelines"
3. Verify Gemini CLI is invoked and output streams correctly

- [ ] **Step 7: Verify production build**

Run: `npx next build`
Expected: Clean build with all routes.

- [ ] **Step 8: Commit any fixes**

If any issues were found and fixed during testing:

```bash
git add -A
git commit -m "fix: address issues found during Phase 2A end-to-end testing"
```
