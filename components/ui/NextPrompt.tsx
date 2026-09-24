import Link from "next/link";

import { profile } from "@/lib/content";

/** A live-looking prompt at the bottom of each page, linking onward. */
export default function NextPrompt({
  suggestions,
}: {
  suggestions: { label: string; href: string }[];
}) {
  return (
    <div className="rounded-lg border border-term-border bg-term-panel/60 px-4 py-3 text-sm sm:px-6">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="select-none whitespace-nowrap">
          <span className="text-term-green">
            {profile.handle}@{profile.host}
          </span>
          <span className="text-term-faint">:</span>
          <span className="text-term-blue">~</span>
          <span className="text-term-accent"> $</span>
        </span>
        <span
          aria-hidden
          className="inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] animate-blink bg-term-accent"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Link
            key={suggestion.href}
            href={suggestion.href}
            className="rounded border border-term-border bg-term-raised px-2 py-1 text-xs text-term-cyan transition-colors hover:border-term-accent/60 hover:text-term-accent"
          >
            {suggestion.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
