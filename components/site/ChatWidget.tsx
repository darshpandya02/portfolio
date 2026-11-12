"use client";

import { useEffect, useRef, useState } from "react";

import { links, profile } from "@/lib/content";

type Turn = { role: "user" | "assistant"; content: string };

const suggestions = [
  "What does Darsh work on at SPHERE?",
  "Which projects show distributed systems work?",
  "What's his backend stack?",
  "Where did he study?",
  "How do I contact him?",
];

const TEASER_KEY = "chat-teaser-seen";

const greeting: Turn = {
  role: "assistant",
  content: `Hi! I'm ${profile.name.split(" ")[0]}'s AI assistant. Ask me anything about him: his experience, projects, skills, research, education or how to reach him.`,
};

/**
 * Chat assistant pinned to the bottom-right corner of every page (mounted in the
 * root layout). Streams plain text from /api/chat.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([greeting]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns]);

  // A one-time nudge, a few seconds in, so visitors notice the assistant exists.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(TEASER_KEY) === "1";
    } catch {
      /* storage blocked: show it anyway */
    }
    if (seen) return;
    const show = window.setTimeout(() => setTeaser(true), 3500);
    const hide = window.setTimeout(() => setTeaser(false), 14000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  const dismissTeaser = () => {
    setTeaser(false);
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);

    // The greeting is UI only, so it never goes to the model.
    const history = [
      ...turns.slice(1),
      { role: "user" as const, content: question },
    ];
    setTurns([greeting, ...history, { role: "assistant", content: "" }]);

    const write = (content: string) =>
      setTurns((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content },
      ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (res.status === 503) {
        setOffline(true);
        write(
          `The assistant isn't switched on yet. You can reach ${profile.name.split(" ")[0]} at ${profile.email}.`,
        );
        return;
      }
      if (res.status === 429) {
        write(
          "That's a lot of questions! Give it a few minutes, or email him directly.",
        );
        return;
      }
      if (!res.ok || !res.body) {
        write("Something went wrong. Try again in a moment.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        write(answer);
      }
      if (!answer.trim())
        write("I couldn't come up with an answer. Try rephrasing?");
    } catch {
      write("The connection dropped. Check your network and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 font-[family-name:var(--ed-body)] sm:bottom-6 sm:right-6">
      {teaser && !open ? (
        <div className="fx-float flex max-w-[16rem] items-start gap-2 rounded-2xl border border-ed-line bg-[var(--ed-surface-solid)] px-4 py-3 text-sm text-ed-ink shadow-[0_20px_50px_-20px_var(--glow)]">
          <button
            type="button"
            className="text-left"
            onClick={() => {
              dismissTeaser();
              setOpen(true);
            }}
          >
            Got a question about Darsh?{" "}
            <span className="fx-gradient-text font-semibold">
              Ask me anything.
            </span>
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismissTeaser}
            className="-mr-1 -mt-0.5 shrink-0 text-ed-faint hover:text-ed-ink"
          >
            ×
          </button>
        </div>
      ) : null}
      {open ? (
        <div
          role="dialog"
          aria-label="Ask about Darsh's work"
          className="flex h-[min(560px,calc(100dvh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-ed-line bg-[var(--ed-surface-solid)] shadow-[0_30px_80px_-20px_var(--glow)]"
        >
          <div className="flex items-center gap-3 border-b border-ed-line px-4 py-3">
            <span
              className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[var(--c1)] to-[var(--c2)] text-xs font-bold text-white"
              aria-hidden
            >
              AI
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Ask about my work</p>
              <p className="text-xs text-ed-muted">
                Knows his work, projects and background
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid h-8 w-8 place-items-center rounded-full text-ed-muted hover:bg-ed-sunken hover:text-ed-ink"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div
            ref={logRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            aria-live="polite"
          >
            {turns.map((turn, i) => (
              <div
                key={i}
                className={turn.role === "user" ? "flex justify-end" : "flex"}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    turn.role === "user"
                      ? "bg-gradient-to-br from-[var(--c1)] to-[color-mix(in_srgb,var(--c1)_60%,var(--c3))] text-white"
                      : "border border-ed-line bg-ed-sunken"
                  }`}
                >
                  {turn.content || (
                    <span className="inline-block animate-pulse text-ed-faint">
                      Thinking…
                    </span>
                  )}
                </p>
              </div>
            ))}
            {turns.length === 1 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-ed-line px-3 py-1.5 text-left text-xs text-ed-muted transition-colors hover:border-ed-accent hover:text-ed-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {offline ? (
            <div className="border-t border-ed-line px-4 py-3 text-sm">
              <a
                href={links.email}
                className="font-medium text-ed-accent underline-offset-4 hover:underline"
              >
                Email {profile.email}
              </a>
            </div>
          ) : (
            <form
              className="flex items-end gap-2 border-t border-ed-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <label htmlFor="chat-input" className="sr-only">
                Your question
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                maxLength={1000}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask a question…"
                className="max-h-28 min-h-[40px] flex-1 resize-none rounded-xl border border-ed-line bg-ed-bg px-3 py-2 text-sm text-ed-ink placeholder:text-ed-faint focus:border-[var(--c2)] focus:ring-0"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="fx-btn-primary h-10 rounded-xl px-4 text-sm font-semibold disabled:opacity-40"
              >
                Send
              </button>
            </form>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          dismissTeaser();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        data-magnetic
        className="fx-ring flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-ed-ink shadow-[0_10px_40px_-10px_var(--c1)]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
          <path
            d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        {open ? "Close" : "Ask AI about me"}
        {!open ? (
          <span
            className="fx-pulse ml-0.5 h-2 w-2 rounded-full bg-[var(--c2)]"
            aria-hidden
          />
        ) : null}
      </button>
    </div>
  );
}
