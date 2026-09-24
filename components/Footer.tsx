import { links, profile } from "@/lib/content";

import ThemeSwitcher from "./ThemeSwitcher";

const socials = [
  { label: "github", href: links.github },
  { label: "linkedin", href: links.linkedin },
  { label: "instagram", href: links.instagram },
  { label: "email", href: links.email },
];

/** Styled after a tmux / vim status line rather than a normal site footer. */
export default function Footer() {
  return (
    <footer className="border-t border-term-border bg-term-panel">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rounded bg-term-accent px-1.5 py-px font-semibold text-term-bg">NORMAL</span>
          <span className="text-term-dim">{profile.location}</span>
          <span className="text-term-faint" aria-hidden>
            │
          </span>
          <span className="text-term-faint">© {new Date().getFullYear()} Darsh Pandya</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-term-cyan transition-colors hover:text-term-accent"
            >
              {social.label}
            </a>
          ))}
          <span className="text-term-faint" aria-hidden>
            │
          </span>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}
