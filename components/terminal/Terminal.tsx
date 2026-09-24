"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { profile } from "@/lib/content";
import { complete, execute, type CommandContext } from "@/lib/terminal/commands";
import { HOME, prettyPath } from "@/lib/terminal/fs";
import { defaultTheme, themeKeys, THEME_STORAGE_KEY } from "@/lib/terminal/themes";

import { Ascii, asciiName, Cmd, Line } from "./atoms";

interface Entry {
  id: number;
  cwd: string;
  input: string;
  output: ReactNode;
}

const BOOT_LINES = [
  "Booting portfolio.sh …",
  "Loading /home/darsh … ok",
  "Mounting experience.md, projects.md, skills.md … ok",
  "Establishing session … ok",
];

const SUGGESTIONS = ["whoami", "cat projects.md", "ssh darsh@portfolio", "experience", "help"];

function PromptLabel({ cwd }: { cwd: string }) {
  return (
    <span className="select-none whitespace-nowrap">
      <span className="text-term-green">
        {profile.handle}@{profile.host}
      </span>
      <span className="text-term-faint">:</span>
      <span className="text-term-blue">{prettyPath(cwd)}</span>
      <span className="text-term-accent"> $</span>
    </span>
  );
}

export default function Terminal() {
  const router = useRouter();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState(HOME);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [theme, setThemeState] = useState(defaultTheme);
  const [bootStep, setBootStep] = useState(0);
  const [caretAtEnd, setCaretAtEnd] = useState(true);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const bootedAt = useRef(Date.now());
  const draft = useRef("");

  const booted = bootStep >= BOOT_LINES.length;

  /* ------------------------------ boot sequence ----------------------------- */

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setBootStep(BOOT_LINES.length);
      return;
    }
    let step = 0;
    const tick = () => {
      step += 1;
      setBootStep(step);
      if (step < BOOT_LINES.length) timer = window.setTimeout(tick, 160 + Math.random() * 120);
    };
    let timer = window.setTimeout(tick, 220);
    return () => window.clearTimeout(timer);
  }, []);

  /* -------------------------------- theming -------------------------------- */

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(THEME_STORAGE_KEY) : null;
    if (stored && themeKeys.includes(stored)) setThemeState(stored);
  }, []);

  const setTheme = useCallback((key: string) => {
    setThemeState(key);
    document.documentElement.dataset.theme = key;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, key);
    } catch {
      /* private browsing — the theme just won't persist */
    }
  }, []);

  /* -------------------------------- running -------------------------------- */

  const push = useCallback((entry: Omit<Entry, "id">) => {
    setEntries((prev) => [...prev, { ...entry, id: nextId.current++ }]);
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed) setHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(null);
      draft.current = "";

      if (!trimmed) {
        push({ cwd, input: "", output: null });
        return;
      }

      let cleared = false;
      const ctx: CommandContext = {
        cwd,
        setCwd,
        clear: () => {
          cleared = true;
          setEntries([]);
        },
        navigate: (href) => router.push(href),
        setTheme,
        theme,
        history,
        run: runCommand,
        bootedAt: bootedAt.current,
      };

      const output = execute(trimmed, ctx) ?? null;
      if (!cleared) push({ cwd, input: trimmed, output });
    },
    [cwd, history, push, router, setTheme, theme],
  );

  /* ------------------------------- key handling ----------------------------- */

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runCommand(input);
      setInput("");
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const matches = complete(input, cwd);
      if (matches.length === 0) return;
      if (matches.length === 1) {
        const tokens = input.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
        const endsWithSpace = /\s$/.test(input);
        const head = endsWithSpace ? tokens : tokens.slice(0, -1);
        const completion = matches[0];
        setInput((head.length ? head.join(" ") + " " : "") + completion + (completion.endsWith("/") ? "" : " "));
      } else {
        push({
          cwd,
          input,
          output: (
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-term-cyan">
              {matches.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          ),
        });
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === null) draft.current = input;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(history[next]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setInput(draft.current);
      } else {
        setHistoryIndex(next);
        setInput(history[next]);
      }
      return;
    }

    if (event.ctrlKey && (event.key === "l" || event.key === "L")) {
      event.preventDefault();
      setEntries([]);
      return;
    }

    if (event.ctrlKey && (event.key === "c" || event.key === "C")) {
      // Only hijack Ctrl+C when there's nothing selected, so copying still works.
      if (window.getSelection()?.toString()) return;
      event.preventDefault();
      push({ cwd, input: `${input}^C`, output: null });
      setInput("");
      setHistoryIndex(null);
      return;
    }

    if (event.ctrlKey && (event.key === "u" || event.key === "U")) {
      event.preventDefault();
      setInput("");
      return;
    }
  };

  /* -------------------------------- effects -------------------------------- */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [entries, bootStep]);

  useEffect(() => {
    if (booted) inputRef.current?.focus({ preventScroll: true });
  }, [booted]);

  // Typing anywhere on the page should land in the prompt.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1 && event.key !== "Backspace") return;
      inputRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const syncCaret = () => {
    const el = inputRef.current;
    if (!el) return;
    setCaretAtEnd(el.selectionStart === el.value.length && el.selectionStart === el.selectionEnd);
  };

  const focusInput = (event: React.MouseEvent) => {
    // Don't steal focus from links or an in-progress text selection.
    if ((event.target as HTMLElement).closest("a, button")) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  const bootRows = useMemo(() => BOOT_LINES.slice(0, bootStep), [bootStep]);

  return (
    <div
      ref={scrollRef}
      onMouseUp={focusInput}
      className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-term-border"
    >
      <div className="flex-1 space-y-4 p-4 text-sm sm:p-6">
        {/* boot */}
        <div className="space-y-0.5">
          {bootRows.map((line) => (
            <div key={line} className="animate-fade-up text-term-faint">
              <span className="text-term-green">✓</span> {line}
            </div>
          ))}
        </div>

        {booted ? (
          <div className="animate-fade-up space-y-3">
            <Ascii art={asciiName} />
            <div className="space-y-1">
              <Line tone="dim">
                {profile.role} @ {profile.company} — {profile.location}
              </Line>
              <Line tone="faint">{profile.tagline}</Line>
            </div>
            <div className="rounded border border-term-border bg-term-panel/60 p-3">
              <Line tone="dim">
                This is a shell. Type a command and press <span className="term-kbd">Enter</span>.
              </Line>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      runCommand(suggestion);
                      setInput("");
                      inputRef.current?.focus({ preventScroll: true });
                    }}
                    className="rounded border border-term-border bg-term-raised px-2 py-1 text-xs text-term-cyan transition-colors hover:border-term-accent/60 hover:text-term-accent"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-term-faint">
                <span className="term-kbd">Tab</span> completes · <span className="term-kbd">↑</span> recalls ·{" "}
                <Cmd>help</Cmd> lists everything
              </div>
            </div>
          </div>
        ) : null}

        {/* history */}
        {entries.map((entry) => (
          <div key={entry.id} className="animate-fade-up space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <PromptLabel cwd={entry.cwd} />
              <span className="break-all text-term-fg">{entry.input}</span>
            </div>
            {entry.output ? <div className="pl-0 sm:pl-1">{entry.output}</div> : null}
          </div>
        ))}

        {/* live prompt */}
        {booted ? (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <PromptLabel cwd={cwd} />
            <div className="relative flex min-w-0 flex-1 items-baseline">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  syncCaret();
                }}
                onKeyDown={onKeyDown}
                onKeyUp={syncCaret}
                onClick={syncCaret}
                onSelect={syncCaret}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                aria-label="Terminal input. Type a command such as whoami or help."
                className={`w-full border-0 bg-transparent p-0 text-sm text-term-fg focus:outline-none focus:ring-0 ${
                  caretAtEnd ? "caret-transparent" : "caret-[color:var(--t-accent)]"
                }`}
              />
              {caretAtEnd ? (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute left-0 top-0 flex items-baseline text-sm ${
                    focused ? "" : "opacity-60"
                  }`}
                  style={{ transform: "translateX(0)" }}
                >
                  <span className="invisible whitespace-pre">{input}</span>
                  <span
                    className={`inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] bg-term-accent ${
                      focused ? "animate-blink" : ""
                    }`}
                  />
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
