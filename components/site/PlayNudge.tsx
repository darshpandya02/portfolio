"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "dp-play-nudge";

/**
 * A small card that slides in a few seconds after landing on the home page,
 * pointing at /play. Dismissing it, or playing once, hides it for good.
 */
export default function PlayNudge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(KEY) === "1" || Boolean(localStorage.getItem("dp-play-v1"));
    } catch {
      seen = false;
    }
    if (seen) return;
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!show) return null;

  return (
    <div className="play-nudge fixed inset-x-4 top-20 z-[60] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:top-auto sm:w-[300px]" role="status">
      <div className="relative overflow-hidden rounded-2xl border border-ed-line p-4 shadow-2xl" style={{ background: "var(--ed-surface-solid)" }}>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-ed-muted hover:bg-ed-sunken hover:text-ed-ink"
        >
          ×
        </button>
        <p className="font-label text-[11px] uppercase tracking-wider text-[var(--c2)]">Psst, there&apos;s a game</p>
        <p className="mt-1.5 pr-5 text-sm leading-snug text-ed-ink">
          This whole portfolio is also a little pixel city you can walk around. Projects, skills, career, secrets.
        </p>
        <Link href="/play" onClick={dismiss} className="play-cta mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
          <span aria-hidden className="play-cta-ping" />
          <svg width="11" height="11" viewBox="0 0 10 10" aria-hidden>
            <path d="M2 1l7 4-7 4z" fill="currentColor" />
          </svg>
          Play
        </Link>
      </div>
    </div>
  );
}
