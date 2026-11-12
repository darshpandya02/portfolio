import { chatNotes, education, experience, journey, links, profile, projects, publications, skills } from "@/lib/content";
import { articles } from "@/lib/writing";

/**
 * What the chat assistant is told, built per question.
 *
 * The model is a small one running on a laptop with a short context window, so
 * the full profile (all projects, jobs and deep dives, ~20k tokens) cannot be
 * sent every time: it would be slow to read and would be truncated. Instead the
 * prompt is a compact core profile plus the few detailed passages that best
 * match the visitor's question, found with simple keyword scoring (BM25).
 */

/* ------------------------------------------------------------------ */
/* Core profile: always sent, kept short                               */
/* ------------------------------------------------------------------ */

function coreProfile(): string {
  const lines: string[] = [];
  lines.push(`${profile.name}: ${profile.role} at ${profile.company}, based in ${profile.location}.`, profile.summary);
  lines.push(`Availability: ${profile.availability}`);
  lines.push(`Contact: ${profile.email} | GitHub ${links.github} | LinkedIn ${links.linkedin} | Resume: /files/resume.pdf on this site`);
  lines.push("", "Experience (newest first):");
  for (const j of experience) lines.push(`- ${j.role}, ${j.company} (${j.location}), ${j.start} to ${j.end}: ${j.summary}`);
  lines.push("", "Education:");
  for (const e of education) lines.push(`- ${e.degree}, ${e.school}, ${e.start} to ${e.end}, GPA ${e.gpa}`);
  lines.push("", "Skills:", ...skills.map((g) => `- ${g.name}: ${g.items.join(", ")}`));
  lines.push("", "Projects (name: one-line summary):", ...projects.map((p) => `- ${p.name} (${p.year}): ${p.tagline}`));
  lines.push("", "Deep-dive articles on this site:", ...articles.map((a) => `- ${a.title} (/writing/${a.slug})`));
  lines.push("", "Publications:", ...publications.map((p) => `- ${p.title}. ${p.venue}, ${p.year}.`));
  lines.push("", "Timeline:", journey.map((j) => `${j.year} ${j.title}`).join("; "));
  if (chatNotes.length) lines.push("", "More about him:", ...chatNotes.map((n) => `- ${n}`));
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Detailed passages: retrieved per question                           */
/* ------------------------------------------------------------------ */

interface Passage {
  title: string;
  text: string;
  terms: Map<string, number>;
  length: number;
}

const STOP = new Set(
  "the a an and or of to in on for with at by from is are was were be been his he him what which who how does did do about tell me you your this that it its as has have had can could would should into over than then them they their there any anything something some built build building made make work worked working use used using know knows done ever also much many like get got give".split(
    " ",
  ),
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .split(" ")
    .map((w) => w.replace(/^\.+|\.+$/g, ""))
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function passage(title: string, body: string[]): Passage {
  const text = [title, ...body].join("\n");
  const words = tokenize(`${title} ${title} ${title} ${body.join(" ")}`); // title words weigh three times
  const terms = new Map<string, number>();
  for (const w of words) terms.set(w, (terms.get(w) ?? 0) + 1);
  return { title, text, terms, length: words.length };
}

function buildPassages(): Passage[] {
  const out: Passage[] = [];
  for (const j of experience) {
    out.push(
      passage(`Job: ${j.role}, ${j.company}, ${j.start} to ${j.end}`, [
        j.summary,
        ...j.highlights.map((h) => `- ${h}`),
        `Stack: ${j.stack.join(", ")}`,
      ]),
    );
  }
  for (const p of projects) {
    out.push(
      passage(`Project: ${p.name} (${p.year})`, [
        p.tagline,
        ...p.description,
        ...p.highlights.map((h) => `- ${h}`),
        `Stack: ${p.stack.join(", ")}`,
        ...(p.demo ? [`Demo: ${p.demo}`] : []),
        ...(p.github ? [`Code: ${p.github}`] : []),
      ]),
    );
  }
  for (const a of articles) {
    // One passage per section, so a question about one detail pulls only that part.
    let heading = "Introduction";
    let buf: string[] = [a.dek];
    const flush = () => {
      if (buf.length) out.push(passage(`Article "${a.title}" (/writing/${a.slug}), section: ${heading}`, buf));
      buf = [];
    };
    for (const b of a.body) {
      if (b.type === "h2") {
        flush();
        heading = b.text;
      } else if (b.type === "p" || b.type === "callout" || b.type === "h3") buf.push(b.text);
      else if (b.type === "list") buf.push(...b.items.map((i) => `- ${i}`));
      else if (b.type === "stats") buf.push(...b.items.map((s) => `- ${s.value}: ${s.label}`));
      else if (b.type === "table") buf.push(b.head.join(" | "), ...b.rows.map((r) => r.join(" | ")));
    }
    flush();
  }
  out.push(passage("Full bio", profile.bio));
  out.push(passage("Education and coursework", education.map((e) => `${e.degree}, ${e.school} (${e.location}). Coursework: ${e.coursework.join(", ")}.`)));
  out.push(passage("Publications", publications.map((p) => `${p.title}. ${p.venue}, ${p.year}. ${p.note ?? ""}`)));
  return out.map((p) => ({ ...p, text: p.text.replace(/`/g, "") }));
}

const PASSAGES = buildPassages();
const AVG_LEN = PASSAGES.reduce((s, p) => s + p.length, 0) / PASSAGES.length;
const DOC_FREQ = new Map<string, number>();
for (const p of PASSAGES) p.terms.forEach((_, t) => DOC_FREQ.set(t, (DOC_FREQ.get(t) ?? 0) + 1));

function bm25(query: string[], p: Passage): number {
  const k1 = 1.4;
  const b = 0.75;
  let score = 0;
  for (const q of query) {
    const tf = p.terms.get(q);
    if (!tf) continue;
    const df = DOC_FREQ.get(q) ?? 0;
    const idf = Math.log(1 + (PASSAGES.length - df + 0.5) / (df + 0.5));
    score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * p.length) / AVG_LEN)));
  }
  return score;
}

/**
 * Keeps a long passage to its title plus the lines that mention the query
 * terms, so one big article section doesn't eat the whole budget.
 */
function trimPassage(p: Passage, query: string[], maxChars: number): string {
  if (p.text.length <= maxChars) return p.text;
  const [title, ...lines] = p.text.split("\n");
  const scored = lines.map((line, i) => {
    const words = new Set(tokenize(line));
    return { line, i, hits: query.filter((q) => words.has(q)).length };
  });
  const keep = scored
    .filter((l) => l.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.i - b.i);
  const chosen: typeof scored = [];
  let used = title.length;
  for (const l of keep.length ? keep : scored) {
    if (used + l.line.length > maxChars) continue;
    chosen.push(l);
    used += l.line.length + 1;
  }
  return [title, ...chosen.sort((a, b) => a.i - b.i).map((l) => l.line)].join("\n");
}

/**
 * The best-matching passages for a question, within a character budget. The
 * budget is small on purpose: every extra token of detail costs the laptop
 * model roughly 25 ms before it can start answering.
 */
export function retrieve(question: string, maxPassages = 3, budget = 2400): Passage[] {
  const query = Array.from(new Set(tokenize(question)));
  if (!query.length) return [];
  const ranked = PASSAGES.map((p) => ({ p, s: bm25(query, p) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s);
  const picked: Passage[] = [];
  let used = 0;
  for (const { p } of ranked) {
    if (picked.length >= maxPassages || used >= budget) break;
    const text = trimPassage(p, query, Math.min(1000, budget - used));
    if (text.length < 80) continue;
    picked.push({ ...p, text });
    used += text.length;
  }
  return picked;
}

/* ------------------------------------------------------------------ */
/* System prompt                                                       */
/* ------------------------------------------------------------------ */

const CORE = coreProfile();

const RULES = `You are the assistant on ${profile.name}'s portfolio website. Visitors are usually recruiters, hiring managers and engineers who want to know about his work.

Answer only from the profile and details below. Refer to him in the third person, by name or as "he". If they don't answer the question, say you don't know and suggest emailing him at ${profile.email}. Never guess at facts that are not written below, such as salary expectations, visa or work authorization, references, or anything personal. Send those questions to email as well.

Keep replies short: two to five sentences, or a brief list when comparing items. Plain text only, no markdown headings, bold or tables. Do not use em dashes or en dashes. When a project has a live demo or source link, include the URL. Stay on the topic of his work and politely decline unrelated requests, such as writing code for the visitor.`;

/** System prompt for one question: rules, core profile, and the matching details. */
export function buildSystemPrompt(question: string): string {
  const details = retrieve(question);
  const detailBlock = details.length
    ? `\n\n<details>\n${details.map((d) => d.text).join("\n\n")}\n</details>`
    : "";
  return `${RULES}\n\n<profile>\n${CORE}\n</profile>${detailBlock}`;
}
