import type { ReactNode } from "react";

import { education, experience, links, profile, projects, publications, skills } from "@/lib/content";
import { Ascii, asciiName, Bullet, Cmd, Ext, Field, Hint, Line, Rule } from "@/components/terminal/atoms";
import { ProjectsDoc, renderDoc } from "@/components/terminal/docs";
import { allFiles, getNode, HOME, listDir, prettyPath, resolvePath, type FsNode } from "./fs";
import { defaultTheme, themes } from "./themes";

export interface CommandContext {
  cwd: string;
  setCwd: (path: string) => void;
  clear: () => void;
  navigate: (href: string) => void;
  setTheme: (key: string) => void;
  theme: string;
  history: string[];
  run: (input: string) => void;
  bootedAt: number;
}

export interface Command {
  name: string;
  aliases?: string[];
  usage: string;
  summary: string;
  group: "navigate" | "read" | "system" | "fun";
  hidden?: boolean;
  run: (args: string[], ctx: CommandContext) => ReactNode | void;
}

const err = (text: string) => <Line tone="red">{text}</Line>;

/** Routes reachable via `open`. */
export const routes: Record<string, string> = {
  home: "/",
  "~": "/",
  about: "/about",
  whoami: "/about",
  experience: "/experience",
  work: "/experience",
  projects: "/projects",
  skills: "/skills",
  stack: "/skills",
  publications: "/publications",
  papers: "/publications",
  education: "/education",
  contact: "/contact",
  resume: "/resume",
  cv: "/resume",
  github: links.github,
  linkedin: links.linkedin,
  instagram: links.instagram,
};

/* ------------------------------ search index ----------------------------- */

interface IndexEntry {
  path: string;
  route: string;
  text: string;
}

const searchIndex: IndexEntry[] = [
  { path: "about.md", route: "/about", text: [profile.summary, ...profile.bio, ...profile.interests].join(" ") },
  {
    path: "experience.md",
    route: "/experience",
    text: experience.map((e) => [e.role, e.company, e.location, e.summary, ...e.highlights, ...e.stack].join(" ")).join(" "),
  },
  ...projects.map((p) => ({
    path: `projects/${p.slug}.md`,
    route: `/projects/${p.slug}`,
    text: [p.name, p.tagline, ...p.description, ...p.highlights, ...p.stack].join(" "),
  })),
  { path: "skills.md", route: "/skills", text: skills.map((g) => `${g.name} ${g.items.join(" ")}`).join(" ") },
  { path: "publications.md", route: "/publications", text: publications.map((p) => `${p.title} ${p.venue} ${p.year}`).join(" ") },
  {
    path: "education.md",
    route: "/education",
    text: education.map((e) => [e.school, e.degree, e.location, e.gpa, ...e.coursework].join(" ")).join(" "),
  },
  { path: "contact.md", route: "/contact", text: `${profile.email} ${profile.location} github linkedin instagram email contact` },
];

/* --------------------------------- helpers -------------------------------- */

function fileColor(node: FsNode) {
  if (node.type === "dir") return "text-term-blue";
  if (node.name.endsWith(".pdf")) return "text-term-red";
  if (node.hidden) return "text-term-faint";
  return "text-term-fg";
}

function renderTree(node: FsNode, prefix = ""): ReactNode[] {
  const children = (node.children ?? []).filter((c) => !c.hidden);
  return children.flatMap((child, i) => {
    const last = i === children.length - 1;
    const branch = last ? "└── " : "├── ";
    const rows: ReactNode[] = [
      <div key={`${prefix}${child.name}`} className="whitespace-pre">
        <span className="text-term-faint">{prefix + branch}</span>
        <span className={fileColor(child)}>
          {child.name}
          {child.type === "dir" ? "/" : ""}
        </span>
      </div>,
    ];
    if (child.type === "dir") {
      rows.push(...renderTree(child, prefix + (last ? "    " : "│   ")));
    }
    return rows;
  });
}

