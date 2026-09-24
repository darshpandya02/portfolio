import Link from "next/link";
import type { ReactNode } from "react";

/** ASCII wordmark shown by `banner`, the boot sequence and the 404. */
export const asciiName = String.raw`
  ██████╗  █████╗ ██████╗ ███████╗██╗  ██╗
  ██╔══██╗██╔══██╗██╔══██╗██╔════╝██║  ██║
  ██║  ██║███████║██████╔╝███████╗███████║
  ██║  ██║██╔══██║██╔══██╗╚════██║██╔══██║
  ██████╔╝██║  ██║██║  ██║███████║██║  ██║
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝`;

export function Ascii({ art, className = "" }: { art: string; className?: string }) {
  return (
    <pre
      aria-hidden
      className={`overflow-x-auto whitespace-pre text-[8px] leading-[1.15] text-term-accent sm:text-[10px] md:text-xs ${className}`}
    >
      {art}
    </pre>
  );
}

export function Line({
  children,
  tone = "fg",
  className = "",
}: {
  children: ReactNode;
  tone?: "fg" | "dim" | "green" | "cyan" | "yellow" | "red" | "magenta" | "blue" | "faint";
  className?: string;
}) {
  const tones: Record<string, string> = {
    fg: "text-term-fg",
    dim: "text-term-dim",
    faint: "text-term-faint",
    green: "text-term-green",
    cyan: "text-term-cyan",
    blue: "text-term-blue",
    yellow: "text-term-yellow",
    red: "text-term-red",
    magenta: "text-term-magenta",
  };
  return <div className={`${tones[tone]} ${className}`}>{children}</div>;
}

/** A `## heading` the way a markdown file would render it in a pager. */
export function DocHeading({ children, level = 2 }: { children: ReactNode; level?: 1 | 2 | 3 }) {
  const hashes = "#".repeat(level);
  const size = level === 1 ? "text-lg sm:text-xl" : level === 2 ? "text-base sm:text-lg" : "text-sm sm:text-base";
  return (
    <h2 className={`${size} font-semibold text-term-fg`}>
      <span className="mr-2 select-none text-term-faint">{hashes}</span>
      {children}
    </h2>
  );
}

export function Bullet({ children, marker = "▸" }: { children: ReactNode; marker?: string }) {
  return (
    <li className="flex gap-2 text-term-dim">
      <span aria-hidden className="select-none pt-px text-term-accent">
        {marker}
      </span>
      <span className="min-w-0 flex-1 text-pretty">{children}</span>
    </li>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="term-chip">{children}</span>;
}

export function ChipRow({ items, label }: { items: string[]; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {label ? <span className="mr-1 text-[11px] uppercase tracking-wider text-term-faint">{label}</span> : null}
      {items.map((item) => (
        <Chip key={item}>{item}</Chip>
      ))}
    </div>
  );
}

export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="term-link">
      {children}
    </a>
  );
}

export function Internal({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="term-link">
      {children}
    </Link>
  );
}

export function Rule({ label }: { label?: string }) {
  if (!label) return <div className="my-1 h-px bg-term-border" aria-hidden />;
  return (
    <div className="flex items-center gap-2 py-1" aria-hidden>
      <span className="h-px flex-1 bg-term-border" />
      <span className="text-[11px] uppercase tracking-widest text-term-faint">{label}</span>
      <span className="h-px flex-1 bg-term-border" />
    </div>
  );
}

/** `key: value` pair, aligned like `neofetch` output. */
export function Field({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-x-3 sm:flex-row">
      <span className="shrink-0 text-term-accent sm:w-32">{k}</span>
      <span className="min-w-0 flex-1 text-term-dim">{children}</span>
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <div className="pt-1 text-xs text-term-faint">{children}</div>;
}

/** A command rendered inline, e.g. inside prose or a hint. */
export function Cmd({ children }: { children: ReactNode }) {
  return <span className="rounded bg-term-raised px-1 py-px text-term-yellow">{children}</span>;
}
