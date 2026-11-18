import Image from "next/image";
import type { CSSProperties } from "react";

import Link from "next/link";

import BlueprintBackdrop from "@/components/site/BlueprintBackdrop";
import MoreDetail from "@/components/site/MoreDetail";
import { articles, readMinutes } from "@/lib/writing";
import {
  education,
  experience,
  links,
  profile,
  projects,
  publications,
  showcase,
  skills,
  type Experience,
  type Project,
  type ProjectArea,
} from "@/lib/content";

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** Stagger index for [data-reveal]; FxRuntime multiplies it into a delay. */
const delay = (d: number) => ({ "--d": d }) as CSSProperties;

function SectionHeading({ title, lede }: { title: string; lede?: string }) {
  return (
    <div className="mb-10 border-b border-ed-line pb-4" data-reveal>
      <h2 className="font-display text-2xl leading-tight sm:text-3xl">{title}</h2>
      {lede ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ed-muted sm:text-base">
          {lede}
        </p>
      ) : null}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label fx-chip inline-flex items-center rounded border border-ed-line bg-ed-surface px-1.5 py-0.5 text-[11px] text-ed-muted">
      {children}
    </span>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        {children}
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden
      className="shrink-0 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
    >
      <path
        d="M3.5 8.5l5-5M4.5 3.5h4v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className="group/link relative inline-flex items-center gap-1 text-sm font-medium text-ed-accent"
    >
      {children}
      <ArrowIcon />
      <span
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover/link:scale-x-100"
        aria-hidden
      />
    </a>
  );
}

