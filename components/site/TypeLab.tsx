"use client";

import { useEffect, useState } from "react";

import { defaultTypeStyle, MODE_STORAGE_KEY, type Mode, TYPE_STORAGE_KEY, typeStyles } from "@/lib/site-prefs";

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the choice just won't persist */
  }
}

/** Font style and light/dark switcher. State lives on <html> data attributes. */
export default function TypeLab() {
  const [mode, setMode] = useState<Mode>("dark");
  const [type, setType] = useState(defaultTypeStyle);

  useEffect(() => {
    const d = document.documentElement;
    setMode(d.dataset.mode === "light" ? "light" : "dark");
    setType(d.dataset.type ?? defaultTypeStyle);
  }, []);

  const applyMode = (next: Mode) => {
    setMode(next);
    document.documentElement.dataset.mode = next;
    save(MODE_STORAGE_KEY, next);
  };

  const applyType = (next: string) => {
    setType(next);
    document.documentElement.dataset.type = next;
    save(TYPE_STORAGE_KEY, next);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-label text-xs uppercase tracking-[0.14em] text-ed-faint">Type lab</span>
      <div role="radiogroup" aria-label="Font style" className="flex rounded-full border border-ed-line bg-ed-surface p-0.5">
        {typeStyles.map((style) => (
          <button
            key={style.key}
            type="button"
            role="radio"
            aria-checked={type === style.key}
            title={style.description}
            onClick={() => applyType(style.key)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              type === style.key ? "bg-gradient-to-r from-[var(--c1)] to-[var(--c2)] text-white" : "text-ed-muted hover:text-ed-ink"
            }`}
          >
            {style.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => applyMode(mode === "dark" ? "light" : "dark")}
        aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
        className="grid h-8 w-8 place-items-center rounded-full border border-ed-line bg-ed-surface text-ed-muted transition-colors hover:text-ed-ink"
      >
        {mode === "dark" ? (
          <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
            <circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
            <path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
