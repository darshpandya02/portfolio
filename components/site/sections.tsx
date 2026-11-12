import Image from "next/image";
import type { CSSProperties } from "react";

import WordRotator from "@/components/site/WordRotator";
import {
  education,
  experience,
  journey,
  links,
  principles,
  profile,
  projects,
  publications,
  skills,
  type Experience,
  type Project,
} from "@/lib/content";

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** Stagger index for [data-reveal]; FxRuntime multiplies it into a delay. */
const delay = (d: number) => ({ "--d": d }) as CSSProperties;

/** `title` may contain one "|": the text after it is drawn in the animated gradient. */
function SectionHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  const [plain, glow] = title.split("|");
  return (
    <div className="mb-12 max-w-3xl sm:mb-14" data-reveal>
      <p className="font-label fx-eyebrow mb-4 text-xs font-medium uppercase tracking-[0.18em] text-ed-muted">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-[1.05] sm:text-[3.25rem]">
        {plain}
        {glow ? <span className="fx-gradient-text">{glow}</span> : null}
      </h2>
      {lede ? (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ed-muted sm:text-lg">
          {lede}
        </p>
      ) : null}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label fx-chip inline-flex items-center rounded-full border border-ed-line bg-ed-surface px-2.5 py-1 text-[11px] text-ed-muted">
      {children}
    </span>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id}>
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
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
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[var(--c1)] to-[var(--c2)] transition-transform duration-300 group-hover/link:scale-x-100"
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

