import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleBody from "@/components/site/ArticleBody";
import SiteShell from "@/components/site/SiteShell";
import { profile, projects, SITE_URL } from "@/lib/content";
import { articleBySlug, articles, headingId, readMinutes } from "@/lib/writing";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articleBySlug(params.slug);
  if (!article) return {};
  const url = `${SITE_URL}/writing/${article.slug}`;
  return {
    title: article.title,
    description: article.dek,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: article.title, description: article.dek, siteName: profile.name },
    twitter: { card: "summary_large_image", title: article.title, description: article.dek },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articleBySlug(params.slug);
  if (!article) notFound();

  const index = articles.indexOf(article);
  const next = articles[(index + 1) % articles.length];
  const related = article.projects.flatMap((slug) => projects.filter((p) => p.slug === slug));
  const toc = article.body.filter((b) => b.type === "h2").map((b) => b.text);

  return (
    <SiteShell>
      <article className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
        {/* Header drifts and fades as the reader scrolls into the body. */}
        <header data-hero-out="0.25" className="mx-auto max-w-3xl text-center">
          <div data-reveal className="flex items-center justify-center gap-3">
            <Link href="/#writing" className="font-label text-xs text-ed-muted transition-colors hover:text-ed-ink">
              ← All deep dives
            </Link>
            <span className="h-3 w-px bg-ed-line" aria-hidden />
            <span className="font-label text-xs uppercase tracking-[0.16em] text-[var(--c2)]">{article.category}</span>
          </div>
          <h1 className="font-display mt-6 text-4xl leading-[1.05] sm:text-6xl" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            {article.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ed-muted sm:text-xl" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            {article.dek}
          </p>
          <p className="font-label mt-6 text-xs text-ed-faint" data-reveal style={{ "--d": 3 } as React.CSSProperties}>
            {profile.name} · {article.date} · {readMinutes(article)} min read
          </p>
        </header>

        <div className="mt-16 grid gap-12 xl:grid-cols-[220px_minmax(0,1fr)_220px]">
          <nav aria-label="On this page" className="hidden xl:block">
            <div className="sticky top-28">
              <p className="font-label mb-3 text-[11px] uppercase tracking-[0.16em] text-ed-faint">On this page</p>
              <ol className="space-y-2 border-l border-ed-line">
                {toc.map((h) => (
                  <li key={h}>
                    <a href={`#${headingId(h)}`} className="-ml-px block border-l border-transparent pl-4 text-sm text-ed-muted transition-colors hover:border-[var(--c2)] hover:text-ed-ink">
                      {h}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="mx-auto w-full max-w-[44rem]">
            <ArticleBody blocks={article.body} />

            {related.length ? (
              <aside className="fx-card mt-16 rounded-3xl p-6 sm:p-8" data-tilt="off" data-reveal>
                <p className="font-label mb-4 text-[11px] uppercase tracking-[0.16em] text-ed-faint">The code behind this</p>
                <ul className="space-y-4">
                  {related.map((p) => (
                    <li key={p.slug} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-ed-muted">{p.tagline}</p>
                      </div>
                      <div className="flex shrink-0 gap-4 text-sm font-medium text-ed-accent">
                        {p.demo ? (
                          <a href={p.demo} target="_blank" rel="noreferrer noopener" className="hover:underline">
                            Live demo ↗
                          </a>
                        ) : null}
                        {p.github ? (
                          <a href={p.github} target="_blank" rel="noreferrer noopener" className="hover:underline">
                            Source ↗
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}

            <Link
              href={`/writing/${next.slug}`}
              className="fx-card group/next mt-6 block rounded-3xl p-6 sm:p-8"
              data-reveal
            >
              <p className="font-label text-[11px] uppercase tracking-[0.16em] text-ed-faint">Next deep dive</p>
              <p className="font-display mt-3 text-2xl leading-snug">{next.title}</p>
              <p className="mt-2 text-sm text-ed-muted">{next.dek}</p>
              <p className="mt-4 text-sm font-semibold text-ed-accent">
                Keep reading <span className="inline-block transition-transform group-hover/next:translate-x-1">→</span>
              </p>
            </Link>
          </div>
          <div className="hidden xl:block" aria-hidden />
        </div>
      </article>
    </SiteShell>
  );
}
