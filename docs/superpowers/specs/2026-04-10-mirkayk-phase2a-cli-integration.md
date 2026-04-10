# mirkayk — Phase 2A: Real CLI Integration

**Date:** 2026-04-10
**Status:** Approved
**Scope:** Connect dashboard agents to real Claude + Gemini CLIs via Next.js API Routes with SSE streaming
**Depends on:** Phase 1 UI-first implementation (complete)

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Execution layer | Next.js API Routes | Zero infra overhead, local dev server has filesystem access |
| Streaming | Server-Sent Events (SSE) | Simpler than WebSocket for unidirectional CLI output |
| CLI abstraction | Adapter pattern per provider | Swap/add providers by editing config, not rewriting logic |
| Codex fallback | Route to Claude CLI | Codex not installed; config is one-line change when ready |
| Security | Server-side only execution | No CLI commands from browser; only validated prompts via adapter |

---

## Available CLIs

| Provider | CLI | Version | Non-interactive flag | Streaming |
|----------|-----|---------|---------------------|-----------|
| Claude | `claude` | 2.1.92 | `-p "prompt"` | `--verbose --output-format stream-json` (NDJSON) |
| Gemini | `gemini` | 0.35.3 | `-p "prompt"` | stdout line-by-line |
| Codex | not installed | — | — | — |

---

## Architecture

```
Browser (React)
  → POST /api/agent/run { agentId, prompt, taskId? }
  → Next.js API Route (server-side)
    → Read agent CLI config (provider, model, systemPrompt)
    → Spawn child process via adapter
    → Stream stdout as SSE events (text/event-stream)
  ← EventSource in browser reads SSE stream
  ← Zustand stores update: runs, agent status, activity feed
```

---

## New Files

| File | Purpose |
|------|---------|
| `lib/cli/adapter.ts` | CLI abstraction: spawn process, normalize output to CLIEvent stream |
| `lib/cli/config.ts` | Agent-to-CLI mapping (provider, model, flags) |
| `app/api/agent/run/route.ts` | POST endpoint: validate input, spawn CLI, return SSE stream |
| `lib/stores/runs.ts` | Zustand store for active/completed runs (AgentRun[]) |
| `lib/hooks/use-agent-stream.ts` | React hook: fetch SSE, update stores in real-time |
| `components/agents/agent-terminal.tsx` | Terminal output panel (dark bg, streaming text, auto-scroll) |

---

## Type System Additions

```typescript
interface CLIConfig {
  provider: "claude" | "gemini";
  model: string;
  flags?: string[];
}

interface CLIRunOptions {
  provider: "claude" | "gemini";
  model: string;
  prompt: string;
  systemPrompt?: string;
  workingDir?: string;
  flags?: string[];
}

interface CLIEvent {
  type: "output" | "error" | "done";
  content: string;
  timestamp: number;
}

// Extends existing AgentRun from Phase 1 types
// AgentRun.output becomes a growing string (appended per CLIEvent)
```

---

## CLI Adapter

### Interface

```typescript
function spawnCLI(options: CLIRunOptions): {
  stream: ReadableStream<CLIEvent>;
  kill: () => void;
};
```

### Claude Adapter

```bash
claude -p "<prompt>" \
  --model <model> \
  --system-prompt "<systemPrompt>" \
  --verbose \
  --output-format stream-json \
  --print
```

Parses NDJSON lines. Extracts `type: "assistant"` messages for output content. Maps process exit to `done` event.

### Gemini Adapter

```bash
gemini -p "<prompt>" \
  --model <model> \
  -s
```

Reads stdout line-by-line. Each line becomes an `output` event. Process exit maps to `done` event.

### Fallback behavior

If a configured CLI is not found in PATH, the API route returns a 503 error with the message: `"CLI '<provider>' not available. Install it or change agent config."`.

---

## API Route: `/api/agent/run`

### Request

```typescript
POST /api/agent/run
Content-Type: application/json

{
  agentId: string;     // must exist in AGENT_CLI_CONFIG
  prompt: string;      // task description / user instruction
  taskId?: string;     // optional link to existing task
}
```

### Validation

1. `agentId` must exist in `AGENT_CLI_CONFIG`
2. `prompt` must be non-empty string, max 10,000 chars
3. Reject if agent already has an active run (409 Conflict)

### Response

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

event: output
data: {"content": "Hello, I'll help you with...", "timestamp": 1712764800000}

event: error
data: {"content": "stderr line", "timestamp": 1712764801000}

event: done
data: {"content": "exit_code:0", "timestamp": 1712764805000}
```

### Error Responses

| Status | When |
|--------|------|
| 400 | Invalid agentId, empty prompt, prompt too long |
| 409 | Agent already has active run |
| 503 | CLI not found in PATH |

---

## Runs Store

```typescript
// lib/stores/runs.ts
interface RunsStore {
  runs: AgentRun[];
  activeRunByAgent: Record<string, string>; // agentId → runId