/** Renders "+15%" as "+", a count-up "15", and "%". Non-numeric values render as-is. */
function MetricValue({ value }: { value: string }) {
  const m = value.match(/^([+−-]?)(\d+)(.*)$/);
  if (!m) return <>{value}</>;
  return (
    <>
      {m[1]}
      <span data-count={m[2]}>{m[2]}</span>
      {m[3]}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const heroWords = [
  "distributed systems",
  "backend services",
  "message pipelines",
  "research infrastructure",
];

export function Hero() {
  const current = experience.find((job) => job.current) ?? experience[0];
  const city = profile.location.split(",")[0];
  const ms = education[0];

  return (
    <section
      id="home"
      className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-24"
    >
      <div className="grid items-center gap-16 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
        <div data-hero-out="0.18">
          <p
            data-reveal
            style={delay(0)}
            className="font-label mb-8 inline-flex items-center gap-2.5 rounded-full border border-ed-line bg-ed-surface px-3.5 py-1.5 text-xs text-ed-muted"
          >
            <span
              className="fx-pulse h-2 w-2 rounded-full bg-[var(--c2)]"
              aria-hidden
            />
            {city}, MA · {current.role} @ SPHERE
          </p>

          <h1 className="font-display text-[3.4rem] leading-[0.98] sm:text-[5.5rem]">
            <span
              className="block text-2xl font-normal tracking-normal text-ed-muted sm:text-3xl"
              data-reveal
              style={delay(1)}
            >
              Hi, I&apos;m
            </span>
            <span className="relative mt-2 block" aria-label={profile.name}>
              {profile.name.split("").map((ch, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="fx-letter"
                  style={{ "--i": i } as CSSProperties}
                >
                  {ch === " " ? " " : ch}
                </span>
              ))}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-x-6 -bottom-4 top-1/2 -z-10 rounded-full bg-gradient-to-r from-[var(--c1)] via-[var(--c2)] to-[var(--c3)] opacity-25 blur-3xl"
              />
            </span>
          </h1>

          <p
            className="mt-8 max-w-xl text-xl leading-snug sm:text-2xl"
            data-reveal
            style={delay(4)}
          >
            I build <WordRotator words={heroWords} />
            <br />
            that keep working under their own load.
          </p>
          <p
            className="mt-5 max-w-xl leading-relaxed text-ed-muted"
            data-reveal
            style={delay(5)}
          >
            Right now that means research infrastructure for reproducible
            cybersecurity experiments. Before that: messaging pipelines at
            Gupshup, research data platforms at Northeastern, and a consumer app
            in Mumbai.
          </p>

          <ul
            className="mt-8 flex flex-wrap gap-2"
            aria-label="Focus areas"
            data-reveal
            style={delay(6)}
          >
            {profile.interests.slice(0, 4).map((interest) => (
              <li key={interest}>
                <Chip>{interest}</Chip>
              </li>
            ))}
          </ul>

          <div
            className="mt-10 flex flex-wrap items-center gap-3"
            data-reveal
            style={delay(7)}
          >
            <a
              href="#projects"
              data-magnetic
              className="fx-btn-primary rounded-full px-6 py-3 text-sm font-semibold"
            >
              View work
            </a>
            <a
              href="#contact"
              data-magnetic
              className="fx-btn-ghost rounded-full px-6 py-3 text-sm font-medium"
            >
              Get in touch
            </a>
            <span
              className="mx-1 hidden h-5 w-px bg-ed-line sm:block"
              aria-hidden
            />
            <div className="flex w-full gap-5 pt-1 sm:w-auto sm:pt-0">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer noopener"
                  className="text-sm text-ed-muted transition-colors hover:text-ed-ink"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Photo: drifts slower than the text as the hero scrolls away. */}
        <div
          data-hero-out="0.05"
          className="mx-auto w-full max-w-[22rem] lg:max-w-none"
        >
          <div
            data-reveal
            style={delay(3)}
            className="relative mx-auto w-[78%] max-w-[23rem] sm:w-[70%] lg:w-[86%]"
          >
            <div className="fx-photo-ring">
              <Image
                src={profile.avatar}
                alt={profile.avatarAlt}
                width={560}
                height={560}
                priority
                sizes="(min-width: 1024px) 360px, 70vw"
                className="aspect-square w-full rounded-[2.1rem] object-cover"
              />
            </div>

            <div
              className="fx-float absolute -left-6 top-[12%] rounded-2xl border border-ed-line bg-[var(--ed-surface-solid)] px-3.5 py-2.5 shadow-[0_16px_40px_-16px_var(--glow)] sm:-left-12"
              style={{ "--fd": "0s" } as CSSProperties}
            >
              <p className="font-display fx-gradient-text text-xl leading-none">
                {ms.gpa.split(" ")[0]}
              </p>
              <p className="font-label mt-1 text-[10px] uppercase tracking-wider text-ed-muted">
                M.S. GPA
              </p>
            </div>
            <div
              className="fx-float absolute -right-4 top-[48%] rounded-2xl border border-ed-line bg-[var(--ed-surface-solid)] px-3.5 py-2.5 shadow-[0_16px_40px_-16px_var(--glow)] sm:-right-10"
              style={{ "--fd": "-2s" } as CSSProperties}
            >
              <p className="font-display fx-gradient-text text-xl leading-none">
                ACSAC &apos;26
              </p>
              <p className="font-label mt-1 text-[10px] uppercase tracking-wider text-ed-muted">
                Co-author
              </p>
            </div>
            <div
              className="fx-float absolute -bottom-5 left-[14%] flex items-center gap-2 rounded-full border border-ed-line bg-[var(--ed-surface-solid)] px-3.5 py-2 shadow-[0_16px_40px_-16px_var(--glow)]"
              style={{ "--fd": "-4s" } as CSSProperties}
            >
              <span
                className="fx-pulse h-2 w-2 rounded-full bg-[var(--ed-good)]"
                aria-hidden
              />
              <span className="font-label text-[11px] text-ed-muted">
                Open to conversations
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Journey() {
  return (
    <div className="fx-card rounded-3xl p-6 sm:p-8" data-reveal>
      <h3 className="font-label mb-7 text-xs font-medium uppercase tracking-[0.18em] text-ed-faint">
        Journey
      </h3>
      <ol className="relative space-y-6 pl-7">
        <span className="fx-line" aria-hidden />
        {journey.map((step, i) => {
          const last = i === journey.length - 1;
          return (
            <li key={step.year + step.title} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[33px] top-1.5 h-2.5 w-2.5 rounded-full ${
                  last
                    ? "fx-pulse bg-[var(--c2)]"
                    : "border border-ed-line bg-[var(--ed-surface-solid)]"
                }`}
              />
              <div className="flex items-baseline gap-4">
                <span
                  className={`font-label w-10 shrink-0 text-xs ${last ? "fx-gradient-text font-semibold" : "text-ed-faint"}`}
                >
                  {step.year}
                </span>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="text-sm text-ed-muted">{step.detail}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
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
  // The last bio paragraph (hobbies) reads better as a short aside than as body copy.
  const body = profile.bio.slice(0, -1);
  const aside = profile.bio[profile.bio.length - 1];

  return (
    <Section id="about">
      <SectionHeading
        eyebrow="About"
        title="Backend engineer, |measured in uptime and numbers."
      />
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 text-[1.05rem] leading-relaxed">
          <p
            className="font-display text-2xl leading-snug sm:text-[1.7rem]"
            data-scrub-text
          >
            {body[0]}
          </p>
          {body.slice(1).map((p, i) => (
            <p key={i} className="text-ed-muted" data-reveal style={delay(i)}>
              {p}
            </p>
          ))}
          <p
            className="border-l-2 border-[var(--c3)] pl-4 text-sm italic text-ed-muted"
            data-reveal
            style={delay(body.length)}
          >
            {aside}
          </p>
        </div>

        <div className="space-y-4">
          <Journey />
          <h3
            className="font-label pt-4 text-xs font-medium uppercase tracking-[0.18em] text-ed-faint"
            data-reveal
          >
            Education
          </h3>
          {education.map((entry, i) => (
            <article
              key={entry.school}
              className="fx-card rounded-3xl p-6"
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
                <span className="fx-gradient-text font-semibold">
                  {entry.gpa}
                </span>
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {entry.coursework.map((course) => (
                  <li key={course}>
                    <Chip>{course}</Chip>
                  </li>
                ))}
              </ul>
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
      <SectionHeading
        eyebrow="Capabilities"
        title="Boring, observable systems |over clever ones."
        lede="How I usually work, and the tools I reach for."
      />

      <ol className="mb-14 grid gap-4 md:grid-cols-3">
        {principles.map((step, i) => (
          <li
            key={step.title}
            className="fx-card rounded-3xl p-7"
            data-reveal
            style={delay(i)}
          >
            <span
              className="font-display fx-gradient-text inline-block text-5xl"
              data-parallax={0.06 + i * 0.03}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display mt-5 text-xl">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ed-muted">
              {step.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((group, i) => (
          <div
            key={group.key}
            className="fx-card rounded-3xl p-5"
            data-reveal
            style={delay(i % 4)}
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span
                className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[var(--c1)] to-[var(--c2)]"
                aria-hidden
              />
              {group.name}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
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
        className="h-12 w-12 shrink-0 rounded-2xl border border-ed-line bg-white object-contain"
      />
    );
  }
  return (
    <span
      className="font-display grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--c1)] to-[var(--c2)] text-lg text-white"
      aria-hidden
    >
      {job.company.charAt(0)}
    </span>
  );
}

function ExperienceCard({ job }: { job: Experience }) {
  return (
    <article
      className="fx-card rounded-3xl p-6 shadow-[0_-20px_60px_-30px_rgb(0_0_0/0.6)] sm:p-9"
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
                  <span className="font-label flex items-center gap-1.5 rounded-full border border-ed-line bg-ed-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-[var(--c2)]">
                    <span
                      className="fx-pulse h-1.5 w-1.5 rounded-full bg-[var(--c2)]"
                      aria-hidden
                    />
                    Current
                  </span>
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
            {job.highlights.map((h) => (
              <li
                key={h}
                className="flex gap-3 text-sm leading-relaxed text-ed-muted"
              >
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--c2)]"
                  aria-hidden
                />
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
          <dl className="grid content-start gap-3 self-start">
            {job.metrics.map((m) => (
              <div
                key={m.label}
                className="relative overflow-hidden rounded-2xl border border-ed-line bg-ed-sunken px-5 py-4"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[var(--c1)] via-[var(--c2)] to-[var(--c3)]"
                />
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="font-display fx-gradient-text block text-3xl tabular-nums">
                    <MetricValue value={m.value} />
                  </span>
                  <span className="text-xs text-ed-muted">{m.label}</span>
                </dd>
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
      <SectionHeading
        eyebrow="Experience"
        title="Built in production. |Kept up in research."
        lede="Reverse chronological. The numbers on the right come straight from the work on the left."
      />
      {/* Each card pins under the header and the next one slides over it. */}
      <div data-stack-group>
        {experience.map((job) => (
          <div key={job.slug} data-stack className="z-10">
            <div className="relative rounded-3xl">
              <ExperienceCard job={job} />
              <span data-stack-shade aria-hidden />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article
      className="fx-card flex flex-col rounded-3xl p-6"
      data-reveal
      data-hscroll-item
      style={delay(index % 3)}
    >
      <div className="font-label mb-4 flex items-center justify-between text-xs text-ed-faint">
        <span className="rounded-full border border-ed-line px-2 py-0.5">
          {project.year}
        </span>
        <span className="truncate pl-3">
          {project.stack.slice(0, 2).join(" · ")}
        </span>
      </div>
      <h3 className="font-display text-2xl leading-snug">{project.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ed-muted">
        {project.tagline}
      </p>

      <p className="relative mt-5 overflow-hidden rounded-2xl border border-ed-line bg-ed-sunken px-4 py-3.5 text-[13px] leading-relaxed">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[var(--c1)] to-[var(--c2)]"
        />
        {project.highlights[0]}
      </p>

      <details className="group mt-3">
        <summary className="cursor-pointer list-none text-sm text-ed-muted transition-colors hover:text-ed-ink [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">More detail +</span>
          <span className="hidden group-open:inline">Less detail −</span>
        </summary>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ed-muted">
          {project.description.map((d) => (
            <p key={d}>{d}</p>
          ))}
          <ul className="space-y-2">
            {project.highlights.slice(1).map((h) => (
              <li key={h} className="flex gap-2.5">
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--c2)]"
                  aria-hidden
                />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>

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
  const featured = projects.filter((p) => p.featured);
  const archive = projects.filter((p) => !p.featured);

  return (
    <section id="projects">
      {/* On desktop this block pins and vertical scroll moves the track sideways.
          FxRuntime sizes it; below lg it stays a plain grid. */}
      <div data-hscroll className="relative">
        <div data-hscroll-pin>
          <div className="mx-auto w-full max-w-6xl px-4 pt-24 sm:px-6 sm:pt-32 lg:pt-0">
            <div
              data-hscroll-track
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              <div data-hscroll-intro className="md:col-span-2 lg:col-span-3">
                <SectionHeading
                  eyebrow="Projects"
                  title="Things I built, |with the numbers to back them."
                  lede="Most are live. Each card leads with its headline measurement. Keep scrolling to move through them."
                />
              </div>
              {featured.map((project, i) => (
                <ProjectCard key={project.slug} project={project} index={i} />
              ))}
            </div>
          </div>
          <div className="hs-only mx-auto mt-8 w-full max-w-6xl items-center gap-4 px-6">
            <span
              data-hscroll-counter
              className="font-label w-16 text-xs tabular-nums text-ed-muted"
            >
              01 / {String(featured.length).padStart(2, "0")}
            </span>
            <span className="relative h-px flex-1 overflow-hidden bg-ed-line">
              <span className="hs-bar absolute inset-0 bg-gradient-to-r from-[var(--c1)] via-[var(--c2)] to-[var(--c3)]" />
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 sm:pb-32">
        <div className="mt-8 lg:mt-24" data-reveal>
          <h3 className="font-label fx-eyebrow mb-5 text-xs font-medium uppercase tracking-[0.18em] text-ed-faint">
            Project archive
          </h3>
          <ul
            className="fx-card divide-y divide-ed-line overflow-hidden rounded-3xl"
            data-tilt="off"
          >
            {archive.map((project) => (
              <li
                key={project.slug}
                className="group/row flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-ed-accent-soft sm:flex-row sm:items-center sm:gap-6"
              >
                <span className="font-label w-12 shrink-0 text-xs text-ed-faint">
                  {project.year}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium transition-transform duration-300 group-hover/row:translate-x-1">
                    {project.name}
                  </p>
                  <p className="text-sm text-ed-muted">{project.tagline}</p>
                </div>
                <div className="flex shrink-0 gap-5">
                  {project.demo ? (
                    <TextLink href={project.demo}>Demo</TextLink>
                  ) : null}
                  {project.github ? (
                    <TextLink href={project.github}>Code</TextLink>
                  ) : null}
                </div>
              </li>
            ))}
            <li className="px-6 py-4">
              <TextLink href={links.github}>More on GitHub</TextLink>
            </li>
          </ul>
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
      <SectionHeading
        eyebrow="Research"
        title="Where the deeper work |is written down."
      />
      <ol className="grid gap-4 md:grid-cols-2">
        {publications.map((pub, i) => (
          <li
            key={pub.title}
            className="fx-card rounded-3xl p-7"
            data-reveal
            style={delay(i % 2)}
          >
            <p className="font-label text-xs text-ed-faint">
              <span className="fx-gradient-text font-semibold">{pub.year}</span>{" "}
              · {pub.venue}
            </p>
            <h3 className="font-display mt-4 text-xl leading-snug">
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
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div
          className="fx-card relative overflow-hidden rounded-[2rem] p-8 sm:p-16"
          data-tilt="off"
          data-reveal
        >
          {/* Local aurora so the closing card glows on its own. */}
          <span
            aria-hidden
            data-parallax="0.25"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--c1)] opacity-30 blur-[100px]"
          />
          <span
            aria-hidden
            data-parallax="-0.2"
            className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[var(--c2)] opacity-20 blur-[100px]"
          />

          <p className="font-label fx-eyebrow relative mb-4 text-xs font-medium uppercase tracking-[0.18em] text-ed-muted">
            Contact
          </p>
          <h2 className="font-display relative max-w-3xl text-5xl leading-[1] sm:text-7xl">
            Let&apos;s build something{" "}
            <span className="fx-gradient-text">reliable.</span>
          </h2>
          <p className="relative mt-6 max-w-xl text-ed-muted">
            {profile.availability}
          </p>
          <div className="relative mt-10 flex flex-wrap gap-3">
            <a
              href={links.email}
              data-magnetic
              className="fx-btn-primary rounded-full px-6 py-3 text-sm font-semibold"
            >
              Email me
            </a>
            <a
              href={links.resume}
              target="_blank"
              rel="noreferrer"
              data-magnetic
              className="fx-btn-ghost rounded-full px-6 py-3 text-sm font-medium"
            >
              Download resume
            </a>
            <a
              href="/contact"
              data-magnetic
              className="fx-btn-ghost rounded-full px-6 py-3 text-sm font-medium"
            >
              Send a message
            </a>
          </div>
          <dl className="relative mt-14 grid gap-6 border-t border-ed-line pt-8 text-sm sm:grid-cols-3">
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