function uptimeString(bootedAt: number) {
  const seconds = Math.max(1, Math.floor((Date.now() - bootedAt) / 1000));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/* -------------------------------- commands -------------------------------- */

export const commands: Command[] = [
  {
    name: "help",
    aliases: ["?", "commands"],
    usage: "help [command]",
    summary: "list every command, or explain one",
    group: "system",
    run: (args) => {
      if (args[0]) return manPage(args[0]);
      const groups: { key: Command["group"]; label: string }[] = [
        { key: "read", label: "read" },
        { key: "navigate", label: "navigate" },
        { key: "system", label: "system" },
      ];
      return (
        <div className="space-y-3 text-sm">
          <Line tone="dim">
            Type a command and hit <span className="term-kbd">Enter</span>. <span className="term-kbd">Tab</span> completes,{" "}
            <span className="term-kbd">↑</span>
            <span className="term-kbd">↓</span> walks history, <span className="term-kbd">Ctrl</span>+
            <span className="term-kbd">L</span> clears.
          </Line>
          {groups.map((group) => (
            <div key={group.key}>
              <div className="mb-1 text-[11px] uppercase tracking-widest text-term-faint">{group.label}</div>
              <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {commands
                  .filter((c) => c.group === group.key && !c.hidden)
                  .map((c) => (
                    <div key={c.name} className="flex gap-3">
                      <span className="w-28 shrink-0 text-term-accent">{c.name}</span>
                      <span className="min-w-0 flex-1 text-term-dim">{c.summary}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          <Hint>There are a few commands not on this list. Poke around — it&apos;s a real shell, mostly.</Hint>
        </div>
      );
    },
  },
  {
    name: "whoami",
    usage: "whoami",
    summary: "the short version",
    group: "read",
    run: () => (
      <div className="space-y-3 text-sm">
        <Line tone="green">{profile.handle}</Line>
        <div className="space-y-1">
          <Field k="name">{profile.fullName}</Field>
          <Field k="role">
            {profile.role} @ <Ext href={links.sphere}>{profile.company}</Ext>
          </Field>
          <Field k="location">{profile.location}</Field>
          <Field k="education">M.S. Computer Science, Northeastern University</Field>
          <Field k="focus">{profile.interests.join(", ")}</Field>
        </div>
        <p className="max-w-[72ch] text-pretty text-term-dim">{profile.summary}</p>
        <Hint>
          Longer version: <Cmd>cat about.md</Cmd>
        </Hint>
      </div>
    ),
  },
  {
    name: "ls",
    aliases: ["ll", "dir"],
    usage: "ls [-a|-l] [path]",
    summary: "list files in the current directory",
    group: "navigate",
    run: (args, ctx) => {
      const flags = args.filter((a) => a.startsWith("-"));
      const showHidden = flags.some((f) => f.includes("a"));
      const long = flags.some((f) => f.includes("l"));
      const target = args.find((a) => !a.startsWith("-")) ?? ".";
      const path = resolvePath(ctx.cwd, target);
      const node = getNode(path);

      if (!node) return err(`ls: ${target}: No such file or directory`);
      if (node.type === "file") return <span className={fileColor(node)}>{node.name}</span>;

      const entries = listDir(path, showHidden) ?? [];
      if (long) {
        return (
          <div className="space-y-0.5 text-sm">
            <Line tone="faint">total {entries.length}</Line>
            {entries.map((entry) => (
              <div key={entry.name} className="flex gap-3">
                <span className="text-term-faint">
                  {entry.type === "dir" ? "drwxr-xr-x" : entry.hidden ? "-rw-------" : "-rw-r--r--"}
                </span>
                <span className="w-16 shrink-0 text-right text-term-faint">{entry.size}</span>
                <span className="w-12 shrink-0 text-term-faint">{entry.modified}</span>
                <span className={fileColor(entry)}>
                  {entry.name}
                  {entry.type === "dir" ? "/" : ""}
                </span>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {entries.map((entry) => (
            <span key={entry.name} className={fileColor(entry)}>
              {entry.name}
              {entry.type === "dir" ? "/" : ""}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    name: "cd",
    usage: "cd [path]",
    summary: "change directory",
    group: "navigate",
    run: (args, ctx) => {
      const path = resolvePath(ctx.cwd, args[0] ?? "~");
      const node = getNode(path);
      if (!node) return err(`cd: ${args[0]}: No such file or directory`);
      if (node.type !== "dir") return err(`cd: ${args[0]}: Not a directory`);
      ctx.setCwd(path);
    },
  },
  {
    name: "pwd",
    usage: "pwd",
    summary: "print the working directory",
    group: "navigate",
    run: (_args, ctx) => <Line>{ctx.cwd}</Line>,
  },
  {
    name: "cat",
    aliases: ["less", "more", "bat", "read"],
    usage: "cat <file>",
    summary: "read a file — about.md, projects.md, experience.md …",
    group: "read",
    run: (args, ctx) => {
      if (args.length === 0) return err("cat: missing file operand. Try `ls` to see what's here.");
      return (
        <div className="space-y-6">
          {args.map((arg) => {
            const path = resolvePath(ctx.cwd, arg);
            const node = getNode(path);
            if (!node) return <div key={arg}>{err(`cat: ${arg}: No such file or directory`)}</div>;
            if (node.type === "dir") return <div key={arg}>{err(`cat: ${arg}: Is a directory`)}</div>;
            if (!node.doc) return <div key={arg}>{err(`cat: ${arg}: cannot read file`)}</div>;
            return <div key={arg}>{renderDoc(node.doc)}</div>;
          })}
        </div>
      );
    },
  },
  {
    name: "tree",
    usage: "tree",
    summary: "show the whole directory structure",
    group: "navigate",
    run: () => {
      const home = getNode(HOME);
      if (!home) return err("tree: cannot read home");
      const dirCount = allFiles().filter((f) => f.node.type === "dir").length;
      const fileCount = allFiles().filter((f) => f.node.type === "file" && !f.node.hidden).length;
      return (
        <div className="space-y-0.5 text-sm">
          <Line tone="blue">~</Line>
          {renderTree(home)}
          <Line tone="faint" className="pt-1">
            {dirCount} {dirCount === 1 ? "directory" : "directories"}, {fileCount} files
          </Line>
        </div>
      );
    },
  },
  {
    name: "open",
    aliases: ["goto", "xdg-open"],
    usage: "open <page>",
    summary: "jump to a full page — about, projects, contact …",
    group: "navigate",
    run: (args, ctx) => {
      const key = (args[0] ?? "").toLowerCase().replace(/^\/+/, "").replace(/\.md$/, "");
      if (!key) {
        return (
          <div className="space-y-2 text-sm">
            <Line tone="dim">Available pages:</Line>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Object.keys(routes)
                .filter((k) => routes[k].startsWith("/"))
                .map((k) => (
                  <span key={k} className="text-term-cyan">
                    {k}
                  </span>
                ))}
            </div>
          </div>
        );
      }
      const target = routes[key];
      if (!target) return err(`open: no page named '${key}'. Run \`open\` with no arguments to list them.`);
      if (target.startsWith("http")) {
        if (typeof window !== "undefined") window.open(target, "_blank", "noopener,noreferrer");
        return <Line tone="dim">Opening {target} in a new tab…</Line>;
      }
      ctx.navigate(target);
      return <Line tone="dim">Navigating to {target}…</Line>;
    },
  },
  {
    name: "ssh",
    usage: "ssh darsh@portfolio",
    summary: "connect to the host",
    group: "navigate",
    run: (args) => {
      const target = args[0] ?? "";
      const valid = ["darsh@portfolio", "darsh@localhost", "portfolio", "darsh@darshpandya.com"];
      if (target && !valid.includes(target)) {
        return (
          <div className="space-y-1 text-sm">
            {err(`ssh: Could not resolve hostname ${target}: Name or service not known`)}
            <Line tone="faint">Try `ssh darsh@portfolio`.</Line>
          </div>
        );
      }
      return (
        <div className="space-y-3 text-sm">
          <div className="space-y-0.5 text-term-dim">
            <div>The authenticity of host &apos;portfolio (127.0.0.1)&apos; can&apos;t be established.</div>
            <div>ED25519 key fingerprint is SHA256:dArSh/P4ndy4+b0st0n+m4/s0ftw4re3ng.</div>
            <div>Warning: Permanently added &apos;portfolio&apos; to the list of known hosts.</div>
            <div className="text-term-green">Connection established.</div>
          </div>
          <Rule />
          <Ascii art={asciiName} />
          <div className="space-y-1">
            <Line tone="dim">
              Welcome to <span className="text-term-fg">portfolio</span> (GNU/Linux 6.8.0 x86_64)
            </Line>
            <Line tone="faint">Last login: today, from a browser near you</Line>
          </div>
          <div className="space-y-1">
            <Field k="operator">{profile.fullName}</Field>
            <Field k="role">
              {profile.role} @ {profile.company}
            </Field>
            <Field k="location">{profile.location}</Field>
            <Field k="uptime">{new Date().getFullYear() - 2019} years of shipping</Field>
          </div>
          <Hint>
            You&apos;re in. <Cmd>ls</Cmd> to look around, <Cmd>help</Cmd> for the full command list.
          </Hint>
        </div>
      );
    },
  },
  {
    name: "projects",
    usage: "projects [--all]",
    summary: "featured work, with links to source",
    group: "read",
    run: (args) => <ProjectsDoc featuredOnly={!(args.includes("--all") || args.includes("-a"))} />,
  },
  {
    name: "experience",
    aliases: ["work", "jobs"],
    usage: "experience",
    summary: "where I've worked and what I did there",
    group: "read",
    run: () => renderDoc("experience"),
  },
  {
    name: "skills",
    aliases: ["stack"],
    usage: "skills",
    summary: "languages, frameworks and infrastructure",
    group: "read",
    run: () => renderDoc("skills"),
  },
  {
    name: "publications",
    aliases: ["papers"],
    usage: "publications",
    summary: "published research",
    group: "read",
    run: () => renderDoc("publications"),
  },
  {
    name: "education",
    aliases: ["edu"],
    usage: "education",
    summary: "degrees and coursework",
    group: "read",
    run: () => renderDoc("education"),
  },
  {
    name: "about",
    aliases: ["bio"],
    usage: "about",
    summary: "the long-form version of whoami",
    group: "read",
    run: () => renderDoc("about"),
  },
  {
    name: "contact",
    aliases: ["mail", "email"],
    usage: "contact",
    summary: "how to reach me",
    group: "read",
    run: () => renderDoc("contact"),
  },
  {
    name: "resume",
    aliases: ["cv"],
    usage: "resume",
    summary: "open the PDF",
    group: "read",
    run: () => renderDoc("resume"),
  },
  {
    name: "social",
    aliases: ["links"],
    usage: "social",
    summary: "every profile worth linking",
    group: "read",
    run: () => (
      <div className="space-y-1 text-sm">
        <Field k="github">
          <Ext href={links.github}>github.com/darshpandya02</Ext>
        </Field>
        <Field k="linkedin">
          <Ext href={links.linkedin}>linkedin.com/in/darshpandya02</Ext>
        </Field>
        <Field k="instagram">
          <Ext href={links.instagram}>@darshpandya_</Ext>
        </Field>
        <Field k="email">
          <Ext href={links.email}>{profile.email}</Ext>
        </Field>
        <Field k="resume">
          <Ext href={links.resume}>resume.pdf</Ext>
        </Field>
      </div>
    ),
  },
  {
    name: "grep",
    usage: "grep <pattern>",
    summary: "search everything on this site",
    group: "system",
    run: (args) => {
      const pattern = args.filter((a) => !a.startsWith("-")).join(" ").trim();
      if (!pattern) return err("grep: missing pattern. Usage: grep <pattern>");
      const needle = pattern.toLowerCase();
      const hits = searchIndex
        .map((entry) => {
          const idx = entry.text.toLowerCase().indexOf(needle);
          if (idx === -1) return null;
          const start = Math.max(0, idx - 48);
          const snippet = entry.text.slice(start, idx + needle.length + 72);
          return { entry, snippet, idx: idx - start, start };
        })
        .filter(Boolean) as { entry: IndexEntry; snippet: string; idx: number }[];

      if (hits.length === 0) return <Line tone="faint">grep: no matches for &apos;{pattern}&apos;</Line>;

      return (
        <div className="space-y-2 text-sm">
          {hits.map(({ entry, snippet, idx }) => (
            <div key={entry.path}>
              <span className="text-term-magenta">{entry.path}</span>
              <span className="text-term-faint">:</span>{" "}
              <span className="text-term-dim">
                …{snippet.slice(0, idx)}
                <mark className="bg-term-accent/25 text-term-fg">{snippet.slice(idx, idx + pattern.length)}</mark>
                {snippet.slice(idx + pattern.length)}…
              </span>
            </div>
          ))}
          <Line tone="faint">
            {hits.length} {hits.length === 1 ? "file" : "files"} matched
          </Line>
        </div>
      );
    },
  },
  {
    name: "find",
    usage: "find <name>",
    summary: "locate files by name",
    group: "system",
    run: (args) => {
      const term = (args.find((a) => !a.startsWith("-")) ?? "").toLowerCase();
      const matches = allFiles().filter((f) => !term || f.node.name.toLowerCase().includes(term));
      if (matches.length === 0) return <Line tone="faint">find: no matches</Line>;
      return (
        <div className="space-y-0.5 text-sm">
          {matches.map((m) => (
            <div key={m.path} className={fileColor(m.node)}>
              {prettyPath(m.path)}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: "git",
    usage: "git log",
    summary: "commit history of a career",
    group: "system",
    run: (args) => {
      const sub = args[0] ?? "log";
      if (sub === "status") {
        return (
          <div className="space-y-0.5 text-sm">
            <Line>On branch main</Line>
            <Line tone="dim">Your branch is up to date with &apos;origin/main&apos;.</Line>
            <Line tone="faint">nothing to commit, working tree clean</Line>
          </div>
        );
      }
      if (sub === "remote") {
        return (
          <div className="space-y-0.5 text-sm">
            <Line tone="dim">origin&nbsp;&nbsp;{links.github} (fetch)</Line>
            <Line tone="dim">origin&nbsp;&nbsp;{links.github} (push)</Line>
          </div>
        );
      }
      if (sub !== "log") return err(`git: '${sub}' is not a git command. Try \`git log\`.`);

      const log = [
        { hash: "a71f3c9", when: "2026", msg: "feat(sphere): ship reproducible experiment orchestration", tag: "HEAD -> main" },
        { hash: "4d8e02b", when: "2026", msg: "docs: co-author ACSAC 2026 paper on SPHERE" },
        { hash: "9b3c7f1", when: "2025", msg: "perf(netsi): pool connections, -25% API latency" },
        { hash: "2f6a415", when: "2025", msg: "refactor(netsi): tag-based fragments, -30% duplicates" },
        { hash: "c0d94ae", when: "2025", msg: "chore: graduate — M.S. Computer Science, Northeastern" },
        { hash: "7e1b830", when: "2024", msg: "feat(gupshup): kafka for external, rabbitmq for internal" },
        { hash: "51a2df6", when: "2024", msg: "perf(gupshup): redis cache, -35% database load" },
        { hash: "b8c4e27", when: "2024", msg: "feat(neu): teach full-stack web development for a year" },
        { hash: "3a9f6d0", when: "2023", msg: "feat: relocate Mumbai -> Boston" },
        { hash: "e42c1b8", when: "2022", msg: "feat(chance): match-making on heaps and hash maps, +20%" },
        { hash: "1d70f93", when: "2019", msg: "init: B.Tech, Information Technology" },
      ];
      return (
        <div className="space-y-2 text-sm">
          {log.map((commit) => (
            <div key={commit.hash}>
              <div>
                <span className="text-term-yellow">commit {commit.hash}</span>
                {commit.tag ? <span className="text-term-cyan"> ({commit.tag})</span> : null}
              </div>
              <div className="text-term-faint">Date: {commit.when}</div>
              <div className="pl-4 text-term-dim">{commit.msg}</div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: "neofetch",
    aliases: ["fetch", "screenfetch"],
    usage: "neofetch",
    summary: "system information, in the traditional style",
    group: "system",
    run: (_args, ctx) => (
      <div className="flex flex-col gap-4 text-sm sm:flex-row sm:items-start">
        <Ascii art={asciiName} className="shrink-0" />
        <div className="min-w-0 space-y-0.5">
          <Line tone="green">
            {profile.handle}@{profile.host}
          </Line>
          <Line tone="faint">──────────────────────</Line>
          <Field k="OS">Boston, MA (x86_64)</Field>
          <Field k="Host">{profile.company}</Field>
          <Field k="Kernel">{profile.role}</Field>
          <Field k="Uptime">{uptimeString(ctx.bootedAt)} this session</Field>
          <Field k="Shell">{profile.shell}</Field>
          <Field k="Theme">{ctx.theme}</Field>
          <Field k="Languages">{skills[0].items.slice(0, 5).join(", ")}</Field>
          <Field k="Infra">{skills[4].items.slice(0, 5).join(", ")}</Field>
          <Field k="Projects">{projects.length} public</Field>
          <Field k="Papers">{publications.length} published</Field>
        </div>
      </div>
    ),
  },
  {
    name: "theme",
    usage: "theme [name]",
    summary: "change the colour scheme",
    group: "system",
    run: (args, ctx) => {
      const key = (args[0] ?? "").toLowerCase();
      if (!key || key === "list") {
        return (
          <div className="space-y-1 text-sm">
            <Line tone="dim">Usage: theme &lt;name&gt;</Line>
            {themes.map((t) => (
              <div key={t.key} className="flex gap-3">
                <span className={`w-24 shrink-0 ${t.key === ctx.theme ? "text-term-accent" : "text-term-cyan"}`}>
                  {t.key === ctx.theme ? "* " : "  "}
                  {t.label}
                </span>
                <span className="text-term-faint">{t.description}</span>
              </div>
            ))}
          </div>
        );
      }
      if (key === "reset") {
        ctx.setTheme(defaultTheme);
        return <Line tone="green">Theme reset to {defaultTheme}.</Line>;
      }
      if (!themes.some((t) => t.key === key)) {
        return err(`theme: unknown theme '${key}'. Run \`theme\` to list them.`);
      }
      ctx.setTheme(key);
      return <Line tone="green">Theme set to {key}.</Line>;
    },
  },
  {
    name: "history",
    usage: "history",
    summary: "commands you've run this session",
    group: "system",
    run: (_args, ctx) => {
      if (ctx.history.length === 0) return <Line tone="faint">No history yet.</Line>;
      return (
        <div className="space-y-0.5 text-sm">
          {ctx.history.map((entry, i) => (
            <div key={`${i}-${entry}`}>
              <span className="mr-3 text-term-faint">{String(i + 1).padStart(3, " ")}</span>
              <span className="text-term-dim">{entry}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: "man",
    usage: "man <command>",
    summary: "manual page for a command",
    group: "system",
    run: (args) => {
      if (!args[0]) return err("What manual page do you want? Try `man ls`.");
      return manPage(args[0]);
    },
  },
  {
    name: "clear",
    aliases: ["cls"],
    usage: "clear",
    summary: "clear the screen",
    group: "system",
    run: (_args, ctx) => {
      ctx.clear();
    },
  },
  {
    name: "echo",
    usage: "echo <text>",
    summary: "print text back",
    group: "system",
    hidden: true,
    run: (args) => <Line>{args.join(" ")}</Line>,
  },
  {
    name: "date",
    usage: "date",
    summary: "current date and time",
    group: "system",
    hidden: true,
    run: () => <Line tone="dim">{new Date().toString()}</Line>,
  },
  {
    name: "uname",
    usage: "uname [-a]",
    summary: "system identity",
    group: "system",
    hidden: true,
    run: () => <Line tone="dim">portfolio 6.8.0-darsh #1 SMP x86_64 GNU/Linux</Line>,
  },
  {
    name: "uptime",
    usage: "uptime",
    summary: "how long this session has been open",
    group: "system",
    hidden: true,
    run: (_args, ctx) => (
      <Line tone="dim">
        up {uptimeString(ctx.bootedAt)}, 1 user, load average: 0.42, 0.37, 0.31
      </Line>
    ),
  },
  {
    name: "banner",
    usage: "banner",
    summary: "print the wordmark",
    group: "system",
    hidden: true,
    run: () => (
      <div className="space-y-2">
        <Ascii art={asciiName} />
        <Line tone="dim">
          {profile.role} @ {profile.company} — {profile.location}
        </Line>
      </div>
    ),
  },
  {
    name: "id",
    usage: "id",
    summary: "user identity",
    group: "system",
    hidden: true,
    run: () => <Line tone="dim">uid=1000(darsh) gid=1000(engineers) groups=1000(engineers),27(sudo),999(backend)</Line>,
  },
  {
    name: "exit",
    aliases: ["logout", "quit", ":q"],
    usage: "exit",
    summary: "end the session",
    group: "system",
    hidden: true,
    run: () => (
      <div className="space-y-1 text-sm">
        <Line tone="dim">logout</Line>
        <Line tone="faint">Connection to portfolio closed.</Line>
        <Hint>…except it isn&apos;t. Close the tab if you really mean it.</Hint>
      </div>
    ),
  },

  /* ------------------------------- easter eggs ------------------------------ */

  {
    name: "sudo",
    usage: "sudo <command>",
    summary: "escalate privileges",
    group: "fun",
    hidden: true,
    run: (args) => {
      if (args.join(" ").includes("cat .secrets")) {
        return (
          <div className="space-y-1 text-sm">
            <Line tone="green">[sudo] password for darsh: ********</Line>
            <Line tone="dim">Fine. The secrets:</Line>
            <ul className="space-y-1 pt-1">
              <Bullet>I still write `console.log` before I reach for a debugger.</Bullet>
              <Bullet>Tabs in the editor, spaces in the diff. Prettier settles it.</Bullet>
              <Bullet>Most of my best design decisions happened on a walk, not at a desk.</Bullet>
              <Bullet>I peaked at Immortal in Valorant and have been declining ever since.</Bullet>
            </ul>
          </div>
        );
      }
      return (
        <div className="space-y-1 text-sm">
          <Line tone="red">darsh is not in the sudoers file.</Line>
          <Line tone="faint">This incident has been reported.</Line>
        </div>
      );
    },
  },
  {
    name: "rm",
    usage: "rm <file>",
    summary: "remove files",
    group: "fun",
    hidden: true,
    run: (args) => {
      if (args.includes("-rf") && (args.includes("/") || args.includes("*"))) {
        return (
          <div className="space-y-1 text-sm">
            <Line tone="red">rm: it is dangerous to operate recursively on &apos;/&apos;</Line>
            <Line tone="red">rm: use --no-preserve-root to override this failsafe</Line>
            <Line tone="faint">Please don&apos;t. I only just got this deployed.</Line>
          </div>
        );
      }
      return err("rm: read-only file system");
    },
  },
  {
    name: "vim",
    aliases: ["vi", "nano", "emacs", "nvim"],
    usage: "vim <file>",
    summary: "open an editor",
    group: "fun",
    hidden: true,
    run: () => (
      <div className="space-y-1 text-sm">
        <Line tone="dim">E212: Can&apos;t open file for writing</Line>
        <Line tone="faint">You&apos;re a guest here. Read-only, like a well-behaved production database.</Line>
      </div>
    ),
  },
  {
    name: "cowsay",
    usage: "cowsay <text>",
    summary: "a cow says something",
    group: "fun",
    hidden: true,
    run: (args) => {
      const text = args.join(" ") || "hire darsh";
      const bar = "_".repeat(text.length + 2);
      const under = "-".repeat(text.length + 2);
      return (
        <pre className="whitespace-pre text-xs leading-tight text-term-dim">{` ${bar}
< ${text} >
 ${under}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}</pre>
      );
    },
  },
  {
    name: "fortune",
    usage: "fortune",
    summary: "a line of wisdom",
    group: "fun",
    hidden: true,
    run: () => {
      const lines = [
        "There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors.",
        "The fastest query is the one you never send.",
        "Every distributed system is a single point of failure wearing a trench coat.",
        "It works on my machine is a statement about your machine, not the code.",
        "A retry without a backoff is just a denial of service you wrote yourself.",
        "Logs are the only witness you'll have at 3am.",
      ];
      return <Line tone="yellow">{lines[Math.floor(Math.random() * lines.length)]}</Line>;
    },
  },
  {
    name: "sl",
    usage: "sl",
    summary: "you meant ls",
    group: "fun",
    hidden: true,
    run: () => (
      <pre className="overflow-x-auto whitespace-pre text-[10px] leading-tight text-term-yellow">{`      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  | ________|___H__/__|_____/[][]~\\_______|       |
  |/ |   |-----------I_____I [][] []  D   |=======|__`}</pre>
    ),
  },
  {
    name: "coffee",
    aliases: ["brew"],
    usage: "coffee",
    summary: "request coffee",
    group: "fun",
    hidden: true,
    run: () => (
      <div className="space-y-1 text-sm">
        <Line tone="red">HTTP 418 I&apos;m a teapot</Line>
        <Line tone="faint">The requested entity body is short and stout.</Line>
      </div>
    ),
  },
  {
    name: "curl",
    aliases: ["wget", "ping"],
    usage: "curl <url>",
    summary: "fetch a url",
    group: "fun",
    hidden: true,
    run: (args) => {
      const url = args.find((a) => !a.startsWith("-")) ?? "";
      return (
        <div className="space-y-0.5 text-sm">
          <Line tone="faint">
            {"* "}Trying {url || "portfolio"}…
          </Line>
          <Line tone="green">{"< "}HTTP/2 200</Line>
          <Line tone="dim">{"< "}content-type: text/plain; charset=utf-8</Line>
          <Line tone="dim">{"< "}x-powered-by: caffeine, curiosity</Line>
          <Line className="pt-1">{profile.tagline}</Line>
        </div>
      );
    },
  },
  {
    name: "valorant",
    usage: "valorant",
    summary: "rank check",
    group: "fun",
    hidden: true,
    run: () => (
      <div className="space-y-1 text-sm">
        <Field k="peak">Immortal</Field>
        <Field k="current">…we don&apos;t talk about current</Field>
        <Field k="agent">Whoever nobody else instalocked</Field>
      </div>
    ),
  },
];

/* ------------------------------- dispatching ------------------------------ */

const byName = new Map<string, Command>();
for (const command of commands) {
  byName.set(command.name, command);
  for (const alias of command.aliases ?? []) byName.set(alias, command);
}

export function lookup(name: string): Command | undefined {
  return byName.get(name.toLowerCase());
}

export const commandNames = Array.from(byName.keys()).sort();

/** Names offered by tab completion — real commands first, no aliases-only noise. */
export const completionNames = Array.from(
  new Set([...commands.filter((c) => !c.hidden).map((c) => c.name), ...commandNames]),
);

function manPage(name: string): ReactNode {
  const command = lookup(name);
  if (!command) return err(`No manual entry for ${name}`);
  return (
    <div className="space-y-2 text-sm">
      <Line tone="fg">
        <span className="font-semibold">{command.name.toUpperCase()}(1)</span>
      </Line>
      <div>
        <div className="text-term-accent">NAME</div>
        <div className="pl-4 text-term-dim">
          {command.name} — {command.summary}
        </div>
      </div>
      <div>
        <div className="text-term-accent">SYNOPSIS</div>
        <div className="pl-4 text-term-dim">{command.usage}</div>
      </div>
      {command.aliases?.length ? (
        <div>
          <div className="text-term-accent">ALIASES</div>
          <div className="pl-4 text-term-dim">{command.aliases.join(", ")}</div>
        </div>
      ) : null}
    </div>
  );
}

/** Parses `cmd arg1 "arg two"` into tokens. */
export function tokenize(input: string): string[] {
  const matches = input.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  return matches.map((t) => t.replace(/^["']|["']$/g, ""));
}

export function execute(input: string, ctx: CommandContext): ReactNode | void {
  const tokens = tokenize(input.trim());
  if (tokens.length === 0) return;
  const [name, ...args] = tokens;
  const command = lookup(name);
  if (!command) {
    const suggestion = completionNames.find((c) => c.startsWith(name.slice(0, 2).toLowerCase()));
    return (
      <div className="space-y-1 text-sm">
        <Line tone="red">zsh: command not found: {name}</Line>
        <Line tone="faint">
          {suggestion ? `Did you mean \`${suggestion}\`? ` : ""}Run `help` to see everything available.
        </Line>
      </div>
    );
  }
  return command.run(args, ctx);
}

/** Tab completion: commands at position 0, paths/pages afterwards. */
export function complete(input: string, cwd: string): string[] {
  const endsWithSpace = /\s$/.test(input);
  const tokens = tokenize(input);
  const atCommand = tokens.length === 0 || (tokens.length === 1 && !endsWithSpace);

  if (atCommand) {
    const partial = (tokens[0] ?? "").toLowerCase();
    return completionNames.filter((c) => c.startsWith(partial));
  }

  const command = lookup(tokens[0]);
  const partial = endsWithSpace ? "" : (tokens[tokens.length - 1] ?? "");

  if (command?.name === "open") {
    return Object.keys(routes).filter((r) => r.startsWith(partial.toLowerCase()));
  }
  if (command?.name === "theme") {
    return themes.map((t) => t.key).filter((t) => t.startsWith(partial.toLowerCase()));
  }
  if (command?.name === "man" || command?.name === "help") {
    return completionNames.filter((c) => c.startsWith(partial.toLowerCase()));
  }
  if (command?.name === "ssh") {
    return ["darsh@portfolio"].filter((c) => c.startsWith(partial));
  }

  const dirPart = partial.includes("/") ? partial.slice(0, partial.lastIndexOf("/") + 1) : "";
  const namePart = partial.slice(dirPart.length);
  const entries = listDir(resolvePath(cwd, dirPart || "."), namePart.startsWith("."));
  if (!entries) return [];
  return entries
    .filter((e) => e.name.startsWith(namePart))
    .map((e) => dirPart + e.name + (e.type === "dir" ? "/" : ""));
}