  startRun(agentId: string, taskId: string | null, prompt: string): string; // returns runId
  appendOutput(runId: string, content: string): void;
  completeRun(runId: string, status: "completed" | "failed"): void;
  getRun(runId: string): AgentRun | undefined;
  getActiveRun(agentId: string): AgentRun | undefined;
}
```

### Cross-store effects

- `startRun()` → `agentStore.updateStatus(agentId, "working")` + `activityStore.addEntry()`
- `completeRun()` → `agentStore.updateStatus(agentId, "idle")` + `activityStore.addEntry()` + optionally `taskStore.completeTask(taskId)`

---

## useAgentStream Hook

```typescript
function useAgentStream(): {
  run: (agentId: string, prompt: string, taskId?: string) => void;
  stop: (agentId: string) => void;
  isRunning: (agentId: string) => boolean;
};
```

### Flow

1. `run()` calls `runsStore.startRun()` to create local run
2. `fetch('/api/agent/run', { method: 'POST', body })` with streaming
3. Read response body as `ReadableStream` via `getReader()`
4. Parse SSE events, call `runsStore.appendOutput()` per chunk
5. On `done` event, call `runsStore.completeRun()`
6. On error/abort, call `runsStore.completeRun(runId, "failed")`

### Abort

- `stop()` calls `AbortController.abort()` on the active fetch
- Server-side: detects client disconnect, kills child process

---

## Agent Terminal Component

```typescript
// components/agents/agent-terminal.tsx
interface AgentTerminalProps {
  agentId: string;
}
```

### UI

- Dark background (`bg-gray-900`), same style as connect terminal modal
- JetBrains Mono font, green text for output, red for errors
- Auto-scrolls to bottom as new output arrives
- Shows run status: spinner while running, checkmark when done, X on error
- "Stop" button to abort active run
- Scrollable history of past run outputs

### Placement

- New "Terminal" tab in AgentDetail panel (5th tab after Skills)
- Shows most recent run output, with dropdown to view past runs

---

## Agent CLI Config

```typescript
// lib/cli/config.ts
export const AGENT_CLI_CONFIG: Record<string, CLIConfig> = {
  "agent-pm":        { provider: "claude", model: "claude-sonnet-4-6" },
  "agent-architect": { provider: "claude", model: "claude-opus-4-6" },
  "agent-frontend":  { provider: "claude", model: "claude-sonnet-4-6" },
  "agent-backend":   { provider: "claude", model: "claude-sonnet-4-6" },   // fallback from codex
  "agent-qa":        { provider: "claude", model: "claude-sonnet-4-6" },   // fallback from codex
  "agent-devops":    { provider: "gemini", model: "gemini-2.5-pro" },
};
```

Agent IDs must match the IDs in `lib/mock/agents.ts`. If an agent's ID is not in this config, the API route returns 400.

---

## Integration with Existing UI

### AgentDetail Changes

- "Assign task" button in Overview tab → calls `useAgentStream().run()` instead of just creating a task
- New "Terminal" tab shows live output
- Status badge updates in real-time via runsStore subscription

### TaskModal Changes

- After creating task with assigned agent, optionally auto-runs the agent
- New checkbox: "Run agent immediately" (default: true)

### AgentCard Changes

- Status dot reflects real run status (working = CLI running, idle = no active run)
- Already handled by existing agentStore subscription

### Activity Feed

- Shows real events: "PM started working on: Design API schema"
- Shows completion: "PM completed task (exit code 0)"

---

## Scope Boundaries

### Included

- CLI adapter for Claude and Gemini
- API route with SSE streaming
- Runs store with cross-store effects
- useAgentStream hook
- Agent terminal component
- Integration with existing assign task flow
- Agent config file (editable)
- Graceful handling of missing CLIs

### Excluded

- Codex CLI adapter (not installed)
- Tool use / file editing permissions in CLI
- Multi-turn conversations (single prompt → response only)
- Token counting / cost tracking (Phase 2B)
- Settings UI for changing agent configs (Phase 2B)
- Queue system for concurrent runs (one run per agent max)
- Persistent run history (in-memory Zustand only)

---

## Agent ID Reference

IDs must match between `lib/mock/agents.ts` and `lib/cli/config.ts`:

| Agent | ID | Provider | Model |
|-------|----|----------|-------|
| PM | agent-pm | claude | claude-sonnet-4-6 |
| Architect | agent-architect | claude | claude-opus-4-6 |
| Frontend | agent-frontend | claude | claude-sonnet-4-6 |
| Backend | agent-backend | claude (codex fallback) | claude-sonnet-4-6 |
| QA | agent-qa | claude (codex fallback) | claude-sonnet-4-6 |
| DevOps | agent-devops | gemini | gemini-2.5-pro |
