"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { GameEngine, type Fonts, type ModalRequest, type Progress, type Prompt, type Stats } from "@/lib/game/engine";
import { contactLinks, GY, HALL, MACHINE, MALL, playerName, secrets, TOWER, TOWER_ROOF, towerSpecs } from "@/lib/game/world";

const STORE = "dp-play-v1";

interface Saved extends Partial<Progress> {
  tutorialSeen?: boolean;
  sound?: boolean;
}

function load(): Saved {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? "{}") as Saved;
  } catch {
    return {};
  }
}

function save(patch: Saved) {
  try {
    localStorage.setItem(STORE, JSON.stringify({ ...load(), ...patch }));
  } catch {
    /* private mode: progress just won't persist */
  }
}

interface Slide {
  tag: string;
  title: string;
  color: string;
  body: string;
  keys: [string, string][];
  cam: { x: number; y: number; zoom: number };
  pose: { x: number; y: number; mode?: "walk" | "super"; bow?: boolean };
}

const slides: Slide[] = [
  {
    tag: "WELCOME",
    title: "THE CITY",
    color: "#5ff3ff",
    body: "This is my portfolio, built as a little city. Every booth in the mall is one of my projects: walk up to one and press E to open it.",
    keys: [
      ["A/D", "move"],
      ["Space", "jump"],
      ["E", "use"],
      ["Q", "carry sign"],
    ],
    cam: { x: MALL.boothStart + 260, y: GY - 200, zoom: 1.25 },
    pose: { x: MALL.boothStart + 330, y: GY },
  },
  {
    tag: "SKILLS",
    title: "THE ARCHERY HALL",
    color: "#ffd66b",
    body: "My skills hang from the ceiling of the archery hall. Hold the mouse to draw the bow, aim, let go: every rope you hit drops a skill into your collection.",
    keys: [["Mouse", "hold, aim, release"]],
    cam: { x: HALL.x1 + 420, y: GY - 190, zoom: 1.15 },
    pose: { x: HALL.x1 + 300, y: GY, bow: true },
  },
  {
    tag: "CAREER",
    title: "THE CAREER TOWER",
    color: "#c4a5ff",
    body: "Ride the tower's lift and every job I've had goes past, oldest at the bottom. Press E on a floor for the full story. Something strange is waiting on the roof.",
    keys: [
      ["W/S", "ride the lift"],
      ["E", "read a floor"],
    ],
    cam: { x: TOWER.liftX + 55, y: GY - 230, zoom: 1.0 },
    pose: { x: TOWER.liftX + 55, y: GY },
  },
  {
    tag: "SUPER MODE",
    title: "THE MACHINE",
    color: "#ff5fa8",
    body: "Climb into the machine on the roof. Then you can fly, fire a laser, rip chunks out of the downtown towers and throw them. Not very recruiter-friendly.",
    keys: [
      ["WASD", "fly"],
      ["Shift", "rocket"],
      ["Mouse", "laser"],
      ["F", "grab & throw"],
    ],
    cam: { x: MACHINE.x - 140, y: TOWER_ROOF - 110, zoom: 1.2 },
    pose: { x: MACHINE.x - 230, y: TOWER_ROOF - 80, mode: "super" },
  },
  {
    tag: "ONE MORE THING",
    title: "FIND THE SECRETS",
    color: "#5ff36b",
    body: "Eggs are sealed inside the downtown towers, and somewhere under campus a secret lab is hiding behind a locked elevator. How many can you find? The end report keeps score.",
    keys: [],
    cam: { x: towerSpecs[1].x + 60, y: GY - 230, zoom: 1.0 },
    pose: { x: towerSpecs[0].x - 70, y: GY },
  },
];

interface Toast {
  id: number;
  title: string;
  body?: string;
}

