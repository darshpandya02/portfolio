/**
 * Long-form write-ups about the deepest work. Bodies are structured blocks
 * rather than Markdown so the article page controls every element's styling
 * and the chat assistant can read the same text.
 *
 * Inline text supports `code` spans with backticks; nothing else is parsed.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; code: string; lang?: string; caption?: string }
  | { type: "callout"; text: string; label?: string }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string };

export interface Article {
  slug: string;
  title: string;
  /** One-sentence summary under the title and on cards. */
  dek: string;
  category: string;
  /** Month and year it was written, e.g. "Nov 2026". */
  date: string;
  /** Slugs from `projects` in content.ts that this article is about. */
  projects: string[];
  /** Short labels shown on the card. */
  tags: string[];
  body: Block[];
}

/** URL-safe id for a heading, used for the table of contents. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Reading time at a technical pace (~200 words per minute), rounded up; code counted lightly. */
export function readMinutes(article: Article): number {
  let words = 0;
  for (const b of article.body) {
    if (b.type === "p" || b.type === "h2" || b.type === "h3" || b.type === "callout") words += b.text.split(/\s+/).length;
    else if (b.type === "list") words += b.items.join(" ").split(/\s+/).length;
    else if (b.type === "code") words += Math.round(b.code.split(/\s+/).length / 3);
    else if (b.type === "table") words += b.rows.flat().join(" ").split(/\s+/).length / 2;
  }
  return Math.max(3, Math.ceil(words / 200));
}
