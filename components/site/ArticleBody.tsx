import { Fragment } from "react";

import { type Block, headingId } from "@/lib/writing-types";

/** Renders `code` spans; everything else is plain text. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={i}
            className="rounded-md border border-ed-line bg-ed-sunken px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[0.85em] text-[var(--c2)]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export default function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="article-body space-y-6 text-[1.075rem] leading-[1.8]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="text-ed-muted [&:first-child]:text-ed-ink">
                <Inline text={block.text} />
              </p>
            );
          case "h2":
            return (
              <h2 key={i} id={headingId(block.text)} className="font-display scroll-mt-24 pt-8 text-3xl leading-tight text-ed-ink">
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="font-display pt-2 text-xl text-ed-ink">
                {block.text}
              </h3>
            );
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={i} className="space-y-3 text-ed-muted">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    {block.ordered ? (
                      <span className="font-label mt-[0.35em] w-6 shrink-0 text-sm text-[var(--c2)]">{String(j + 1).padStart(2, "0")}</span>
                    ) : (
                      <span className="mt-[0.75em] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[var(--c1)] to-[var(--c2)]" aria-hidden />
                    )}
                    <span>
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </Tag>
            );
          }
          case "code":
            return (
              <figure key={i} className="overflow-hidden rounded-2xl border border-ed-line bg-[var(--ed-surface-solid)]">
                <div className="font-label flex items-center gap-2 border-b border-ed-line px-4 py-2 text-[11px] text-ed-faint">
                  <span className="h-2 w-2 rounded-full bg-[var(--c3)] opacity-70" aria-hidden />
                  <span className="h-2 w-2 rounded-full bg-[var(--c2)] opacity-70" aria-hidden />
                  <span className="h-2 w-2 rounded-full bg-[var(--c1)] opacity-70" aria-hidden />
                  <span className="ml-2">{block.lang ?? "text"}</span>
                </div>
                <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
                  <code className="font-[family-name:var(--font-mono)] text-ed-ink">{block.code}</code>
                </pre>
                {block.caption ? <figcaption className="border-t border-ed-line px-4 py-2 text-xs text-ed-faint">{block.caption}</figcaption> : null}
              </figure>
            );
          case "callout":
            return (
              <aside key={i} className="relative overflow-hidden rounded-2xl border border-ed-line bg-ed-accent-soft px-6 py-5">
                <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--c1)] via-[var(--c2)] to-[var(--c3)]" />
                {block.label ? (
                  <p className="font-label mb-1 text-[11px] uppercase tracking-[0.16em] text-[var(--c2)]">{block.label}</p>
                ) : null}
                <p className="text-ed-ink">
                  <Inline text={block.text} />
                </p>
              </aside>
            );
          case "stats":
            return (
              <dl key={i} className="grid gap-3 sm:grid-cols-3">
                {block.items.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-ed-line bg-ed-sunken px-5 py-4">
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="font-display fx-gradient-text block text-3xl">{s.value}</span>
                      <span className="text-sm text-ed-muted">{s.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            );
          case "table":
            return (
              <figure key={i} className="overflow-x-auto rounded-2xl border border-ed-line">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead className="bg-ed-sunken text-ed-ink">
                    <tr>
                      {block.head.map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ed-line text-ed-muted">
                    {block.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c} className="px-4 py-3 align-top">
                            <Inline text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {block.caption ? <figcaption className="border-t border-ed-line px-4 py-2 text-xs text-ed-faint">{block.caption}</figcaption> : null}
              </figure>
            );
        }
      })}
    </div>
  );
}
