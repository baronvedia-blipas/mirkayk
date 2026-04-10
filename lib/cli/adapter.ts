import { spawn, ChildProcess } from "child_process";
import { CLIRunOptions, CLIEvent } from "@/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────

function now(): number {
  return Date.now();
}

function makeEvent(type: CLIEvent["type"], content: string): CLIEvent {
  return { type, content, timestamp: now() };
}

/**
 * Parse a single NDJSON line emitted by `claude --output-format stream-json`.
 * Returns a content string when the line carries displayable text, or null otherwise.
 */
function parseClaudeLine(line: string): string | null {
  try {
    const event = JSON.parse(line);
    if (event.type === "assistant" && event.message) {
      // message may contain a content array
      if (typeof event.message === "string") return event.message;
      if (Array.isArray(event.message?.content)) {
        return event.message.content
          .filter((b: { type?: string; text?: string }) => b.type === "text" && b.text)
          .map((b: { text: string }) => b.text)
          .join("");
      }
    }
    if (event.type === "content_block_delta" && event.delta?.text) {
      return event.delta.text as string;
    }
    if (event.type === "result" && event.result != null) {
      return String(event.result);
    }
    return null;
  } catch {
    // Non-JSON line (startup message) — pass through if non-empty
    return line.trim() || null;
  }
}

// ── spawnCLI ─────────────────────────────────────────────────────────────────

export function spawnCLI(options: CLIRunOptions): {
  stream: ReadableStream<CLIEvent>;
  kill: () => void;
} {
  const { provider, model, prompt, systemPrompt, workingDir, flags = [] } = options;

  let child: ChildProcess | null = null;

  const stream = new ReadableStream<CLIEvent>({
    start(controller) {
      // Build argument list
      let args: string[];

      if (provider === "claude") {
        args = [
          "-p", `"${prompt}"`,
          "--model", model,
          "--verbose",
          "--output-format", "stream-json",
        ];
        if (systemPrompt) {
          args.push("--system-prompt", `"${systemPrompt}"`);
        }
        args.push(...flags);
      } else {
        // gemini
        args = [
          "-p", `"${prompt}"`,
          "--model", model,
          "-s",
        ];
        args.push(...flags);
      }

      try {
        child = spawn(provider, args, {
          shell: true,
          cwd: workingDir,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(makeEvent("error", msg));
        controller.enqueue(makeEvent("done", "exit_code:1"));
        controller.close();
        return;
      }

      // ── stdout ───────────────────────────────────────────────────────────
      let stdoutBuf = "";

      child.stdout?.on("data", (chunk: Buffer) => {
        stdoutBuf += chunk.toString();
        const lines = stdoutBuf.split("\n");
        // Keep last (possibly incomplete) chunk in buffer
        stdoutBuf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line) continue;

          if (provider === "claude") {
            const text = parseClaudeLine(line);
            if (text) {
              controller.enqueue(makeEvent("output", text));
            }
          } else {
            // gemini — plain text
            controller.enqueue(makeEvent("output", line));
          }
        }
      });

      // ── stderr ───────────────────────────────────────────────────────────
      let stderrBuf = "";

      child.stderr?.on("data", (chunk: Buffer) => {
        stderrBuf += chunk.toString();
        const lines = stderrBuf.split("\n");
        stderrBuf = lines.pop() ?? "";

        for (const line of lines) {
          if (line) {
            controller.enqueue(makeEvent("error", line));
          }
        }
      });

      // ── process error (e.g., command not found) ──────────────────────────
      child.on("error", (err: Error) => {
        controller.enqueue(makeEvent("error", err.message));
        controller.enqueue(makeEvent("done", "exit_code:1"));
        try { controller.close(); } catch { /* already closed */ }
      });

      // ── process close ────────────────────────────────────────────────────
      child.on("close", (code: number | null) => {
        // Flush stdout buffer
        if (stdoutBuf) {
          if (provider === "claude") {
            const text = parseClaudeLine(stdoutBuf);
            if (text) controller.enqueue(makeEvent("output", text));
          } else {
            controller.enqueue(makeEvent("output", stdoutBuf));
          }
          stdoutBuf = "";
        }

        // Flush stderr buffer
        if (stderrBuf) {
          controller.enqueue(makeEvent("error", stderrBuf));
          stderrBuf = "";
        }

        controller.enqueue(makeEvent("done", `exit_code:${code ?? 1}`));
        try { controller.close(); } catch { /* already closed */ }
      });
    },

    cancel() {
      child?.kill("SIGTERM");
    },
  });

  return {
    stream,
    kill() {
      child?.kill("SIGTERM");
    },
  };
}

// ── isCLIAvailable ───────────────────────────────────────────────────────────

export function isCLIAvailable(provider: "claude" | "gemini"): Promise<boolean> {
  return new Promise((resolve) => {
    let child: ChildProcess;
    try {
      child = spawn(provider, ["--version"], { shell: true });
    } catch {
      return resolve(false);
    }

    child.on("error", () => resolve(false));
    child.on("close", (code: number | null) => resolve(code === 0));
  });
}
