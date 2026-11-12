import Anthropic from "@anthropic-ai/sdk";

import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-context";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_TURNS = 12;
const MAX_CHARS = 1000;

// Best-effort per-instance limiter. Serverless instances don't share it, so it
// only blunts bursts. Set a spend limit on the API key for a hard ceiling.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

type Turn = { role: "user" | "assistant"; content: string };

function parseTurns(body: unknown): Turn[] | null {
  if (!body || typeof body !== "object" || !Array.isArray((body as { messages?: unknown }).messages)) return null;
  const raw = (body as { messages: unknown[] }).messages.slice(-MAX_TURNS);
  const turns: Turn[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, MAX_CHARS);
    if (text) turns.push({ role, content: text });
  }
  // The API requires the conversation to open with a user turn.
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

let client: Anthropic | null = null;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const turns = parseTurns(await req.json().catch(() => null));
  if (!turns) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  client ??= new Anthropic();

  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: CHAT_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: turns,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            // The prompt asks for no long dashes; this catches any that slip through.
            const text = event.delta.text.replace(/\s*—\s*/g, ", ").replace(/–/g, "-");
            controller.enqueue(encoder.encode(text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode(`\n\nI can't help with that one. You can email Darsh directly instead.`));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("…"));
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          controller.enqueue(encoder.encode("\n\nThe assistant is busy right now. Try again in a minute."));
        } else if (error instanceof Anthropic.APIError) {
          controller.enqueue(encoder.encode("\n\nSomething went wrong on my side. Try again, or email Darsh."));
        } else {
          controller.enqueue(encoder.encode("\n\nThe connection dropped. Try again."));
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
