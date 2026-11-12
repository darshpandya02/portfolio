"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { links, profile } from "@/lib/content";

const nav = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#research", label: "Research" },
  { href: "#contact", label: "Contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled || open ? "fx-glass border-ed-line" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <a href="#home" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--c1)] via-[var(--c2)] to-[var(--c3)] text-xs font-bold text-white shadow-[0_0_24px_-4px_var(--c1)]">
            DP
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">{profile.name}</span>
            <span className="font-label block text-[11px] text-ed-muted">{profile.role}</span>
          </span>
        </a>

        <nav aria-label="Sections" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group/nav relative rounded-full px-3 py-1.5 text-sm text-ed-muted transition-colors hover:text-ed-ink"
                >
                  {item.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-0.5 h-px origin-center scale-x-0 bg-gradient-to-r from-[var(--c1)] to-[var(--c2)] transition-transform duration-300 group-hover/nav:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <Link
            href="/terminal"
            className="font-label fx-btn-ghost hidden rounded-full px-3 py-1.5 text-xs text-ed-muted hover:text-ed-ink sm:inline-block"
            title="The terminal version of this site"
          >
            &gt;_ terminal
          </Link>
          <a
            href={links.resume}
            target="_blank"
            rel="noreferrer"
            data-magnetic
            className="fx-btn-primary rounded-full px-4 py-1.5 text-sm font-semibold"
          >
            Resume
          </a>
          <button
            type="button"
            className="fx-btn-ghost grid h-9 w-9 place-items-center rounded-full md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              {open ? (
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2 4.5h12M2 8h12M2 11.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Sections" className="border-t border-ed-line px-4 pb-4 md:hidden">
          <ul className="grid gap-1 pt-2">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base hover:bg-ed-sunken"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/terminal" className="font-label block rounded-lg px-3 py-2.5 text-sm text-ed-muted hover:bg-ed-sunken">
                &gt;_ Terminal version
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
