"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/terminal", label: "~" },
  { href: "/about", label: "about" },
  { href: "/experience", label: "experience" },
  { href: "/projects", label: "projects" },
  { href: "/skills", label: "skills" },
  { href: "/publications", label: "publications" },
  { href: "/education", label: "education" },
  { href: "/contact", label: "contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 border-b border-term-border bg-term-bg/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 sm:px-6">
        {/* Way back to the main site; the terminal pages are a side door. */}
        <Link
          href="/"
          title="Back to the main site"
          className="flex shrink-0 items-center gap-1.5 rounded border border-term-accent/50 bg-term-accent/10 px-2.5 py-1 text-xs font-semibold text-term-accent transition-colors hover:bg-term-accent/20"
        >
          <span aria-hidden>←</span>
          <span>main site</span>
        </Link>
        <Link
          href="/terminal"
          className="shrink-0 py-2.5 text-sm font-semibold text-term-accent transition-opacity hover:opacity-80"
        >
          darsh<span className="text-term-faint">@</span>portfolio
        </Link>

        <ul className="flex flex-1 items-center gap-0.5 overflow-x-auto py-1.5 scrollbar-none">
          {tabs.map((tab) => {
            const active = tab.href === "/terminal" ? pathname === "/terminal" : pathname.startsWith(tab.href);
            return (
              <li key={tab.href} className="shrink-0">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  // Only one element carries this name at a time, which is what lets the
                  // browser treat the highlight as one pill moving rather than two fading.
                  style={active ? { viewTransitionName: "nav-active" } : undefined}
                  className={`block rounded px-2.5 py-1 text-xs transition-colors duration-spring ease-spring ${
                    active
                      ? "bg-term-raised text-term-accent"
                      : "text-term-dim hover:bg-term-raised/60 hover:text-term-fg"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/resume"
          className="shrink-0 rounded border border-term-border px-2.5 py-1 text-xs text-term-dim transition-colors hover:border-term-accent/60 hover:text-term-accent"
        >
          resume
        </Link>
      </div>
    </nav>
  );
}
