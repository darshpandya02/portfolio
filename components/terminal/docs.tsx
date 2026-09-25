import type { ReactNode } from "react";

import {
  education,
  experience,
  links,
  profile,
  projects,
  publications,
  skills,
  type Project,
} from "@/lib/content";
import type { DocKey } from "@/lib/terminal/fs";

import Avatar from "@/components/ui/Avatar";

import { Bullet, ChipRow, Cmd, DocHeading, Ext, Field, Hint, Internal, Line, Rule } from "./atoms";

function Doc({ children }: { children: ReactNode }) {
  return <div className="space-y-4 text-sm leading-relaxed">{children}</div>;
}

function Para({ children }: { children: ReactNode }) {
  return <p className="max-w-[72ch] text-pretty text-term-dim">{children}</p>;
}

/* --------------------------------- README -------------------------------- */

export function ReadmeDoc() {
  return (
    <Doc>
      <DocHeading level={1}>{profile.name}</DocHeading>
      <Para>
        {profile.role} at {profile.company}. {profile.tagline}
      </Para>
      <div className="space-y-1">
        <Field k="location">{profile.location}</Field>
        <Field k="focus">{profile.interests.join(", ")}</Field>
        <Field k="email">
          <Ext href={links.email}>{profile.email}</Ext>
        </Field>
      </div>
      <Rule />
      <Line tone="dim">Files in this directory:</Line>
      <ul className="space-y-1">
        <Bullet marker="—">
          <Cmd>cat about.md</Cmd> — who I am and what I work on
        </Bullet>
        <Bullet marker="—">
          <Cmd>cat experience.md</Cmd> — where I&apos;ve worked
        </Bullet>
        <Bullet marker="—">
          <Cmd>cat projects.md</Cmd> — things I&apos;ve built
        </Bullet>
        <Bullet marker="—">
          <Cmd>cat skills.md</Cmd> — the toolkit
        </Bullet>
        <Bullet marker="—">
          <Cmd>cat publications.md</Cmd> — papers
        </Bullet>
        <Bullet marker="—">
          <Cmd>cat contact.md</Cmd> — how to reach me
        </Bullet>
      </ul>
      <Hint>
        Not a terminal person? Every command has a page — try <Cmd>open projects</Cmd>, or use the links up top.
      </Hint>
    </Doc>
  );
}

/* --------------------------------- ABOUT --------------------------------- */

export function AboutDoc() {
  return (
    <Doc>
      <DocHeading level={1}>whoami</DocHeading>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar size={152} priority />
        <div className="min-w-0 space-y-1.5 pt-1">
          <div className="text-lg font-semibold text-term-fg sm:text-xl">{profile.fullName}</div>
          <Line tone="green">{profile.tagline}</Line>
          <div className="space-y-0.5 pt-1.5">
            <Field k="currently">
              {profile.role}, <Ext href={links.sphere}>{profile.company}</Ext>
            </Field>
            <Field k="based in">{profile.location}</Field>
            <Field k="reach me">
              <Ext href={links.email}>{profile.email}</Ext>
            </Field>
          </div>
        </div>
      </div>
      <Rule />
      {profile.bio.map((paragraph, i) => (
        <Para key={i}>{paragraph}</Para>
      ))}
      <Rule />
      <div className="space-y-1">
        <Field k="focus">{profile.interests.join(" · ")}</Field>
        <Field k="status">{profile.availability}</Field>
      </div>
    </Doc>
  );
}

/* ------------------------------- EXPERIENCE ------------------------------ */

