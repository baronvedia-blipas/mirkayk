import { NextRequest, NextResponse } from "next/server";
import { getAgentCLIConfig } from "@/lib/cli/config";
import { spawnCLI, isCLIAvailable } from "@/lib/cli/adapter";
import { CLIEvent } from "@/lib/types";
import { prisma } from "@/lib/db";

// ── Active run tracking (server-side, module-level) ──────────────────────────

const activeRuns = new Map<string, { kill: () => void }>();

// ── POST /api/agent/run ───────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  // 1. Parse JSON body
  let body: { agentId?: unknown; prompt?: unknown; taskId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { agentId, prompt, taskId } = body;

  // 2. Validate agentId
  if (!agentId || typeof agentId !== "string" || agentId.trim() === "") {
    return NextResponse.json({ error: "agentId must be a non-empty string" }, { status: 400 });
  }

  const config = getAgentCLIConfig(agentId);
  if (!config) {
    return NextResponse.json({ error: `Unknown agentId: ${agentId}` }, { status: 400 });
  }

  // 3. Validate prompt
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return NextResponse.json({ error: "prompt must be a non-empty string" }, { status: 400 });
  }

  if (prompt.length > 10_000) {
    return NextResponse.json({ error: "prompt exceeds maximum length of 10,000 characters" }, { status: 400 });
  }

  // 4. Check for active run (409 Conflict)
  if (activeRuns.has(agentId)) {
    return NextResponse.json({ error: `Agent ${agentId} already has an active run` }, { status: 409 });
  }

  // 5. Check CLI availability
  const available = await isCLIAvailable(config.provider);
  if (!available) {
    return NextResponse.json(
      { error: `CLI provider "${config.provider}" is not available` },
      { status: 503 }
    );
  }

  // 6. Spawn CLI process
  const { stream: cliStream, kill } = spawnCLI({
    provider: config.provider,
    model: config.model,
    prompt,
    flags: config.flags,
  });

  // Track as active run
  activeRuns.set(agentId, { kill });

  // 6b. Persist run to database
  const dbRun = await prisma.run.create({
    data: {
      agentId,
      taskId: typeof taskId === "string" ? taskId : null,
      input: prompt,
      status: "running",
    },
  });

  // 7. Convert CLIEvent ReadableStream to SSE ReadableStream
  const encoder = new TextEncoder();

  const sseStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = cliStream.getReader();
      let outputBuffer = "";
      let flushTimeout: ReturnType<typeof setTimeout> | null = null;

      const flushOutput = async () => {
        if (outputBuffer) {
          const toFlush = outputBuffer;
          outputBuffer = "";
          try {
            await prisma.run.update({
              where: { id: dbRun.id },
              data: { output: { set: toFlush } },
            });
          } catch {
            // DB write failure shouldn't break the stream
          }
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const event = value as CLIEvent;

          // Accumulate output for DB persistence
          if (event.type === "output") {
            outputBuffer += event.content;
            // Debounce DB writes to every 2 seconds
            if (!flushTimeout) {
              flushTimeout = setTimeout(async () => {
                flushTimeout = null;
                await flushOutput();
              }, 2000);
            }
          }

          // Format SSE frame
          const sseFrame =
            `event: ${event.type}\n` +
            `data: ${JSON.stringify({ content: event.content, timestamp: event.timestamp })}\n\n`;

          controller.enqueue(encoder.encode(sseFrame));

          // On done event, persist final state and clean up
          if (event.type === "done") {
            if (flushTimeout) {
              clearTimeout(flushTimeout);
              flushTimeout = null;
            }
            const exitCode = event.content.match(/exit_code:(\d+)/)?.[1];
            const finalStatus = exitCode === "0" ? "completed" : "failed";
            outputBuffer += ""; // ensure we have latest
            try {
              await prisma.run.update({
                where: { id: dbRun.id },
                data: {
                  output: outputBuffer || undefined,
                  status: finalStatus,
                  endedAt: new Date(),
                },
              });
            } catch {
              // DB write failure shouldn't break the stream
            }
            activeRuns.delete(agentId);
          }
        }
      } catch (err) {
        // Emit an error SSE event before closing
        const errMsg = err instanceof Error ? err.message : String(err);
        const errorFrame =
          `event: error\n` +
          `data: ${JSON.stringify({ content: errMsg, timestamp: Date.now() })}\n\n`;
        try {
          controller.enqueue(encoder.encode(errorFrame));
        } catch {
          // controller may already be closing
        }
      } finally {
        if (flushTimeout) clearTimeout(flushTimeout);
        try {
          reader.releaseLock();
        } catch {
          // ignore
        }
        try {
          controller.close();
        } catch {
          // ignore if already closed
        }
        // Ensure cleanup on any exit path
        activeRuns.delete(agentId);
      }
    },

    cancel() {
      // Client disconnected — kill the process
      kill();
      activeRuns.delete(agentId);
      // Mark run as failed in DB
      prisma.run.update({
        where: { id: dbRun.id },
        data: { status: "failed", endedAt: new Date() },
      }).catch(() => {});
    },
  });

  // 8. Return SSE response
  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
