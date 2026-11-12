import { buildSystemPrompt } from "@/lib/chat-context";

/**
 * Chat assistant backed by a self-hosted, OpenAI-compatible endpoint.
 *
 * Secrets: LLM_KEY is read here, on the server, and sent only as the upstream
 * Authorization header. It is never logged, never included in a response, and
 * upstream error bodies are never forwarded to the browser. It must not be
 * given a NEXT_PUBLIC_ prefix, which would inline it into client bundles.
 *
 * Environment:
 *   LLM_KEY       required, bearer token for the endpoint
 *   LLM_BASE_URL  optional, defaults to the Tailscale Funnel host below
 *   LLM_MODEL     optional, defaults to DEFAULT_MODEL below
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_BASE_URL = "https://darsh-windows-laptop.tail635357.ts.net";
const DEFAULT_MODEL = "qwen2.5-coder:3b";
const MAX_TURNS = 12;
const MAX_CHARS = 1000;
const UPSTREAM_TIMEOUT_MS = 45_000;

// Best-effort per-instance limiter. Serverless instances don't share it, so it
// only blunts bursts; the endpoint itself should still enforce its own limits.
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
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

function baseUrl(): string {
  return (process.env.LLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function authHeaders(key: string): Record<string, string> {
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

/** Trailing text that could be the start of `tag`, e.g. "</th" for "</think>". */
function partialTag(text: string, tag: string): string {
  const lt = text.lastIndexOf("<");
  return lt !== -1 && tag.startsWith(text.slice(lt)) ? text.slice(lt) : "";
}

/** Drops <think>...</think> blocks that some reasoning models put in the visible text. */
function makeThinkFilter() {
  let inThink = false;
  let carry = "";
  return (chunk: string): string => {
    let text = carry + chunk;
    carry = "";
    let out = "";
    for (;;) {
      if (inThink) {
        const end = text.indexOf("</think>");
        if (end === -1) {
          // Keep a possible partial "</think>" so a tag split across chunks still closes.
          carry = partialTag(text, "</think>");
          return out;
        }
        text = text.slice(end + "</think>".length);
        inThink = false;
      } else {
        const start = text.indexOf("<think>");
        if (start === -1) {
          // Hold back a possible partial "<think>" split across chunks.
          carry = partialTag(text, "<think>");
          return out + text.slice(0, text.length - carry.length);
        }
        out += text.slice(0, start);
        text = text.slice(start + "<think>".length);
        inThink = true;
      }
    }
  };
}

/**
 * One line per request in the Vercel logs: timings, upstream status and error
 * type only. Never the key, the prompt, the visitor's text or the reply.
 */
function logUpstream(fields: Record<string, string | number | boolean | undefined>) {
  // eslint-disable-next-line no-console
  console.info(JSON.stringify({ evt: "chat_upstream", ...fields }));
}

function errorKind(err: unknown): string {
  if (!(err instanceof Error)) return "unknown";
  const cause = (err as Error & { cause?: { code?: unknown } }).cause;
  return [err.name, typeof cause?.code === "string" ? cause.code : ""].filter(Boolean).join(":");
}

const offlineReply = "The assistant is offline right now. Try again later, or email Darsh directly.";
const plain = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };

export async function POST(req: Request) {
  const key = process.env.LLM_KEY;
  if (!key) {
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

  const model = process.env.LLM_MODEL || DEFAULT_MODEL;
  // Retrieval uses the latest question plus the one before it, so follow-ups
  // like "and what stack did it use?" still find the right project.
  const userTurns = turns.filter((t) => t.role === "user");
  const systemPrompt = buildSystemPrompt(userTurns.slice(-2).map((t) => t.content).join(" "));

  const started = Date.now();
  const upstream = new AbortController();
  const timer = setTimeout(() => upstream.abort(), UPSTREAM_TIMEOUT_MS);
  req.signal.addEventListener("abort", () => upstream.abort());

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/v1/chat/completions`, {
      method: "POST",
      headers: authHeaders(key),
      body: JSON.stringify({
        model,
        stream: true,
        max_tokens: 400,
        temperature: 0.3,
        messages: [{ role: "system", content: systemPrompt }, ...turns],
      }),
      signal: upstream.signal,
      cache: "no-store",
    });
  } catch (err) {
    clearTimeout(timer);
    logUpstream({ stage: "connect", ms: Date.now() - started, error: errorKind(err), timedOut: upstream.signal.aborted });
    return new Response(offlineReply, { headers: plain });
  }
  const headersMs = Date.now() - started;

  if (!res.ok || !res.body) {
    clearTimeout(timer);
    logUpstream({ stage: "status", status: res.status, ms: headersMs });
    // Deliberately generic: the upstream body is never echoed to the browser.
    const reply = res.status === 429 ? "The assistant is busy right now. Try again in a minute." : offlineReply;
    return new Response(reply, { headers: plain });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const stripThink = makeThinkFilter();
  // The prompt asks for no long dashes; this catches any that slip through.
  const clean = (t: string) => t.replace(/\s*—\s*/g, ", ").replace(/–/g, "-");
  const reader = res.body.getReader();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      let sent = false;
      let firstTokenMs: number | undefined;
      const emit = (text: string) => {
        const visible = clean(stripThink(text));
        if (visible) {
          firstTokenMs ??= Date.now() - started;
          sent = true;
          controller.enqueue(encoder.encode(visible));
        }
      };
      const handleLine = (raw: string) => {
        const line = raw.trim();
        if (!line.startsWith("data:")) return;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") return;
        try {
          const json = JSON.parse(data) as {
            choices?: { delta?: { content?: unknown }; message?: { content?: unknown } }[];
          };
          const choice = json.choices?.[0];
          const text = choice?.delta?.content ?? choice?.message?.content;
          if (typeof text === "string") emit(text);
        } catch {
          /* keep-alives and partial lines */
        }
      };
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            handleLine(buffer.slice(0, nl));
            buffer = buffer.slice(nl + 1);
          }
        }
        handleLine(buffer);
        if (!sent) controller.enqueue(encoder.encode("I couldn't come up with an answer. Try rephrasing?"));
        logUpstream({ stage: "done", status: res.status, headersMs, firstTokenMs, ms: Date.now() - started, sent });
      } catch (err) {
        logUpstream({ stage: "stream", headersMs, firstTokenMs, ms: Date.now() - started, error: errorKind(err), timedOut: upstream.signal.aborted, sent });
        controller.enqueue(encoder.encode(sent ? "\n\nThe connection dropped. Try again." : offlineReply));
      } finally {
        clearTimeout(timer);
        controller.close();
      }
    },
    cancel() {
      upstream.abort();
    },
  });

  return new Response(body, { headers: plain });
}