export function ExperienceDoc() {
  return (
    <Doc>
      <DocHeading level={1}>experience</DocHeading>
      <div className="space-y-6">
        {experience.map((job) => (
          <article key={job.slug} className="border-l border-term-border pl-4">
            <header className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="font-semibold text-term-fg">{job.role}</h3>
                {job.current ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-term-green">
                    <span className="h-1.5 w-1.5 rounded-full bg-term-green" aria-hidden />
                    current
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-term-faint">
                <span className="text-term-cyan">
                  {job.url ? <Ext href={job.url}>{job.company}</Ext> : job.company}
                </span>
                <span aria-hidden>·</span>
                <span>{job.location}</span>
                <span aria-hidden>·</span>
                <span>
                  {job.start} — {job.end}
                </span>
              </div>
            </header>
            <p className="mt-2 max-w-[72ch] text-pretty text-term-dim">{job.summary}</p>
            <ul className="mt-2 max-w-[84ch] space-y-1.5">
              {job.highlights.map((h) => (
                <Bullet key={h}>{h}</Bullet>
              ))}
            </ul>
            <div className="mt-3">
              <ChipRow items={job.stack} />
            </div>
          </article>
        ))}
      </div>
      <Hint>
        Full history in <Cmd>cat resume.pdf</Cmd> · education in <Cmd>cat education.md</Cmd>
      </Hint>
    </Doc>
  );
}

/* -------------------------------- PROJECTS ------------------------------- */

function statusLabel(status: Project["status"]) {
  if (status === "wip") return <span className="text-term-yellow">[wip]</span>;
  if (status === "archived") return <span className="text-term-faint">[archived]</span>;
  return <span className="text-term-green">[shipped]</span>;
}

export function ProjectsDoc({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const list = featuredOnly ? projects.filter((p) => p.featured) : projects;
  return (
    <Doc>
      <DocHeading level={1}>projects</DocHeading>
      <Para>
        {list.length} {featuredOnly ? "featured " : ""}
        {list.length === 1 ? "entry" : "entries"}. Open any one with{" "}
        <Cmd>cat projects/&lt;name&gt;.md</Cmd>.
      </Para>
      <div className="space-y-3">
        {list.map((project) => (
          <article
            key={project.slug}
            className="group rounded border border-term-border bg-term-panel/60 p-3 transition-colors hover:border-term-accent/50"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-semibold text-term-fg">
                <Internal href={`/projects/${project.slug}`}>{project.name}</Internal>
              </h3>
              <div className="flex items-center gap-2 text-xs">
                {statusLabel(project.status)}
                <span className="text-term-faint">{project.year}</span>
              </div>
            </div>
            <p className="mt-1 max-w-[72ch] text-pretty text-term-dim">{project.tagline}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ChipRow items={project.stack.slice(0, 6)} />
              {project.github ? (
                <Ext href={project.github}>
                  <span className="text-xs">source ↗</span>
                </Ext>
              ) : null}
              {project.demo ? (
                <Ext href={project.demo}>
                  <span className="text-xs">live ↗</span>
                </Ext>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </Doc>
  );
}

export function ProjectDoc({ project }: { project: Project }) {
  return (
    <Doc>
      <DocHeading level={1}>{project.name}</DocHeading>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {statusLabel(project.status)}
        <span className="text-term-faint">{project.year}</span>
        {project.github ? <Ext href={project.github}>github ↗</Ext> : null}
        {project.demo ? <Ext href={project.demo}>live ↗</Ext> : null}
      </div>
      <Para>{project.tagline}</Para>
      {project.description.map((paragraph, i) => (
        <Para key={i}>{paragraph}</Para>
      ))}
      <Rule label="highlights" />
      <ul className="max-w-[84ch] space-y-1.5">
        {project.highlights.map((h) => (
          <Bullet key={h}>{h}</Bullet>
        ))}
      </ul>
      <Rule label="stack" />
      <ChipRow items={project.stack} />
    </Doc>
  );
}

/* --------------------------------- SKILLS -------------------------------- */

export function SkillsDoc() {
  return (
    <Doc>
      <DocHeading level={1}>skills</DocHeading>
      <Para>
        Grouped roughly by how often I reach for them. The top two groups are where I actually
        live day to day; the rest I&apos;m comfortable in when a project calls for it.
      </Para>
      <div className="grid gap-4 sm:grid-cols-2">
        {skills.map((group) => (
          <section key={group.key} className="rounded border border-term-border bg-term-panel/60 p-3">
            <h3 className="mb-2 text-xs uppercase tracking-widest text-term-accent">{group.name}</h3>
            <ChipRow items={group.items} />
          </section>
        ))}
      </div>
    </Doc>
  );
}

/* ----------------------------- PUBLICATIONS ------------------------------ */

export function PublicationsDoc() {
  return (
    <Doc>
      <DocHeading level={1}>publications</DocHeading>
      <div className="space-y-4">
        {publications.map((pub) => (
          <article key={pub.title} className="flex gap-4 border-l border-term-border pl-4">
            <span className="shrink-0 pt-px font-semibold text-term-accent">{pub.year}</span>
            <div className="min-w-0">
              <h3 className="text-pretty font-semibold text-term-fg">{pub.title}</h3>
              <p className="text-xs text-term-faint">{pub.venue}</p>
              {pub.note ? <p className="mt-1 text-pretty text-term-dim">{pub.note}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </Doc>
  );
}

/* -------------------------------- EDUCATION ------------------------------ */

export function EducationDoc() {
  return (
    <Doc>
      <DocHeading level={1}>education</DocHeading>
      <div className="space-y-5">
        {education.map((entry) => (
          <article key={entry.school} className="border-l border-term-border pl-4">
            <h3 className="font-semibold text-term-fg">{entry.school}</h3>
            <p className="text-term-cyan">{entry.degree}</p>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-term-faint">
              <span>{entry.location}</span>
              <span aria-hidden>·</span>
              <span>
                {entry.start} — {entry.end}
              </span>
              <span aria-hidden>·</span>
              <span className="text-term-green">GPA {entry.gpa}</span>
            </div>
            <div className="mt-2">
              <ChipRow items={entry.coursework} label="coursework" />
            </div>
          </article>
        ))}
      </div>
    </Doc>
  );
}

/* --------------------------------- CONTACT ------------------------------- */

export function ContactDoc({ showFormHint = true }: { showFormHint?: boolean } = {}) {
  return (
    <Doc>
      <DocHeading level={1}>contact</DocHeading>
      <Para>{profile.availability}</Para>
      <div className="space-y-1">
        <Field k="email">
          <Ext href={links.email}>{profile.email}</Ext>
        </Field>
        <Field k="github">
          <Ext href={links.github}>github.com/darshpandya02</Ext>
        </Field>
        <Field k="linkedin">
          <Ext href={links.linkedin}>linkedin.com/in/darshpandya02</Ext>
        </Field>
        <Field k="instagram">
          <Ext href={links.instagram}>@darshpandya_</Ext>
        </Field>
        <Field k="location">{profile.location}</Field>
      </div>
      {showFormHint ? (
        <Hint>
          Prefer a form? <Internal href="/contact">open contact</Internal> sends straight to my inbox.
        </Hint>
      ) : null}
    </Doc>
  );
}

/* --------------------------------- RESUME -------------------------------- */

export function ResumeDoc() {
  return (
    <Doc>
      <DocHeading level={1}>resume.pdf</DocHeading>
      <Para>
        This is a binary file. Your pager will not enjoy it — but your browser will.
      </Para>
      <div className="flex flex-wrap gap-2">
        <a
          href={links.resume}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded border border-term-accent/60 bg-term-accent/10 px-3 py-1.5 text-term-accent transition-colors hover:bg-term-accent/20"
        >
          open resume.pdf ↗
        </a>
        <a
          href={links.resume}
          download
          className="rounded border border-term-border bg-term-raised px-3 py-1.5 text-term-dim transition-colors hover:text-term-fg"
        >
          download
        </a>
      </div>
      <Hint>
        Or read it in the shell: <Cmd>cat experience.md</Cmd> and <Cmd>cat education.md</Cmd> cover the same ground.
      </Hint>
    </Doc>
  );
}

/* ------------------------------ DOTFILES --------------------------------- */

export function ZshrcDoc() {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-term-dim">
      {`# ~/.zshrc

export EDITOR="nvim"
export PAGER="less -R"

alias k="kubectl"
alias dc="docker compose"
alias gs="git status -sb"
alias serve="python3 -m http.server"

# the one that has saved me the most time
alias please="sudo !!"

# never lose a shell again
setopt inc_append_history share_history
HISTSIZE=50000`}
    </pre>
  );
}

export function SecretsDoc() {
  return (
    <Doc>
      <Line tone="red">cat: .secrets: Permission denied</Line>
      <Line tone="faint">Nice try. Run `sudo cat .secrets` if you&apos;re feeling brave.</Line>
    </Doc>
  );
}

/* ------------------------------- REGISTRY -------------------------------- */

export function renderDoc(doc: DocKey): ReactNode {
  if (doc.startsWith("project:")) {
    const slug = doc.slice("project:".length);
    const project = projects.find((p) => p.slug === slug);
    return project ? <ProjectDoc project={project} /> : <Line tone="red">cat: no such project: {slug}</Line>;
  }

  switch (doc) {
    case "readme":
      return <ReadmeDoc />;
    case "about":
      return <AboutDoc />;
    case "experience":
      return <ExperienceDoc />;
    case "projects":
      return <ProjectsDoc />;
    case "skills":
      return <SkillsDoc />;
    case "publications":
      return <PublicationsDoc />;
    case "education":
      return <EducationDoc />;
    case "contact":
      return <ContactDoc />;
    case "resume":
      return <ResumeDoc />;
    case "zshrc":
      return <ZshrcDoc />;
    case "secrets":
      return <SecretsDoc />;
    default:
      return <Line tone="red">cat: cannot render file</Line>;
  }
}