export default function CityGame({ fonts }: { fonts: Fonts }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalRequest | null>(null);
  const [tutorial, setTutorial] = useState<number | null>(null);
  const [sound, setSound] = useState(true);
  const [touch, setTouch] = useState(false);
  const toastId = useRef(0);
  const slideRef = useRef<number | null>(null);
  slideRef.current = tutorial;

  const pushToast = useCallback((title: string, body?: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, title, body }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const leave = useCallback(() => router.push("/"), [router]);

  /* ---------------------------------------------------------- engine */
  useEffect(() => {
    const saved = load();
    const engine = new GameEngine(
      {
        toast: pushToast,
        modal: (m) => setModal(m),
        prompts: setPrompts,
        stats: setStats,
        link: (which) => window.open(which === "github" ? contactLinks.github : contactLinks.linkedin, "_blank", "noopener"),
        copy: (text) => {
          navigator.clipboard?.writeText(text).then(
            () => pushToast("Email copied", text),
            () => pushToast("My email", text),
          );
        },
        progress: (p) => save(p),
      },
      fonts,
      saved,
    );
    engine.sfx.enabled = saved.sound ?? true;
    setSound(engine.sfx.enabled);
    engine.loadImages();
    engineRef.current = engine;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __game: GameEngine }).__game = engine;
    setStats(engine.stats());
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    if (!saved.tutorialSeen) setTutorial(0);

    for (const f of [fonts.pixel, fonts.display, fonts.mono]) {
      document.fonts?.load(`700 20px ${f}`).catch(() => undefined);
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      engine.resize(canvas.width, canvas.height);
      engine.camX = Math.max(0, engine.p.x - engine.viewW / 2);
      engine.camY = GY - engine.viewH * 0.815;
    };
    fit();
    window.addEventListener("resize", fit);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      engine.update(dt);
      engine.render(ctx);
      const slide = slideRef.current;
      const pc = previewRef.current;
      if (slide !== null && pc) {
        const pctx = pc.getContext("2d");
        if (pctx) {
          const s = slides[slide];
          engine.renderPreview(pctx, pc.width, pc.height, s.cam, s.pose);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      engine.sfx.laser(false);
    };
  }, [fonts, pushToast]);

  /* Pause the world whenever a card is open. */
  const overlayOpen = modal !== null || tutorial !== null;
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.paused = overlayOpen;
      if (overlayOpen) {
        engineRef.current.keys.clear();
        engineRef.current.mouse.down = false;
      }
    }
  }, [overlayOpen]);

  const toggleSound = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    e.sfx.enabled = !e.sfx.enabled;
    if (!e.sfx.enabled) e.sfx.laser(false);
    setSound(e.sfx.enabled);
    save({ sound: e.sfx.enabled });
  }, []);

  const closeTutorial = useCallback(() => {
    setTutorial(null);
    save({ tutorialSeen: true });
    engineRef.current?.sfx.unlock();
  }, []);

  const exit = useCallback(() => {
    if (modal?.kind === "report") leave();
    else setModal({ kind: "report" });
  }, [leave, modal]);

  /* ---------------------------------------------------------- keyboard */
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if (k === "escape") {
        e.preventDefault();
        if (tutorial !== null) closeTutorial();
        else if (modal && modal.kind !== "report") setModal(null);
        else exit();
        return;
      }
      if (tutorial !== null) {
        if (k === "arrowright" || k === "enter" || k === " ") {
          e.preventDefault();
          if (tutorial < slides.length - 1) setTutorial(tutorial + 1);
          else closeTutorial();
        } else if (k === "arrowleft" && tutorial > 0) setTutorial(tutorial - 1);
        return;
      }
      if (modal) {
        if (k === "e" || k === "enter") {
          e.preventDefault();
          setModal(null);
        }
        return;
      }
      if (k === "m") toggleSound();
      if (k === "h" || k === "?") setTutorial(0);
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
      engineRef.current?.keyDown(k === " " ? " " : k);
    };
    const onUp = (e: KeyboardEvent) => engineRef.current?.keyUp(e.key.toLowerCase() === " " ? " " : e.key.toLowerCase());
    const onBlur = () => engineRef.current?.keys.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [tutorial, modal, closeTutorial, exit, toggleSound]);

  /* ---------------------------------------------------------- pointer */
  const setMouse = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const eng = engineRef.current;
    const c = canvasRef.current;
    if (!eng || !c) return;
    const r = c.getBoundingClientRect();
    eng.mouse.x = ((e.clientX - r.left) / r.width) * c.width;
    eng.mouse.y = ((e.clientY - r.top) / r.height) * c.height;
  };

  const press = (key: string, on: boolean) => {
    const eng = engineRef.current;
    if (!eng) return;
    if (on) eng.keyDown(key);
    else eng.keyUp(key);
  };

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-[#0a0f2c] text-[#e9ecff]" style={{ fontFamily: fonts.display }}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        aria-label="A playable pixel city. Walk through it to explore Darsh's projects, skills and career."
        onPointerDown={(e) => {
          setMouse(e);
          const eng = engineRef.current;
          if (!eng) return;
          eng.sfx.unlock();
          eng.mouse.down = true;
          eng.mouse.justDown = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={setMouse}
        onPointerUp={(e) => {
          setMouse(e);
          const eng = engineRef.current;
          if (!eng) return;
          eng.mouse.down = false;
          eng.mouse.justUp = true;
        }}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* HUD */}
      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2 sm:left-4 sm:top-4">
        <div className="flex max-w-[calc(100vw-9.5rem)] flex-wrap items-center gap-x-3 gap-y-0.5 rounded border border-white/10 bg-[#0d0f1c]/85 px-3 py-1.5 text-xs shadow-lg sm:max-w-none">
          <span style={{ fontFamily: fonts.pixel }} className="text-sm text-white">
            {playerName}
          </span>
          {stats ? (
            <>
              <span style={{ fontFamily: fonts.mono }} className="text-[#ffd66b]">
                skills {stats.skills}/{stats.skillsTotal}
              </span>
              <span style={{ fontFamily: fonts.mono }} className="text-[#5ff36b]">
                secrets {stats.secrets}/{stats.secretsTotal}
              </span>
              {stats.superMode ? (
                <span style={{ fontFamily: fonts.pixel }} className="text-[#ff5fa8]">
                  SUPER
                </span>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="flex max-w-[min(360px,80vw)] flex-col gap-2">
          {toasts.map((t) => (
            <div key={t.id} className="animate-[fadein_.2s_ease-out] rounded border border-white/10 bg-[#0d0f1c]/90 px-3 py-2 text-xs shadow-lg">
              <div className="font-semibold text-white">{t.title}</div>
              {t.body ? <div className="mt-0.5 text-[#a9afc9]">{t.body}</div> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-3 top-3 flex gap-2 sm:right-4 sm:top-4" style={{ fontFamily: fonts.mono }}>
        <HudButton onClick={() => setTutorial(0)} label="How to play" short="?" />
        <HudButton onClick={toggleSound} label={sound ? "Sound on [M]" : "Sound off [M]"} short={sound ? "♪" : "×"} />
        <HudButton onClick={exit} label="Back to site [Esc]" short="Exit" />
      </div>

      {/* Context prompts */}
      {!overlayOpen && prompts.length ? (
        <div className={`pointer-events-none absolute inset-x-0 flex justify-center gap-2 px-3 ${touch ? "bottom-36" : "bottom-14"}`}>
          {prompts.map((p) => (
            <div
              key={p.key + p.label}
              className="flex items-center gap-2 rounded border border-white/10 bg-[#14102a]/90 px-3 py-1.5 text-sm shadow-lg"
              style={{ fontFamily: fonts.mono }}
            >
              <kbd className="rounded bg-[#5ff3ff] px-1.5 py-0.5 text-xs font-bold text-[#0d0f1c]">{p.key}</kbd>
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {!touch ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-[11px] text-white/45" style={{ fontFamily: fonts.mono }}>
          {stats?.superMode
            ? "WASD fly · Shift rocket · Mouse laser · F grab/throw · X power down · Esc exit"
            : "A/D move · Space jump · E use · Q carry · W/S lift · M sound · Esc exit"}
        </div>
      ) : null}

      {touch && !overlayOpen ? <TouchPad press={press} superMode={Boolean(stats?.superMode)} /> : null}

      {/* Tutorial */}
      {tutorial !== null ? (
        <Overlay onClose={closeTutorial}>
          <div className="relative">
            <canvas ref={previewRef} width={1280} height={680} className="block aspect-[32/17] w-full bg-[#0a0f2c]" />
            <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-[11px] tracking-wider" style={{ fontFamily: fonts.mono }}>
              {slides[tutorial].tag} · {tutorial + 1}/{slides.length}
            </span>
            <CloseButton onClick={closeTutorial} />
          </div>
          <div className="p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl" style={{ fontFamily: fonts.pixel, color: slides[tutorial].color }}>
              {slides[tutorial].title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#d4d8ee] sm:text-[15px]">{slides[tutorial].body}</p>
            {slides[tutorial].keys.length ? (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ fontFamily: fonts.mono }}>
                {slides[tutorial].keys.map(([k, v]) => (
                  <span key={k} className="flex items-center gap-2 text-[#a9afc9]">
                    <kbd className="rounded border border-white/15 bg-white/10 px-1.5 py-0.5 text-white">{k}</kbd>
                    {v}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex gap-1.5" aria-hidden>
                {slides.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-sm transition-all ${i === tutorial ? "w-6" : "w-1.5 bg-white/25"}`} style={i === tutorial ? { background: slides[tutorial].color } : undefined} />
                ))}
              </div>
              <div className="flex gap-2" style={{ fontFamily: fonts.mono }}>
                {tutorial > 0 ? (
                  <button type="button" onClick={() => setTutorial(tutorial - 1)} className="rounded border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10" aria-label="Previous">
                    ←
                  </button>
                ) : null}
                {tutorial < slides.length - 1 ? (
                  <button type="button" onClick={closeTutorial} className="rounded border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
                    Skip
                  </button>
                ) : null}
                <button
                  type="button"
                  autoFocus
                  onClick={() => (tutorial < slides.length - 1 ? setTutorial(tutorial + 1) : closeTutorial())}
                  className="rounded bg-[#5ff3ff] px-4 py-2 text-sm font-bold text-[#0d0f1c] shadow-[0_3px_0_#1a9fb0] hover:brightness-110"
                >
                  {tutorial < slides.length - 1 ? "Next →" : "Let's go"}
                </button>
              </div>
            </div>
          </div>
        </Overlay>
      ) : null}

      {modal ? <ModalCard req={modal} stats={stats} fonts={fonts} onClose={() => setModal(null)} onLeave={leave} onCopy={(t) => navigator.clipboard?.writeText(t).then(() => pushToast("Email copied", t))} /> : null}

      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ bits */

function HudButton({ onClick, label, short }: { onClick: () => void; label: string; short: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-white/15 bg-[#0d0f1c]/85 px-2.5 py-1.5 text-xs text-white/90 shadow-lg transition-colors hover:border-[#5ff3ff]/60 hover:text-white"
    >
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{short}</span>
    </button>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded bg-black/70 text-white hover:bg-black">
      ×
    </button>
  );
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center overflow-y-auto bg-black/55 p-3 sm:p-6" onPointerDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="w-full max-w-[640px] overflow-hidden rounded-md border border-white/10 bg-[#0d0f1c] shadow-2xl">{children}</div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-[#c9cde4]">{children}</span>;
}

function LinkBtn({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  const ext = href.startsWith("http") || href.startsWith("mailto");
  const cls = primary
    ? "rounded bg-[#5ff3ff] px-3.5 py-2 text-sm font-bold text-[#0d0f1c] shadow-[0_3px_0_#1a9fb0] hover:brightness-110"
    : "rounded border border-white/15 bg-white/5 px-3.5 py-2 text-sm hover:bg-white/10";
  return ext ? (
    <a href={href} target="_blank" rel="noreferrer noopener" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

function ModalCard({
  req,
  stats,
  fonts,
  onClose,
  onLeave,
  onCopy,
}: {
  req: ModalRequest;
  stats: Stats | null;
  fonts: Fonts;
  onClose: () => void;
  onLeave: () => void;
  onCopy: (t: string) => void;
}) {
  const head = (tag: string, title: string, color = "#5ff3ff") => (
    <div className="relative border-b border-white/10 bg-[#121530] px-5 py-4 pr-14">
      <div className="text-[11px] tracking-wider text-white/60" style={{ fontFamily: fonts.mono }}>
        {tag}
      </div>
      <h2 className="mt-1 text-lg leading-snug sm:text-xl" style={{ fontFamily: fonts.pixel, color }}>
        {title}
      </h2>
      <CloseButton onClick={onClose} />
    </div>
  );

  let body: ReactNode = null;
  if (req.kind === "project") {
    const p = req.booth.project;
    body = (
      <>
        {head(`BOOTH · ${req.booth.area.toUpperCase()} · ${p.year}`, p.name)}
        <div className="max-h-[60vh] overflow-y-auto p-5 text-sm leading-relaxed text-[#d4d8ee]">
          <p className="text-[15px] text-white">{p.tagline}</p>
          {p.description.slice(0, 1).map((d, i) => (
            <p key={i} className="mt-3">
              {d}
            </p>
          ))}
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[#c9cde4]">
            {p.highlights.slice(0, 3).map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2" style={{ fontFamily: fonts.mono }}>
            {p.demo ? (
              <LinkBtn href={p.demo} primary>
                Live demo ↗
              </LinkBtn>
            ) : null}
            {p.github ? <LinkBtn href={p.github}>GitHub ↗</LinkBtn> : null}
            <LinkBtn href={`/projects/${p.slug}`}>Full write-up</LinkBtn>
          </div>
        </div>
      </>
    );
  } else if (req.kind === "job") {
    const j = req.job;
    body = (
      <>
        {head(`FLOOR ${req.floor + 1} · ${j.start} – ${j.end}`, j.company, "#c4a5ff")}
        <div className="max-h-[60vh] overflow-y-auto p-5 text-sm leading-relaxed text-[#d4d8ee]">
          <p className="text-[15px] font-semibold text-white">{j.role}</p>
          <p className="text-xs text-white/50">{j.location}</p>
          <p className="mt-3">{j.summary}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[#c9cde4]">
            {j.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {j.stack.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
          <div className="mt-5 flex gap-2" style={{ fontFamily: fonts.mono }}>
            <LinkBtn href="/experience">All experience</LinkBtn>
            {j.url ? <LinkBtn href={j.url}>Site ↗</LinkBtn> : null}
          </div>
        </div>
      </>
    );
  } else if (req.kind === "paper") {
    body = (
      <>
        {head(`PAPER · ${req.paper.year}`, req.paper.title, "#5ff36b")}
        <div className="p-5 text-sm leading-relaxed text-[#d4d8ee]">
          <p className="text-white">{req.paper.venue}</p>
          {req.paper.note ? <p className="mt-2">{req.paper.note}</p> : null}
          <div className="mt-5" style={{ fontFamily: fonts.mono }}>
            <LinkBtn href="/publications">All publications</LinkBtn>
          </div>
        </div>
      </>
    );
  } else if (req.kind === "edu") {
    const e = req.edu;
    body = (
      <>
        {head(`${e.start} – ${e.end} · GPA ${e.gpa}`, e.degree, "#ffd66b")}
        <div className="p-5 text-sm leading-relaxed text-[#d4d8ee]">
          <p className="text-white">{e.school}</p>
          <p className="text-xs text-white/50">{e.location}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {e.coursework.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        </div>
      </>
    );
  } else if (req.kind === "contact") {
    body = (
      <>
        {head("MAILBOX", "Say hello", "#ff5fa8")}
        <div className="p-5 text-sm leading-relaxed text-[#d4d8ee]">
          <p>Open to conversations about backend, distributed systems and research infrastructure. Email is fastest.</p>
          <div className="mt-5 flex flex-wrap gap-2" style={{ fontFamily: fonts.mono }}>
            <LinkBtn href={contactLinks.emailHref} primary>
              {contactLinks.email}
            </LinkBtn>
            <button type="button" onClick={() => onCopy(contactLinks.email)} className="rounded border border-white/15 bg-white/5 px-3.5 py-2 text-sm hover:bg-white/10">
              Copy
            </button>
            <LinkBtn href={contactLinks.linkedin}>LinkedIn ↗</LinkBtn>
            <LinkBtn href={contactLinks.github}>GitHub ↗</LinkBtn>
            <LinkBtn href={contactLinks.resume}>Resume ↗</LinkBtn>
            <LinkBtn href="/contact">Contact form</LinkBtn>
          </div>
        </div>
      </>
    );
  } else if (req.kind === "secret") {
    body = (
      <>
        {head(`SECRET FOUND · ${stats?.secrets ?? 0}/${secrets.length}`, req.secret.title, "#5ff36b")}
        <div className="p-5 text-sm leading-relaxed text-[#d4d8ee]">
          <p>{req.secret.body}</p>
          <div className="mt-5 flex justify-end" style={{ fontFamily: fonts.mono }}>
            <button type="button" autoFocus onClick={onClose} className="rounded bg-[#5ff3ff] px-4 py-2 text-sm font-bold text-[#0d0f1c] shadow-[0_3px_0_#1a9fb0]">
              Nice
            </button>
          </div>
        </div>
      </>
    );
  } else if (req.kind === "report") {
    const rows: [string, number, number, string][] = stats
      ? [
          ["Skills collected", stats.skills, stats.skillsTotal, "#ffd66b"],
          ["Projects opened", stats.projects, stats.projectsTotal, "#5ff3ff"],
          ["Career floors read", stats.jobs, stats.jobsTotal, "#c4a5ff"],
          ["Secrets found", stats.secrets, stats.secretsTotal, "#5ff36b"],
        ]
      : [];
    const pct = stats ? Math.round(((stats.skills + stats.projects + stats.jobs + stats.secrets) / (stats.skillsTotal + stats.projectsTotal + stats.jobsTotal + stats.secretsTotal)) * 100) : 0;
    body = (
      <>
        {head("END REPORT", `${pct}% of the city explored`, "#ffd66b")}
        <div className="p-5 text-sm text-[#d4d8ee]">
          <div className="space-y-3" style={{ fontFamily: fonts.mono }}>
            {rows.map(([label, n, total, color]) => (
              <div key={label}>
                <div className="flex justify-between text-xs">
                  <span>{label}</span>
                  <span style={{ color }}>
                    {n}/{total}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-sm bg-white/10">
                  <div className="h-full" style={{ width: `${(n / Math.max(1, total)) * 100}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[#a9afc9]">Thanks for walking around. If you&apos;d rather read than play, the regular site has all of it too.</p>
          <div className="mt-5 flex flex-wrap justify-end gap-2" style={{ fontFamily: fonts.mono }}>
            <button type="button" onClick={onClose} className="rounded border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              Keep playing
            </button>
            <LinkBtn href={contactLinks.emailHref}>Email me</LinkBtn>
            <button type="button" autoFocus onClick={onLeave} className="rounded bg-[#5ff3ff] px-4 py-2 text-sm font-bold text-[#0d0f1c] shadow-[0_3px_0_#1a9fb0]">
              Back to site
            </button>
          </div>
        </div>
      </>
    );
  }

  return <Overlay onClose={onClose}>{body}</Overlay>;
}

function TouchPad({ press, superMode }: { press: (k: string, on: boolean) => void; superMode: boolean }) {
  const btn = (key: string, label: string, cls = "") => (
    <button
      type="button"
      className={`grid h-14 w-14 place-items-center rounded-lg border border-white/20 bg-[#0d0f1c]/70 text-lg font-bold text-white active:bg-[#5ff3ff]/40 ${cls}`}
      onPointerDown={(e) => {
        e.preventDefault();
        press(key, true);
      }}
      onPointerUp={() => press(key, false)}
      onPointerLeave={() => press(key, false)}
      onPointerCancel={() => press(key, false)}
    >
      {label}
    </button>
  );
  return (
    <div className="absolute inset-x-0 bottom-4 flex items-end justify-between px-4">
      <div className="grid grid-cols-3 gap-1.5">
        <span />
        {btn("w", "▲")}
        <span />
        {btn("a", "◀")}
        {btn("s", "▼")}
        {btn("d", "▶")}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex gap-1.5">
          {superMode ? btn("x", "X") : btn("q", "Q")}
          {superMode ? btn("f", "F") : btn("e", "E", "bg-[#5ff3ff]/25")}
        </div>
        {btn(" ", superMode ? "UP" : "JUMP", "w-[7.375rem] text-sm")}
      </div>
    </div>
  );
}