const socials = [
  { label: "GitHub", href: links.github },
  { label: "LinkedIn", href: links.linkedin },
  { label: "Email", href: links.email },
];

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function Hero() {
  const current = experience.find((job) => job.current) ?? experience[0];

  return (
    <section
      id="home"
      className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h1 className="font-display text-5xl leading-none sm:text-6xl" data-reveal>
            {profile.name}
          </h1>
          <p className="mt-3 text-lg text-ed-muted" data-reveal style={delay(1)}>
            {current.role} at SPHERE · {profile.location.split(",")[0]}, MA
          </p>

          <p
            className="mt-8 max-w-xl text-lg leading-relaxed"
            data-reveal
            style={delay(2)}
          >
            I build backend services and distributed systems. Right now that
            means research infrastructure for reproducible cybersecurity
            experiments. Before that: messaging pipelines at Gupshup, research
            data platforms at Northeastern, and a consumer app in Mumbai.
          </p>

          <div
            className="mt-8 flex flex-wrap items-center gap-3"
            data-reveal
            style={delay(3)}
          >
            <a
              href="#experience"
              className="fx-btn-primary rounded-md px-5 py-2.5 text-sm font-semibold"
            >
              View experience
            </a>
            <a
              href={links.resume}
              target="_blank"
              rel="noreferrer"
              className="fx-btn-ghost rounded-md px-5 py-2.5 text-sm font-medium"
            >
              Resume (PDF)
            </a>
            <div className="flex w-full gap-5 pt-2 sm:ml-3 sm:w-auto sm:pt-0">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="text-sm text-ed-muted underline-offset-4 transition-colors hover:text-ed-ink hover:underline"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <p className="mt-6 text-sm text-ed-faint" data-reveal style={delay(4)}>
            There&apos;s also a{" "}
            <Link href="/play" className="text-ed-muted underline underline-offset-4 hover:text-ed-ink">
              pixel-city version
            </Link>{" "}
            of this site, and a{" "}
            <Link href="/terminal" className="text-ed-muted underline underline-offset-4 hover:text-ed-ink">
              terminal
            </Link>
            .
          </p>
        </div>

        <div data-reveal style={delay(2)} className="mx-auto w-full max-w-[18rem] lg:max-w-[20rem]">
          <Image
            src={profile.avatar}
            alt={profile.avatarAlt}
            width={800}
            height={800}
            priority
            sizes="(min-width: 1024px) 320px, 70vw"
            className="aspect-square w-full rounded-lg border border-ed-line object-cover"
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stack strip                                                         */
/* ------------------------------------------------------------------ */

const stack: { name: string; icon?: string }[] = [
  { name: "Python", icon: "python-original.svg" },
  { name: "TypeScript" },
  { name: "Java", icon: "java-original.svg" },
  { name: "C++", icon: "cplusplus-original.svg" },
  { name: "Node.js", icon: "nodejs-original-wordmark.svg" },
  { name: "Spring Boot" },
  { name: "Django", icon: "django-plain-wordmark.svg" },
  { name: "FastAPI" },
  { name: "PostgreSQL", icon: "postgresql-original.svg" },
  { name: "Redis", icon: "redis-original.svg" },
  { name: "MongoDB", icon: "mongodb-original.svg" },
  { name: "Kafka", icon: "apachekafka-original.svg" },
  { name: "RabbitMQ", icon: "rabbitmq-original.svg" },
  { name: "Docker", icon: "docker-original.svg" },
  { name: "Kubernetes", icon: "kubernetes-original.svg" },
  { name: "AWS", icon: "amazonwebservices-original-wordmark.svg" },
  { name: "React", icon: "react-original.svg" },
  { name: "Next.js" },
  { name: "Jenkins", icon: "jenkins-original.svg" },
  { name: "Linux" },
];

export function StackStrip() {
  const half = Math.ceil(stack.length / 2);
  const rows = [stack.slice(0, half), stack.slice(half)];

  const pills = (items: typeof stack, hidden: boolean) =>
    items.map((tech) => (
      <li
        key={tech.name + (hidden ? "-dup" : "")}
        aria-hidden={hidden || undefined}
        className="fx-logo-pill flex items-center gap-2 whitespace-nowrap rounded-full border border-ed-line bg-ed-surface px-5 py-2.5 text-[15px]"
      >
        {tech.icon ? (
          <Image
            src={`/images/technologies/${tech.icon}`}
            alt=""
            width={20}
            height={20}
            className="ed-logo h-5 w-5 object-contain"
          />
        ) : (
          <span
            className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[var(--c1)] to-[var(--c2)]"
            aria-hidden
          />
        )}
        {tech.name}
      </li>
    ));

  return (
    <div className="overflow-hidden border-y border-ed-line py-8">
      <p className="font-label fx-eyebrow mx-auto mb-5 max-w-6xl px-4 text-xs uppercase tracking-[0.18em] text-ed-faint sm:px-6">
        The stack I build with
      </p>
      {/* Rows slide in opposite directions as the page scrolls. Each is repeated
          so there is never an empty edge, whichever way it has moved. */}
      <div className="ed-marquee-mask space-y-3">
        {rows.map((row, r) => (
          <ul
            key={r}
            data-drift={r === 0 ? "-1" : "1"}
            className="flex w-max gap-3"
          >
            {pills(row, false)}
            {pills(row, true)}
            {pills(row, true)}
            {pills(row, true)}
          </ul>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* About + education                                                   */
/* ------------------------------------------------------------------ */

export function About() {
  // Recruiter cut: who I am and what I build with. Career and education
  // paragraphs repeat the Experience and Education blocks, so they are left out.
  const body = [profile.bio[0], profile.bio[3]].filter(Boolean);

  return (
    <Section id="about">
      <SectionHeading title="About" />
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 text-[1.05rem] leading-relaxed">
          {body.map((p, i) => (
            <p key={i} className={i ? "text-ed-muted" : ""} data-reveal style={delay(i)}>
              {p}
            </p>
          ))}
        </div>

        <div className="space-y-4">
          <h3
            className="font-label text-xs font-medium uppercase tracking-[0.18em] text-ed-faint"
            data-reveal
          >
            Education
          </h3>
          {education.map((entry, i) => (
            <article
              key={entry.school}
              className="fx-card rounded-lg p-5"
              data-reveal
              style={delay(i + 1)}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-semibold">{entry.school}</h4>
                <span className="font-label text-xs text-ed-faint">
                  {entry.start} to {entry.end}
                </span>
              </div>
              <p className="mt-1 text-sm text-ed-muted">
                {entry.degree} · GPA{" "}
                <span className="font-medium text-ed-ink">{entry.gpa}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Capabilities                                                        */
/* ------------------------------------------------------------------ */

export function Capabilities() {
  return (
    <Section id="skills">
      <SectionHeading title="Skills" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((group, i) => (
          <div
            key={group.key}
            className="fx-card rounded-lg p-5"
            data-reveal
            style={delay(i % 4)}
          >
            <h3 className="mb-3 text-sm font-semibold">{group.name}</h3>
            <ul className="flex flex-wrap gap-1.5">
              {group.items.slice(0, 8).map((item) => (
                <li key={item}>
                  <Chip>{item}</Chip>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Experience                                                          */
/* ------------------------------------------------------------------ */

const logos: Record<string, string> = {
  sphere: "/images/experiences/sphere.jpeg",
  gupshup: "/images/experiences/gupshup.jpeg",
  "chance-app": "/images/experiences/chance.jpeg",
  netsi: "/images/experiences/netsi.jpeg",
  "neu-ta": "/images/experiences/neu.png",
  ubiwell: "/images/experiences/neu.png",
};

function CompanyMark({ job }: { job: Experience }) {
  const logo = logos[job.slug];
  if (logo) {
    return (
      <Image
        src={logo}
        alt=""
        width={48}
        height={48}
        className="h-11 w-11 shrink-0 rounded border border-ed-line bg-white object-contain"
      />
    );
  }
  return (
    <span
      className="font-display grid h-11 w-11 shrink-0 place-items-center rounded border border-ed-line bg-ed-sunken text-lg text-ed-muted"
      aria-hidden
    >
      {job.company.charAt(0)}
    </span>
  );
}

function ExperienceCard({ job }: { job: Experience }) {
  return (
    <article
      className="fx-card rounded-lg p-6 sm:p-8"
      data-reveal
    >
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="flex items-start gap-4">
            <CompanyMark job={job} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl leading-snug">
                  {job.role}
                </h3>
                {job.current ? (
                  <span className="font-label text-xs text-ed-faint">(current)</span>
                ) : null}
              </div>
              <p className="text-sm text-ed-muted">
                {job.url ? (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline-offset-4 hover:text-ed-ink hover:underline"
                  >
                    {job.company}
                  </a>
                ) : (
                  job.company
                )}{" "}
                · {job.location}
              </p>
              <p className="font-label mt-0.5 text-xs text-ed-faint">
                {job.start} to {job.end}
              </p>
            </div>
          </div>

          <p className="mt-6 leading-relaxed">{job.summary}</p>
          <ul className="mt-4 space-y-2.5">
            {job.highlights.slice(0, 3).map((h) => (
              <li
                key={h}
                className="flex gap-3 text-sm leading-relaxed text-ed-muted"
              >
                <span className="shrink-0 text-ed-faint" aria-hidden>
                  –
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Stack">
            {job.stack.map((tech) => (
              <li key={tech}>
                <Chip>{tech}</Chip>
              </li>
            ))}
          </ul>
        </div>

        {job.metrics?.length ? (
          <dl className="content-start self-start divide-y divide-ed-line border-y border-ed-line text-sm lg:border-l lg:border-y-0 lg:pl-6">
            {job.metrics.map((m) => (
              <div key={m.label} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-ed-muted">{m.label}</dt>
                <dd className="font-semibold tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </article>
  );
}

export function ExperienceSection() {
  return (
    <Section id="experience">
      <SectionHeading title="Experience" />
      <div className="space-y-4">
        {experience.map((job) => (
          <ExperienceCard key={job.slug} job={job} />
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

const areaStyle: Record<ProjectArea, string> = {
  "Distributed systems": "text-ed-muted",
  "Low-level": "text-ed-muted",
  "AI / ML": "text-ed-muted",
  Product: "text-ed-muted",
};

function ProjectCard({
  project,
  index,
  area,
}: {
  project: Project;
  index: number;
  area: ProjectArea;
}) {
  return (
    <article
      className="fx-card flex flex-col rounded-lg p-6"
      data-reveal
      style={delay(index % 3)}
    >
      <div className="font-label mb-4 flex items-center justify-between text-xs text-ed-faint">
        <span
          className={`uppercase tracking-wide ${areaStyle[area]}`}
        >
          {area}
        </span>
        <span className="truncate pl-3">
          {project.year} · {project.stack[0]}
        </span>
      </div>
      <h3 className="font-display text-xl leading-snug">{project.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ed-muted">
        {project.tagline}
      </p>

      <p className="mt-4 text-[13px] leading-relaxed">{project.highlights[0]}</p>

      <MoreDetail>
        {project.description.map((d) => (
          <p key={d}>{d}</p>
        ))}
        <ul className="space-y-2">
          {project.highlights.slice(1).map((h) => (
            <li key={h} className="flex gap-2.5">
              <span className="shrink-0 text-ed-faint" aria-hidden>
                –
              </span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </MoreDetail>

      <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Stack">
        {project.stack.map((tech) => (
          <li key={tech}>
            <Chip>{tech}</Chip>
          </li>
        ))}
      </ul>

      {project.demo || project.github ? (
        <div className="mt-auto flex flex-wrap gap-5 pt-6">
          {project.demo ? (
            <TextLink href={project.demo}>Live demo</TextLink>
          ) : null}
          {project.github ? (
            <TextLink href={project.github}>Source</TextLink>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function ProjectsSection() {
  // Gallery order comes from `showcase`; the home page shows only the top few per area.
  const perArea: Record<ProjectArea, number> = {
    "Distributed systems": 3,
    "Low-level": 1,
    "AI / ML": 2,
    Product: 2,
  };
  const taken: Partial<Record<ProjectArea, number>> = {};
  const featured = showcase.flatMap(({ slug, area }) => {
    const project = projects.find((p) => p.slug === slug);
    const n = taken[area] ?? 0;
    if (!project || n >= perArea[area]) return [];
    taken[area] = n + 1;
    return [{ project, area }];
  });

  return (
    <Section id="projects">
      <SectionHeading title="Selected projects" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featured.map(({ project, area }, i) => (
          <ProjectCard key={project.slug} project={project} area={area} index={i} />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-6" data-reveal>
        <TextLink href="/projects">All projects</TextLink>
        <TextLink href={links.github}>More on GitHub</TextLink>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Writing (deep dives)                                                */
/* ------------------------------------------------------------------ */

/**
 * Pinned "dive": the blueprint backdrop zooms in as you scroll, the title fades
 * away, and the write-ups rise into view together. FxRuntime drives it
 * ([data-dive]); on small screens, with reduced motion or without JS it is a
 * normal section with every card visible.
 */
export function Writing() {
  return (
    <section id="writing">
      <div data-dive className="dive relative isolate">
        <div data-dive-pin className="dive-pin relative">
          <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
            <div data-dive-bg className="dive-bg absolute inset-0">
              <BlueprintBackdrop />
            </div>
            <div data-dive-shade className="dive-shade absolute inset-0" />
          </div>

          <div
            data-dive-intro
            className="dive-intro mx-auto w-full max-w-6xl px-4 pt-20 text-center sm:px-6 sm:pt-24"
          >
            <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
              Writing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70">
              Longer write-ups on consensus, event-driven pipelines, database
              concurrency, routing and applied ML.
            </p>
            <p className="dive-hint font-label mt-10 text-[11px] uppercase tracking-[0.2em] text-white/45">
              Scroll ↓
            </p>
          </div>

          <div
            data-dive-cards
            className="dive-cards mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              {articles.map((article, i) => (
                <Link
                  key={article.slug}
                  href={`/writing/${article.slug}`}
                  className={`dive-card group/dive relative flex flex-col rounded-lg p-6 ${
                    i < 3 ? "lg:col-span-2" : "lg:col-span-3"
                  }`}
                >
                  <div className="font-label flex items-center justify-between gap-4 text-[11px]">
                    <span className="uppercase tracking-wide text-white/55">
                      {article.category}
                    </span>
                    <span className="text-white/45">{readMinutes(article)} min read</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold leading-snug text-white">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">
                    {article.dek}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-[#9cc3ff]">
                    Read
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover/dive:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Research                                                            */
/* ------------------------------------------------------------------ */

export function Research() {
  return (
    <Section id="research">
      <SectionHeading title="Publications" />
      <ol className="grid gap-4 md:grid-cols-2">
        {publications.map((pub, i) => (
          <li
            key={pub.title}
            className="fx-card rounded-lg p-5"
            data-reveal
            style={delay(i % 2)}
          >
            <p className="font-label text-xs text-ed-faint">
              <span className="font-semibold text-ed-muted">{pub.year}</span>{" "}
              · {pub.venue}
            </p>
            <h3 className="mt-2 text-base font-semibold leading-snug">
              {pub.title}
            </h3>
            {pub.note ? (
              <p className="mt-3 text-sm text-ed-muted">{pub.note}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact + footer                                                    */
/* ------------------------------------------------------------------ */

export function Contact() {
  return (
    <section id="contact">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div
          className="fx-card relative overflow-hidden rounded-lg p-6 sm:p-10"
          data-tilt="off"
          data-reveal
        >
          {/* Decorative glows, hidden in the corporate theme. */}
          <span
            aria-hidden
            data-parallax="0.25"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 hidden rounded-full bg-[var(--c1)] opacity-30 blur-[100px]"
          />
          <span
            aria-hidden
            data-parallax="-0.2"
            className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 hidden rounded-full bg-[var(--c2)] opacity-20 blur-[100px]"
          />

          <h2 className="font-display relative text-2xl leading-tight sm:text-3xl">
            Contact
          </h2>
          <p className="relative mt-3 max-w-xl text-ed-muted">
            {profile.availability}
          </p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <a
              href={links.email}
             
              className="fx-btn-primary rounded-md px-6 py-3 text-sm font-semibold"
            >
              Email me
            </a>
            <a
              href={links.resume}
              target="_blank"
              rel="noreferrer"
             
              className="fx-btn-ghost rounded-md px-6 py-3 text-sm font-medium"
            >
              Download resume
            </a>
            <a
              href="/contact"
             
              className="fx-btn-ghost rounded-md px-6 py-3 text-sm font-medium"
            >
              Send a message
            </a>
          </div>
          <dl className="relative mt-10 grid gap-6 border-t border-ed-line pt-8 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-label text-xs text-ed-faint">Location</dt>
              <dd className="mt-1">{profile.location}</dd>
            </div>
            <div>
              <dt className="font-label text-xs text-ed-faint">Email</dt>
              <dd className="mt-1 break-all">
                <a
                  href={links.email}
                  className="transition-colors hover:text-[var(--c2)]"
                >
                  {profile.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-label text-xs text-ed-faint">Elsewhere</dt>
              <dd className="mt-1 flex gap-4">
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-[var(--c2)]"
                >
                  GitHub
                </a>
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-[var(--c2)]"
                >
                  LinkedIn
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter({ children }: { children?: React.ReactNode }) {
  return (
    <footer className="relative border-t border-ed-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 pb-24 text-sm text-ed-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-8">
        <p>
          © {new Date().getFullYear()} {profile.name} ·{" "}
          {profile.location.split(",")[0]}
        </p>
        {children}
      </div>
    </footer>
  );
}
