# darshpandya.com

A terminal-style portfolio. The landing page is a working shell — visitors type
`whoami`, `cat projects.md` or `ssh darsh@portfolio` instead of clicking nav
links — and every command has a matching real page for people who'd rather just
click (and for search engines).

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · JetBrains Mono. No CMS, no
database for content.

## Layout

```
lib/content.ts            Every piece of portfolio content. Single source of truth.
lib/terminal/fs.ts        Virtual filesystem (~/about.md, ~/projects/*.md, …).
lib/terminal/commands.tsx Command registry + dispatch + tab completion.
lib/terminal/themes.ts    Colour schemes and the pre-paint theme boot script.
lib/seo.ts                Per-page metadata helper.

components/terminal/
  Terminal.tsx            The shell: input, history, completion, key handling.
  docs.tsx                Document renderers, shared by the terminal AND the pages.
  atoms.tsx               Small presentational pieces (Line, Field, Chip, Ascii…).
components/ui/            Window chrome, page shell, the prompt at the bottom of pages.
```

The important idea: `components/terminal/docs.tsx` renders each document once.
`cat about.md` in the terminal and `/about` as a page both call `<AboutDoc />`,
so the two can't drift apart.

## Editing content

Everything lives in `lib/content.ts` — profile, experience, projects, skills,
publications, education, links. Adding a project to the `projects` array gives
you, for free:

- an entry in `cat projects.md`
- a file at `~/projects/<slug>.md` that `cat`, `ls`, `tree` and tab completion see
- a static page at `/projects/<slug>`
- a sitemap entry
- coverage in `grep`

## Commands

`help` lists them. Beyond the obvious (`ls`, `cd`, `cat`, `pwd`, `tree`, `clear`,
`history`, `man`, `grep`, `find`) there's `whoami`, `ssh darsh@portfolio`,
`neofetch`, `git log`, `theme <name>`, `open <page>`, and a handful of things
that aren't in `help`.

## Themes

Seven palettes (`midnight`, `matrix`, `amber`, `dracula`, `nord`, `solarized`,
`paper`), set via `theme <name>` or the footer picker, persisted in
localStorage, applied before first paint to avoid a flash.

Palette colours are defined as RGB channel triplets (`--t-green-rgb: 74 222 128`)
so Tailwind opacity modifiers like `bg-term-green/20` actually work. Adding a
theme means adding one block to `app/globals.css` and one entry to
`lib/terminal/themes.ts`.

## Accessibility

The terminal is a client component, so `app/page.tsx` also renders a visually
hidden plain-text mirror of the full portfolio for crawlers and screen readers.
Every terminal route exists as a real, statically rendered page. Boot animation
and cursor blink respect `prefers-reduced-motion`.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

Only the contact form needs environment variables — see `.env.sample`. Without
them the rest of the site works fine; the form just reports a failure to send.

| Variable | Purpose |
| --- | --- |
| `DB_URL`, `DB_NAME` | MongoDB, stores contact form submissions |
| `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` | SMTP for the notification email |
| `G_TAG`, `CLARITY_KEY` | Optional analytics; omit to skip loading them |
