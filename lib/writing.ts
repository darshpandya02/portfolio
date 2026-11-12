import { concurrency } from "@/lib/writing/concurrency";
import { evaluation } from "@/lib/writing/evaluation";
import { farepath } from "@/lib/writing/farepath";
import { moderation } from "@/lib/writing/moderation";
import { raft } from "@/lib/writing/raft";
import type { Article } from "@/lib/writing-types";

export type { Article, Block } from "@/lib/writing-types";
export { headingId, readMinutes } from "@/lib/writing-types";

/** Display order: distributed systems and low-level first, then algorithms, then AI/ML. */
export const articles: Article[] = [raft, moderation, concurrency, farepath, evaluation];

export function articleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Plain-text version of an article, for the chat assistant's knowledge. */
export function articleText(article: Article): string {
  const lines = [`### ${article.title}`, article.dek];
  for (const b of article.body) {
    if (b.type === "p" || b.type === "callout") lines.push(b.text);
    else if (b.type === "h2" || b.type === "h3") lines.push(`${b.text}:`);
    else if (b.type === "list") lines.push(...b.items.map((i) => `- ${i}`));
    else if (b.type === "stats") lines.push(...b.items.map((s) => `- ${s.value}: ${s.label}`));
    else if (b.type === "table") lines.push(b.head.join(" | "), ...b.rows.map((r) => r.join(" | ")));
  }
  return lines.join("\n").replace(/`/g, "");
}
