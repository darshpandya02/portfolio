import type { Metadata } from "next";

import Terminal from "@/components/terminal/Terminal";
import { education, experience, links, profile, projects, SITE_URL, skills } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

/**
 * The terminal is a client component, so crawlers and screen readers get this
 * plain-text mirror of the same content instead of an empty shell.
 */
function StaticFallback() {
  return (
    <div className="sr-only">
      <h1>
        {profile.name} — {profile.role} at {profile.company}
      </h1>
      <p>{profile.summary}</p>
      {profile.bio.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
      <h2>Experience</h2>
      <ul>
        {experience.map((job) => (
          <li key={job.slug}>
            {job.role}, {job.company} ({job.start} — {job.end}): {job.summary}
          </li>
        ))}
      </ul>
      <h2>Projects</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.slug}>
            {project.name}: {project.tagline}
          </li>
        ))}
      </ul>
      <h2>Skills</h2>
      <ul>
        {skills.map((group) => (
          <li key={group.key}>
            {group.name}: {group.items.join(", ")}
          </li>
        ))}
      </ul>
      <h2>Education</h2>
      <ul>
        {education.map((entry) => (
          <li key={entry.school}>
            {entry.degree}, {entry.school} ({entry.start} — {entry.end})
          </li>
        ))}
      </ul>
      <h2>Contact</h2>
      <ul>
        <li>
          <a href={links.email}>{profile.email}</a>
        </li>
        <li>
          <a href={links.github}>GitHub</a>
        </li>
        <li>
          <a href={links.linkedin}>LinkedIn</a>
        </li>
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
      <StaticFallback />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-6">
        <div className="flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-lg border border-term-border bg-term-panel shadow-2xl shadow-black/50">
          <header className="flex items-center gap-3 border-b border-term-border bg-term-raised px-3 py-2">
            <div className="flex shrink-0 gap-1.5" aria-hidden>
              <span className="h-3 w-3 rounded-full bg-term-red/80" />
              <span className="h-3 w-3 rounded-full bg-term-yellow/80" />
              <span className="h-3 w-3 rounded-full bg-term-green/80" />
            </div>
            <div className="min-w-0 flex-1 truncate text-center text-xs text-term-dim">
              {profile.handle}@{profile.host} — zsh — 120×40
            </div>
            <div className="w-10 shrink-0" aria-hidden />
          </header>
          <div className="min-h-0 flex-1">
            <Terminal />
          </div>
        </div>
      </div>
    </div>
  );
}
