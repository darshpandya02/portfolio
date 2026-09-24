import type { ReactNode } from "react";

import { profile } from "@/lib/content";

/**
 * Terminal window chrome. Wraps every page so the whole site reads as one
 * session rather than a terminal landing page bolted onto a normal site.
 */
export default function Window({
  title,
  command,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  /** The command a visitor would have typed in the shell to get here. */
  command?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-term-border bg-term-panel shadow-2xl shadow-black/40 ${className}`}
    >
      <header className="flex items-center gap-3 border-b border-term-border bg-term-raised px-3 py-2">
        <div className="flex shrink-0 gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-term-red/80" />
          <span className="h-3 w-3 rounded-full bg-term-yellow/80" />
          <span className="h-3 w-3 rounded-full bg-term-green/80" />
        </div>
        <div className="min-w-0 flex-1 truncate text-center text-xs text-term-dim">
          {profile.handle}@{profile.host} — {title}
        </div>
        <div className="w-10 shrink-0" aria-hidden />
      </header>

      {command ? (
        <div className="flex flex-wrap items-baseline gap-x-2 border-b border-term-border/60 px-4 py-2.5 text-sm sm:px-6">
          <span className="select-none whitespace-nowrap">
            <span className="text-term-green">
              {profile.handle}@{profile.host}
            </span>
            <span className="text-term-faint">:</span>
            <span className="text-term-blue">~</span>
            <span className="text-term-accent"> $</span>
          </span>
          <span className="break-all text-term-fg">{command}</span>
        </div>
      ) : null}

      <div className={`px-4 py-5 sm:px-6 sm:py-6 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
