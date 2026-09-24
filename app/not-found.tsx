import Link from "next/link";

import { Ascii } from "@/components/terminal/atoms";

const art = String.raw`
  _  _    ___  _  _
 | || |  / _ \| || |
 | || |_| | | | || |_
 |__   _| |_| |__   _|
    |_|  \___/   |_|`;

export default function NotFound() {
  return (
    <div className="relative flex flex-1 items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
      <div className="relative w-full max-w-xl overflow-hidden rounded-lg border border-term-border bg-term-panel shadow-2xl shadow-black/40">
        <header className="flex items-center gap-3 border-b border-term-border bg-term-raised px-3 py-2">
          <div className="flex shrink-0 gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-term-red/80" />
            <span className="h-3 w-3 rounded-full bg-term-yellow/80" />
            <span className="h-3 w-3 rounded-full bg-term-green/80" />
          </div>
          <div className="min-w-0 flex-1 truncate text-center text-xs text-term-dim">darsh@portfolio — error</div>
          <div className="w-10 shrink-0" aria-hidden />
        </header>
        <div className="space-y-4 p-5 text-sm sm:p-6">
          <Ascii art={art} className="text-term-red" />
          <div className="space-y-1">
            <p className="text-term-red">cat: no such file or directory</p>
            <p className="text-term-dim">
              That path doesn&apos;t exist in this filesystem. It may have been moved, or it may never
              have been here at all.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded border border-term-accent/60 bg-term-accent/10 px-3 py-1.5 text-term-accent transition-colors hover:bg-term-accent/20"
            >
              cd ~
            </Link>
            <Link
              href="/projects"
              className="rounded border border-term-border bg-term-raised px-3 py-1.5 text-term-dim transition-colors hover:text-term-fg"
            >
              ls projects/
            </Link>
            <Link
              href="/contact"
              className="rounded border border-term-border bg-term-raised px-3 py-1.5 text-term-dim transition-colors hover:text-term-fg"
            >
              cat contact.md
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
