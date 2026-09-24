import { projects } from "@/lib/content";

export type DocKey =
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "publications"
  | "education"
  | "contact"
  | "resume"
  | "readme"
  | "secrets"
  | "zshrc"
  | `project:${string}`;

export interface FsNode {
  name: string;
  type: "file" | "dir";
  doc?: DocKey;
  /** Real Next.js route this node mirrors, used by `open`. */
  route?: string;
  size: number;
  modified: string;
  hidden?: boolean;
  children?: FsNode[];
}

export const HOME = "/home/darsh";

const projectFiles: FsNode[] = projects.map((p) => ({
  name: `${p.slug}.md`,
  type: "file",
  doc: `project:${p.slug}` as DocKey,
  route: `/projects/${p.slug}`,
  size: 1200 + p.slug.length * 37,
  modified: `${p.year}`,
}));

export const root: FsNode = {
  name: "/",
  type: "dir",
  size: 0,
  modified: "2026",
  children: [
    {
      name: "home",
      type: "dir",
      size: 0,
      modified: "2026",
      children: [
        {
          name: "darsh",
          type: "dir",
          size: 0,
          modified: "2026",
          children: [
            { name: "README.md", type: "file", doc: "readme", route: "/", size: 940, modified: "2026" },
            { name: "about.md", type: "file", doc: "about", route: "/about", size: 2480, modified: "2026" },
            { name: "experience.md", type: "file", doc: "experience", route: "/experience", size: 3310, modified: "2026" },
            { name: "projects.md", type: "file", doc: "projects", route: "/projects", size: 4120, modified: "2026" },
            { name: "skills.md", type: "file", doc: "skills", route: "/skills", size: 1760, modified: "2026" },
            { name: "publications.md", type: "file", doc: "publications", route: "/publications", size: 1180, modified: "2026" },
            { name: "education.md", type: "file", doc: "education", route: "/education", size: 980, modified: "2025" },
            { name: "contact.md", type: "file", doc: "contact", route: "/contact", size: 620, modified: "2026" },
            { name: "resume.pdf", type: "file", doc: "resume", route: "/resume", size: 194516, modified: "2026" },
            {
              name: "projects",
              type: "dir",
              route: "/projects",
              size: 0,
              modified: "2026",
              children: projectFiles,
            },
            { name: ".zshrc", type: "file", doc: "zshrc", size: 412, modified: "2026", hidden: true },
            { name: ".secrets", type: "file", doc: "secrets", size: 128, modified: "2026", hidden: true },
          ],
        },
      ],
    },
  ],
};

/** Normalizes `~`, `.`, `..` and relative segments against `cwd`. */
export function resolvePath(cwd: string, input: string): string {
  let target = input.trim();
  if (target === "" || target === "~") return HOME;
  if (target.startsWith("~/")) target = HOME + target.slice(1);

  const segments = target.startsWith("/")
    ? target.split("/")
    : [...cwd.split("/"), ...target.split("/")];

  const stack: string[] = [];
  for (const segment of segments) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      stack.pop();
      continue;
    }
    stack.push(segment);
  }
  return "/" + stack.join("/");
}

export function getNode(path: string): FsNode | null {
  const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");
  if (normalized === "/" || normalized === "") return root;

  let node: FsNode = root;
  for (const segment of normalized.split("/").filter(Boolean)) {
    if (node.type !== "dir" || !node.children) return null;
    const next = node.children.find((c) => c.name === segment);
    if (!next) return null;
    node = next;
  }
  return node;
}

export function listDir(path: string, includeHidden = false): FsNode[] | null {
  const node = getNode(path);
  if (!node || node.type !== "dir" || !node.children) return null;
  return node.children.filter((c) => includeHidden || !c.hidden);
}

/** `/home/darsh/projects` -> `~/projects` for the prompt. */
export function prettyPath(path: string): string {
  if (path === HOME) return "~";
  if (path.startsWith(HOME + "/")) return "~" + path.slice(HOME.length);
  return path;
}

/** Every file path under `~`, used by `find`, `grep` and tab completion. */
export function allFiles(): { path: string; node: FsNode }[] {
  const out: { path: string; node: FsNode }[] = [];
  const walk = (node: FsNode, path: string) => {
    for (const child of node.children ?? []) {
      const childPath = `${path}/${child.name}`;
      if (child.type === "dir") {
        out.push({ path: childPath, node: child });
        walk(child, childPath);
      } else {
        out.push({ path: childPath, node: child });
      }
    }
  };
  const home = getNode(HOME);
  if (home) walk(home, HOME);
  return out;
}
