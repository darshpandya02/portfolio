/**
 * The /play side-scroller: physics, interaction and canvas rendering.
 * Pure TypeScript with no React, so the page component only wires input,
 * the animation loop and the DOM overlays (HUD, modals).
 */
import type { Education, Experience, Publication } from "@/lib/content";

import {
  billboards,
  booths,
  CAMPUS,
  careerFloors,
  CONTACT,
  contactLinks,
  diplomas,
  END_X,
  GY,
  HALL,
  KEYCARD,
  LOGOS,
  MACHINE,
  MALL,
  MALL_X2,
  mallFloorLabels,
  papers,
  secrets,
  skillTokens,
  SPAWN_X,
  TILE,
  TOWER,
  TOWER_ROOF,
  towerSpecs,
  VIEW_H,
  WORLD_W,
  zones,
  type Booth,
  type Secret,
} from "./world";

/* ------------------------------------------------------------------ types */

export type ModalRequest =
  | { kind: "project"; booth: Booth }
  | { kind: "job"; job: Experience; floor: number }
  | { kind: "paper"; paper: Publication }
  | { kind: "edu"; edu: Education }
  | { kind: "contact" }
  | { kind: "secret"; secret: Secret }
  | { kind: "report" };

export interface Prompt {
  key: string;
  label: string;
}

export interface Stats {
  skills: number;
  skillsTotal: number;
  secrets: number;
  secretsTotal: number;
  projects: number;
  projectsTotal: number;
  jobs: number;
  jobsTotal: number;
  superMode: boolean;
}

export interface Progress {
  skills: string[];
  secrets: string[];
  projects: string[];
  jobs: string[];
}

export interface EngineEvents {
  toast: (title: string, body?: string) => void;
  modal: (req: ModalRequest) => void;
  prompts: (list: Prompt[]) => void;
  stats: (s: Stats) => void;
  link: (url: string) => void;
  copy: (text: string) => void;
  progress: (p: Progress) => void;
}

export interface Fonts {
  pixel: string;
  display: string;
  mono: string;
}

interface Platform {
  x1: number;
  x2: number;
  y: number;
}

interface Lift {
  key: "mall" | "tower";
  x: number;
  w: number;
  y: number;
  top: number;
  bottom: number;
  stops: number[];
}

interface Arrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  stuck: boolean;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  g: number;
}

interface Tile {
  x: number;
  y: number;
  hp: number;
  alive: boolean;
  tower: number;
  shade: number;
}

interface Egg {
  x: number;
  y: number;
  tower: number;
  revealed: boolean;
  taken: boolean;
}

interface Thrown {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface FallingToken {
  idx: number;
  x: number;
  y: number;
  vy: number;
  rot: number;
}

interface Interactable {
  x1: number;
  x2: number;
  y: number;
  key: string;
  label: string;
  run: () => void;
}

/* ---------------------------------------------------------------- helpers */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function rgbOf(c: string): [number, number, number] {
  if (c[0] === "#") {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = c.match(/\d+/g) ?? ["0", "0", "0"];
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

function mix(c1: string, c2: string, t: number) {
  const a = rgbOf(c1);
  const b = rgbOf(c2);
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
}

function initials(name: string) {
  const words = name.replace(/[^A-Za-z0-9+& ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/* ------------------------------------------------------------------ sound */

class Sfx {
  ctx: AudioContext | null = null;
  enabled = true;
  laserNode: { osc: OscillatorNode; gain: GainNode } | null = null;
  noiseBuf: AudioBuffer | null = null;
  music: { gain: GainNode; timer: number; next: number; step: number } | null = null;

  unlock() {
    if (this.ctx || typeof window === "undefined") return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
    } catch {
      this.ctx = null;
    }
  }

  beep(freq: number, dur = 0.08, type: OscillatorType = "square", vol = 0.05, slide = 0) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** A brassy note: two detuned saws through a lowpass that opens on the attack. */
  brass(freq: number, at: number, dur: number, vol = 0.05, out?: AudioNode, abs = false) {
    if (!this.enabled || !this.ctx) return;
    const c = this.ctx;
    const t = abs ? at : c.currentTime + at;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(3200, t + 0.06);
    filter.frequency.exponentialRampToValueAtTime(1200, t + dur);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.03);
    gain.gain.setValueAtTime(vol * 0.85, t + Math.max(0.04, dur - 0.12));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    filter.connect(gain).connect(out ?? c.destination);
    [-6, 6].forEach((cents) => {
      const osc = c.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);
      osc.detune.value = cents;
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  }

  /** Filtered noise: a rising whoosh, or a short drum hit. */
  noise(at: number, dur: number, from: number, to: number, vol = 0.08, out?: AudioNode, abs = false) {
    if (!this.enabled || !this.ctx) return;
    const c = this.ctx;
    const t = abs ? at : c.currentTime + at;
    if (!this.noiseBuf) {
      this.noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + dur);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(out ?? c.destination);
    src.start(t);
    src.stop(t + Math.min(dur, 1));
  }

  /** Cape on: a whoosh, a rising brass call, then a big major chord with a drum hit. */
  hero() {
    if (!this.enabled || !this.ctx) return;
    this.noise(0, 0.45, 300, 4000, 0.09);
    // G3, C4, E4 rising, then a held C5 on top of a C major chord
    const call: [number, number, number][] = [
      [196.0, 0.42, 0.14],
      [261.63, 0.58, 0.14],
      [329.63, 0.74, 0.14],
    ];
    call.forEach(([f, at, d]) => this.brass(f, at, d, 0.05));
    [261.63, 329.63, 392.0, 523.25].forEach((f) => this.brass(f, 0.9, 1.1, 0.035));
    this.brass(130.81, 0.9, 1.1, 0.04);
    this.noise(0.9, 0.25, 180, 60, 0.12);
    setTimeout(() => this.beep(70, 0.35, "sine", 0.12, -30), 900);
  }

  play(name: string) {
    switch (name) {
      case "jump":
        return this.beep(330, 0.12, "square", 0.04, 300);
      case "land":
        return this.beep(110, 0.05, "triangle", 0.04);
      case "use":
        return this.beep(660, 0.07, "square", 0.04, 220);
      case "shoot":
        return this.beep(520, 0.12, "sawtooth", 0.03, -320);
      case "collect":
        this.beep(880, 0.08, "square", 0.05);
        setTimeout(() => this.beep(1320, 0.12, "square", 0.05), 70);
        return;
      case "secret":
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.beep(f, 0.14, "square", 0.05), i * 90));
        return;
      case "boom":
        return this.beep(90, 0.3, "sawtooth", 0.07, -60);
      case "hero":
        return this.hero();
      case "power":
        [220, 330, 440, 660, 880].forEach((f, i) => setTimeout(() => this.beep(f, 0.12, "sawtooth", 0.04), i * 70));
        return;
      case "lift":
        return this.beep(180, 0.06, "triangle", 0.02);
      case "deny":
        return this.beep(150, 0.18, "square", 0.04, -40);
    }
  }

  /**
   * Super-mode theme: an original four-bar march (C, Ab, Bb, C) that loops
   * while the cape is on. Notes are scheduled a little ahead on the audio
   * clock so the tempo holds steady even when frames drop.
   */
  theme(on: boolean) {
    const c = this.ctx;
    if (!c) return;
    const want = on && this.enabled;
    if (want && !this.music) {
      const gain = c.createGain();
      gain.gain.setValueAtTime(0.0001, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(1, c.currentTime + 0.6);
      gain.connect(c.destination);
      // Start after the cape-on fanfare has had its moment.
      const m = { gain, timer: 0, next: c.currentTime + 1.6, step: 0 };
      m.timer = window.setInterval(() => this.scheduleTheme(), 50);
      this.music = m;
      this.scheduleTheme();
    } else if (!want && this.music) {
      const m = this.music;
      this.music = null;
      window.clearInterval(m.timer);
      m.gain.gain.cancelScheduledValues(c.currentTime);
      m.gain.gain.setValueAtTime(m.gain.gain.value, c.currentTime);
      m.gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.4);
      window.setTimeout(() => m.gain.disconnect(), 600);
    }
  }

  private scheduleTheme() {
    const c = this.ctx;
    const m = this.music;
    if (!c || !m) return;
    const beat = 60 / 132;
    const sixteenth = beat / 4;
    const hz = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
    // Bar roots (MIDI): C, Ab, Bb, C. Chords are root, third, fifth.
    const roots = [48, 44, 46, 48];
    const thirds = [4, 4, 4, 4];
    // Melody per bar: [start beat, length in beats, MIDI note]
    const melody: [number, number, number][][] = [
      [[0, 1.5, 67], [1.5, 0.5, 72], [2, 1, 76], [3, 1, 79]],
      [[0, 1.5, 77], [1.5, 0.5, 75], [2, 2, 72]],
      [[0, 1.5, 77], [1.5, 0.5, 74], [2, 1, 70], [3, 1, 74]],
      [[0, 3, 72], [3, 0.5, 67], [3.5, 0.5, 71]],
    ];
    while (m.next < c.currentTime + 0.25) {
      const t = m.next;
      const step = m.step % 64;
      const bar = Math.floor(step / 16);
      const inBar = step % 16;
      const root = roots[bar];
      // Driving bass: root on eighth notes, octave jump on the off-beats.
      if (inBar % 2 === 0) {
        const n = inBar % 4 === 0 ? root - 12 : root;
        this.brass(hz(n), t, sixteenth * 1.8, 0.03, m.gain, true);
      }
      // Pad: the full chord at the top of each bar.
      if (inBar === 0) {
        [root, root + thirds[bar], root + 7].forEach((n) =>
          this.brass(hz(n + 12), t, beat * 3.8, 0.011, m.gain, true),
        );
        this.noise(t, 0.2, 160, 60, 0.07, m.gain, true);
      }
      // Marching snare on 2 and 4, with a roll into the next loop.
      if (inBar === 4 || inBar === 12 || (bar === 3 && inBar >= 13)) {
        this.noise(t, 0.12, 2400, 1500, 0.035, m.gain, true);
      }
      // Melody.
      for (const [start, len, n] of melody[bar]) {
        if (Math.round(start * 4) === inBar) this.brass(hz(n), t, len * beat * 0.95, 0.03, m.gain, true);
      }
      m.next += sixteenth;
      m.step++;
    }
  }

  laser(on: boolean) {
    if (!this.ctx) return;
    if (on && this.enabled && !this.laserNode) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = 95;
      gain.gain.value = 0.025;
      osc.connect(gain).connect(this.ctx.destination);
      osc.start();
      this.laserNode = { osc, gain };
    } else if ((!on || !this.enabled) && this.laserNode) {
      this.laserNode.osc.stop();
      this.laserNode = null;
    }
  }
}

/* ---------------------------------------------------------------- engine */

const P = 2.2; // player pixel size
const PW = 22;
const PH = 46;
const GRAV = 1900;
const JUMP_V = 640;
const WALK = 240;

const BODY = [
  "....hhhhh...",
  "...hhhhhhh..",
  "..hhhhhhhhh.",
  "..hhsssssh..",
  "..hsssssess.",
  "..hssssssss.",
  "...sssssss..",
  "....sssss...",
  "...nnwtwnn..",
  "..nnnwtwnnn.",
  "..nnnntnnnn.",
  "..nnnntnnnn.",
  "..nnnnnnnnn.",
  "..nnnnnnnnn.",
  "...nnnnnnn..",
  "...ppppppp..",
];

const PAL: Record<string, string> = {
  h: "#1b1311",
  s: "#c68a62",
  e: "#111111",
  n: "#1f2f57",
  w: "#e9eef7",
  t: "#3b7be0",
  p: "#2a2f45",
  k: "#0d0d10",
};

export class GameEngine {
  ev: EngineEvents;
  fonts: Fonts;
  sfx = new Sfx();

  // view
  w = 1280;
  h = 720;
  scale = 1;
  viewW = 1280;
  viewH = VIEW_H;
  camX = 0;
  camY = 0;
  time = 0;

  // input
  keys = new Set<string>();
  pressed = new Set<string>();
  mouse = { x: 0, y: 0, down: false, justDown: false, justUp: false };
  paused = false;

  // player
  p = {
    x: SPAWN_X,
    y: GY,
    vx: 0,
    vy: 0,
    onGround: true,
    face: 1 as 1 | -1,
    walkT: 0,
    area: "city" as "city" | "lab",
    mode: "walk" as "walk" | "super",
    dropT: 0,
    platform: null as Platform | Lift | null,
  };

  carrying = false;
  sign = { x: 860, y: GY };
  hasBow = false;
  charge = 0;
  arrows: Arrow[] = [];
  particles: Particle[] = [];
  falling: FallingToken[] = [];
  tiles: Tile[] = [];
  eggs: Egg[] = [];
  thrown: Thrown[] = [];
  grabbed: { shade: number } | null = null;
  laserOn = false;
  laserEnd = { x: 0, y: 0 };
  flagT = 0;
  flagUp = false;
  deskTalkT = 0;
  deskLine = "";

  collected = new Set<string>();
  found = new Set<string>();
  viewedProjects = new Set<string>();
  viewedJobs = new Set<string>();

  platforms: Platform[] = [];
  lifts: Lift[] = [];
  images = new Map<string, HTMLImageElement>();
  dirt: HTMLCanvasElement | null = null;
  bricks: HTMLCanvasElement | null = null;

  lastPrompts = "";
  lastZone = "";
  zoneT = 0;

  constructor(ev: EngineEvents, fonts: Fonts, progress?: Partial<Progress>) {
    this.ev = ev;
    this.fonts = fonts;
    progress?.skills?.forEach((s) => this.collected.add(s));
    progress?.secrets?.forEach((s) => this.found.add(s));
    progress?.projects?.forEach((s) => this.viewedProjects.add(s));
    progress?.jobs?.forEach((s) => this.viewedJobs.add(s));
    this.buildWorld();
  }

  /* ------------------------------------------------------------- setup */

  buildWorld() {
    const shaftM = { a: MALL.liftX, b: MALL.liftX + MALL.liftW };
    for (let k = 1; k <= MALL.floors; k++) {
      const y = GY - k * MALL.floorH;
      this.platforms.push({ x1: shaftM.b, x2: MALL_X2, y });
      if (k === MALL.floors) this.platforms.push({ x1: MALL.x1, x2: shaftM.a, y });
    }
    const shaftT = { a: TOWER.liftX, b: TOWER.liftX + TOWER.liftW };
    for (let k = 1; k <= careerFloors.length; k++) {
      const y = GY - k * TOWER.floorH;
      this.platforms.push({ x1: TOWER.x1, x2: shaftT.a, y });
      this.platforms.push({ x1: shaftT.b, x2: TOWER.x2, y });
    }
    this.lifts.push({
      key: "mall",
      x: MALL.liftX,
      w: MALL.liftW,
      y: GY,
      top: MALL.roofY,
      bottom: GY,
      stops: Array.from({ length: MALL.floors + 1 }, (_, k) => GY - k * MALL.floorH),
    });
    this.lifts.push({
      key: "tower",
      x: TOWER.liftX,
      w: TOWER.liftW,
      y: GY,
      top: TOWER_ROOF,
      bottom: GY,
      stops: Array.from({ length: careerFloors.length + 1 }, (_, k) => GY - k * TOWER.floorH),
    });

    towerSpecs.forEach((t, ti) => {
      for (let c = 0; c < t.cols; c++) {
        for (let r = 0; r < t.rows; r++) {
          this.tiles.push({
            x: t.x + c * TILE,
            y: GY - (r + 1) * TILE,
            hp: 1,
            alive: true,
            tower: ti,
            shade: hash(ti * 100 + c * 7 + r * 13),
          });
        }
      }
      const egg = { x: t.x + t.egg.c * TILE + TILE / 2, y: GY - (t.egg.r + 1) * TILE + TILE / 2, tower: ti, revealed: false, taken: this.found.has(`egg-${ti}`) };
      this.eggs.push(egg);
    });
  }

  loadImages() {
    if (typeof window === "undefined") return;
    const srcs = [
      ...skillTokens.map((s) => s.icon).filter((s): s is string => Boolean(s)),
      ...Object.values(LOGOS),
    ];
    for (const src of Array.from(new Set(srcs))) {
      const img = new Image();
      img.src = src;
      this.images.set(src, img);
    }
    // Dirt texture
    const d = document.createElement("canvas");
    d.width = d.height = 96;
    const dc = d.getContext("2d");
    if (dc) {
      dc.fillStyle = "#6b4a2f";
      dc.fillRect(0, 0, 96, 96);
      for (let i = 0; i < 576; i++) {
        const v = hash(i * 3.3);
        dc.fillStyle = v < 0.33 ? "#5c3f27" : v < 0.66 ? "#7a5636" : "#664629";
        dc.fillRect((i % 24) * 4, Math.floor(i / 24) * 4, 4, 4);
      }
    }
    this.dirt = d;
    const b = document.createElement("canvas");
    b.width = 48;
    b.height = 24;
    const bc = b.getContext("2d");
    if (bc) {
      bc.fillStyle = "#3a2c4f";
      bc.fillRect(0, 0, 48, 24);
      bc.fillStyle = "#2f2342";
      bc.fillRect(0, 11, 48, 2);
      bc.fillRect(0, 23, 48, 1);
      bc.fillRect(22, 0, 2, 11);
      bc.fillRect(10, 12, 2, 11);
      bc.fillRect(34, 12, 2, 11);
    }
    this.bricks = b;
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.scale = Math.min(h / VIEW_H, w / 560);
    this.viewW = w / this.scale;
    this.viewH = h / this.scale;
  }

  /* --------------------------------------------------------- utilities */

  stats(): Stats {
    return {
      skills: this.collected.size,
      skillsTotal: skillTokens.length,
      secrets: this.found.size,
      secretsTotal: secrets.length,
      projects: this.viewedProjects.size,
      projectsTotal: booths.length,
      jobs: this.viewedJobs.size,
      jobsTotal: careerFloors.length,
      superMode: this.p.mode === "super",
    };
  }

  emitProgress() {
    this.ev.stats(this.stats());
    this.ev.progress({
      skills: Array.from(this.collected),
      secrets: Array.from(this.found),
      projects: Array.from(this.viewedProjects),
      jobs: Array.from(this.viewedJobs),
    });
  }

  findSecret(id: string) {
    if (this.found.has(id)) return;
    this.found.add(id);
    const s = secrets.find((x) => x.id === id);
    this.sfx.play("secret");
    if (s) this.ev.modal({ kind: "secret", secret: s });
    this.emitProgress();
  }

  burst(x: number, y: number, color: string, n = 14, speed = 220, g = 900) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random());
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - speed * 0.4,
        life: 0,
        max: 0.5 + Math.random() * 0.6,
        color,
        size: 2 + Math.random() * 3,
        g,
      });
    }
  }

  worldMouse() {
    return { x: this.mouse.x / this.scale + this.camX, y: this.mouse.y / this.scale + this.camY };
  }

  zoneAt(x: number) {
    return zones.find((z) => x >= z.x1 && x < z.x2) ?? zones[0];
  }

  tokenPos(i: number) {
    const t = skillTokens[i];
    const a = Math.sin(this.time * 1.4 + t.phase) * 0.1;
    return { x: t.x + Math.sin(a) * t.rope, y: HALL.ceil + Math.cos(a) * t.rope, a };
  }

  collectToken(i: number) {
    const t = skillTokens[i];
    if (this.collected.has(t.id)) return;
    this.collected.add(t.id);
    const pos = this.tokenPos(i);
    this.falling.push({ idx: i, x: pos.x, y: pos.y, vy: -120, rot: 0 });
    this.burst(pos.x, pos.y, "#ffd66b", 16, 200);
    this.sfx.play("collect");
    this.ev.toast(`+ ${t.name}`, `${t.group} · ${this.collected.size}/${skillTokens.length} skills`);
    this.emitProgress();
    if (this.collected.size === skillTokens.length) {
      setTimeout(() => this.ev.toast("Every skill collected!", "The whole stack, on one wall."), 900);
    }
  }

  damageTile(t: Tile, amount: number) {
    t.hp -= amount;
    if (t.hp <= 0 && t.alive) this.killTile(t);
  }

  killTile(t: Tile) {
    t.alive = false;
    this.burst(t.x + TILE / 2, t.y + TILE / 2, mix("#6f7a92", "#a7b0c4", t.shade), 8, 180);
    const egg = this.eggs[t.tower];
    if (!egg.revealed && Math.abs(egg.x - (t.x + TILE / 2)) < 1 && Math.abs(egg.y - (t.y + TILE / 2)) < 1) {
      egg.revealed = true;
      if (!egg.taken) this.ev.toast("Something is glowing in the rubble", "Fly into it to grab it.");
    }
  }

  solidTileAt(x: number, y: number) {
    for (const t of this.tiles) {
      if (t.alive && x >= t.x && x < t.x + TILE && y >= t.y && y < t.y + TILE) return t;
    }
    return null;
  }

  /* -------------------------------------------------------------- input */

  keyDown(k: string) {
    const key = k.toLowerCase();
    if (!this.keys.has(key)) this.pressed.add(key);
    this.keys.add(key);
    this.sfx.unlock();
  }

  keyUp(k: string) {
    this.keys.delete(k.toLowerCase());
  }

  down(...ks: string[]) {
    return ks.some((k) => this.keys.has(k));
  }

  hit(...ks: string[]) {
    return ks.some((k) => this.pressed.has(k));
  }

  /* ------------------------------------------------------------- update */

  update(dt: number) {
    dt = Math.min(dt, 1 / 30);
    this.time += dt;
    if (this.paused) {
      this.pressed.clear();
      this.mouse.justDown = this.mouse.justUp = false;
      this.sfx.laser(false);
      this.sfx.theme(false);
      return;
    }

    const p = this.p;
    this.sfx.theme(p.mode === "super");
    const left = this.down("a", "arrowleft");
    const right = this.down("d", "arrowright");
    const up = this.down("w", "arrowup");
    const downK = this.down("s", "arrowdown");

    if (p.mode === "super") this.updateSuper(dt, left, right, up, downK);
    else this.updateWalk(dt, left, right, up, downK);

    this.updateArchery(dt);
    this.updateProjectiles(dt);
    this.updateParticles(dt);
    this.updatePickups();
    this.updateInteract();
    this.updateCamera(dt);

    if (this.flagUp) this.flagT = Math.min(1, this.flagT + dt * 0.6);
    if (this.deskTalkT > 0) this.deskTalkT -= dt;

    const z = this.zoneAt(p.x);
    if (z.key !== this.lastZone) {
      this.lastZone = z.key;
      this.zoneT = 0;
    }
    this.zoneT += dt;

    this.pressed.clear();
    this.mouse.justDown = false;
    this.mouse.justUp = false;
  }

  updateWalk(dt: number, left: boolean, right: boolean, up: boolean, downK: boolean) {
    const p = this.p;
    const dir = (right ? 1 : 0) - (left ? 1 : 0);
    const target = dir * WALK;
    p.vx = lerp(p.vx, target, Math.min(1, dt * (p.onGround ? 14 : 6)));
    if (dir) p.face = dir as 1 | -1;
    if (p.onGround && Math.abs(p.vx) > 20) p.walkT += dt * Math.abs(p.vx) * 0.045;
    else p.walkT = 0;

    // Lifts: whoever stands on one drives it with W/S. Standing next to an
    // empty shaft calls the car to your level.
    let onLift: Lift | null = null;
    for (const lift of this.lifts) {
      const inShaft = p.x > lift.x + 6 && p.x < lift.x + lift.w - 6;
      const standing = p.onGround && p.platform === lift;
      if (standing) {
        onLift = lift;
        const prev = lift.y;
        if (up) lift.y -= 300 * dt;
        else if (downK) lift.y += 300 * dt;
        else {
          const near = lift.stops.reduce((a, b) => (Math.abs(b - lift.y) < Math.abs(a - lift.y) ? b : a));
          lift.y = lerp(lift.y, near, Math.min(1, dt * 6));
        }
        lift.y = clamp(lift.y, lift.top, lift.bottom);
        if (Math.abs(prev - lift.y) > 0.5 && Math.floor(this.time * 6) !== Math.floor((this.time - dt) * 6)) this.sfx.play("lift");
        p.y = lift.y;
      } else if (p.onGround && (inShaft || Math.abs(p.x - (lift.x + lift.w / 2)) < lift.w / 2 + 40) && p.area === "city") {
        if (Math.abs(lift.y - p.y) > 1 && Math.abs(lift.y - p.y) < 2000) {
          const step = 520 * dt;
          lift.y += clamp(p.y - lift.y, -step, step);
        }
      }
    }

    if (p.onGround && this.hit(" ", "space", "w", "arrowup") && !onLift) {
      p.vy = -JUMP_V;
      p.onGround = false;
      p.platform = null;
      this.sfx.play("jump");
    } else if (p.onGround && this.hit(" ", "space") && onLift) {
      p.vy = -JUMP_V * 0.8;
      p.onGround = false;
      p.platform = null;
      this.sfx.play("jump");
    }
    if (p.onGround && downK && !onLift && p.platform && "x1" in p.platform) {
      p.dropT = 0.25;
      p.onGround = false;
      p.platform = null;
    }
    if (p.dropT > 0) p.dropT -= dt;

    p.vy += GRAV * dt;
    if (p.onGround) p.vy = 0;
    this.moveAndCollide(dt);
  }

  updateSuper(dt: number, left: boolean, right: boolean, up: boolean, downK: boolean) {
    const p = this.p;
    const boost = this.down("shift") ? 2.1 : 1;
    const ax = (right ? 1 : 0) - (left ? 1 : 0);
    const ay = (downK ? 1 : 0) - (up || this.down(" ") ? 1 : 0);
    p.vx = lerp(p.vx, ax * 360 * boost, Math.min(1, dt * 5));
    p.vy = lerp(p.vy, ay * 330 * boost, Math.min(1, dt * 5));
    if (ax) p.face = ax as 1 | -1;
    if (boost > 1 && (ax || ay)) {
      this.particles.push({
        x: p.x - p.face * 8,
        y: p.y - 14,
        vx: -p.vx * 0.3 + (Math.random() - 0.5) * 60,
        vy: 80 + Math.random() * 60,
        life: 0,
        max: 0.35,
        color: Math.random() < 0.5 ? "#ffb347" : "#ff6b3d",
        size: 3 + Math.random() * 3,
        g: 0,
      });
    }
    this.moveAndCollide(dt);
    p.y = clamp(p.y, GY - 1400, GY);

    // Laser
    const wm = this.worldMouse();
    this.laserOn = this.mouse.down && !this.grabbed;
    this.sfx.laser(this.laserOn);
    if (this.laserOn) {
      const ox = p.x + p.face * 8;
      const oy = p.y - 32;
      const dx = wm.x - ox;
      const dy = wm.y - oy;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      let ex = ox;
      let ey = oy;
      for (let d = 0; d < 900; d += 6) {
        ex = ox + ux * d;
        ey = oy + uy * d;
        if (ey > GY) break;
        const t = this.solidTileAt(ex, ey);
        if (t) {
          this.damageTile(t, dt * 5);
          if (Math.random() < 0.4) this.burst(ex, ey, "#7ff6ff", 1, 120, 300);
          break;
        }
        if (ex > HALL.x1 && ex < HALL.x2 && ey < GY - 100) {
          const idx = skillTokens.findIndex((tok, i) => {
            if (this.collected.has(tok.id)) return false;
            const pos = this.tokenPos(i);
            return Math.hypot(pos.x - ex, pos.y - ey) < 18;
          });
          if (idx >= 0) {
            this.collectToken(idx);
            break;
          }
        }
      }
      this.laserEnd = { x: ex, y: ey };
    }

    // Grab and throw
    if (this.hit("f")) {
      if (this.grabbed) this.throwGrabbed(wm);
      else {
        let best: Tile | null = null;
        let bd = 80;
        for (const t of this.tiles) {
          if (!t.alive) continue;
          const d = Math.hypot(t.x + TILE / 2 - p.x, t.y + TILE / 2 - (p.y - 23));
          if (d < bd) {
            bd = d;
            best = t;
          }
        }
        if (best) {
          this.killTile(best);
          this.grabbed = { shade: best.shade };
          this.sfx.play("use");
        } else this.ev.toast("Nothing to grab", "Fly right up against a downtown tower first.");
      }
    } else if (this.grabbed && this.mouse.justDown) this.throwGrabbed(wm);

    if (this.hit("x")) {
      p.mode = "walk";
      this.laserOn = false;
      this.sfx.laser(false);
      this.grabbed = null;
      this.ev.toast("Powered down", "Back on foot. The machine is waiting on the tower roof.");
      this.emitProgress();
    }
  }

  throwGrabbed(target: { x: number; y: number }) {
    const p = this.p;
    const ox = p.x;
    const oy = p.y - 60;
    const dx = target.x - ox;
    const dy = target.y - oy;
    const len = Math.hypot(dx, dy) || 1;
    this.thrown.push({ x: ox, y: oy, vx: (dx / len) * 950, vy: (dy / len) * 950 });
    this.grabbed = null;
    this.sfx.play("shoot");
  }

  moveAndCollide(dt: number) {
    const p = this.p;
    const prevY = p.y;

    // Horizontal
    p.x += p.vx * dt;
    if (p.area === "lab") p.x = clamp(p.x, CAMPUS.x1 + 30, CAMPUS.x2 - 30);
    else p.x = clamp(p.x, 20, WORLD_W - 20);
    for (const t of this.tiles) {
      if (!t.alive) continue;
      if (p.x + PW / 2 > t.x && p.x - PW / 2 < t.x + TILE && p.y > t.y + 2 && p.y - PH < t.y + TILE) {
        if (p.vx > 0) p.x = t.x - PW / 2;
        else if (p.vx < 0) p.x = t.x + TILE + PW / 2;
        p.vx = 0;
      }
    }

    // Vertical
    p.y += p.vy * dt;
    const floor = p.area === "lab" ? CAMPUS.labFloor : GY;
    let landed: Platform | Lift | null = null;
    let landY = Infinity;

    if (p.y >= floor) {
      landY = floor;
    }
    if (p.vy >= 0 && p.dropT <= 0 && p.area === "city") {
      for (const pl of this.platforms) {
        if (p.x > pl.x1 && p.x < pl.x2 && prevY <= pl.y + 1 && p.y >= pl.y && pl.y < landY) {
          landY = pl.y;
          landed = pl;
        }
      }
      for (const lift of this.lifts) {
        if (p.x > lift.x + 4 && p.x < lift.x + lift.w - 4 && prevY <= lift.y + 2 && p.y >= lift.y - 1 && lift.y <= landY) {
          landY = lift.y;
          landed = lift;
        }
      }
    }
    for (const t of this.tiles) {
      if (!t.alive) continue;
      if (p.x + PW / 2 > t.x + 1 && p.x - PW / 2 < t.x + TILE - 1) {
        if (p.vy >= 0 && prevY <= t.y + 1 && p.y >= t.y && t.y < landY) {
          landY = t.y;
          landed = null;
        } else if (p.vy < 0 && p.y - PH < t.y + TILE && prevY - PH >= t.y + TILE - 1) {
          p.y = t.y + TILE + PH;
          p.vy = 0;
        }
      }
    }

    if (landY !== Infinity && p.vy >= 0) {
      const wasAir = !p.onGround;
      p.y = landY;
      p.vy = 0;
      p.onGround = true;
      p.platform = landed;
      if (wasAir && p.mode === "walk") this.sfx.play("land");
    } else if (p.mode === "walk") {
      // Walked off a ledge?
      if (p.onGround) {
        const pl = p.platform;
        const still =
          (pl && "key" in pl && p.x > pl.x + 2 && p.x < pl.x + pl.w - 2) ||
          (pl && "x1" in pl && p.x > pl.x1 && p.x < pl.x2) ||
          (!pl && (p.y >= floor - 0.5 || this.solidTileAt(p.x, p.y + 1) || this.solidTileAt(p.x - PW / 2 + 2, p.y + 1) || this.solidTileAt(p.x + PW / 2 - 2, p.y + 1)));
        if (!still) {
          p.onGround = false;
          p.platform = null;
        }
      }
    } else {
      p.onGround = false;
    }
  }

  updateArchery(dt: number) {
    const p = this.p;
    const inHall = p.area === "city" && p.mode === "walk" && p.x > HALL.x1 + 10 && p.x < HALL.x2 - 10 && p.y > GY - 200;
    if (inHall && !this.hasBow) {
      this.hasBow = true;
      if (this.carrying) {
        this.carrying = false;
        this.sign = { x: HALL.x1 - 30, y: GY };
      }
      this.ev.toast("Picked up the bow", "Hold the mouse to draw, aim, release to shoot a rope. On touch: drag and let go.");
    } else if (!inHall && this.hasBow) {
      this.hasBow = false;
      this.charge = 0;
    }
    if (!this.hasBow) return;
    if (this.mouse.down) this.charge = Math.min(1, this.charge + dt * 1.2);
    if (this.mouse.justUp && this.charge > 0.05) {
      const wm = this.worldMouse();
      const ox = p.x;
      const oy = p.y - 30;
      const dx = wm.x - ox;
      const dy = wm.y - oy;
      const len = Math.hypot(dx, dy) || 1;
      const sp = 450 + 900 * this.charge;
      this.arrows.push({ x: ox, y: oy, vx: (dx / len) * sp, vy: (dy / len) * sp, stuck: false, life: 0 });
      this.sfx.play("shoot");
      this.charge = 0;
    }
    if (this.mouse.justUp) this.charge = 0;
  }

  updateProjectiles(dt: number) {
    for (const a of this.arrows) {
      a.life += dt;
      if (a.stuck) continue;
      const steps = 3;
      for (let s = 0; s < steps; s++) {
        a.vy += (900 * dt) / steps;
        a.x += (a.vx * dt) / steps;
        a.y += (a.vy * dt) / steps;
        if (a.y >= GY || (a.x > HALL.x1 && a.x < HALL.x2 && a.y <= HALL.ceil)) {
          a.stuck = true;
          break;
        }
        // rope or token
        let hitIdx = -1;
        skillTokens.forEach((tok, i) => {
          if (hitIdx >= 0 || this.collected.has(tok.id)) return;
          const pos = this.tokenPos(i);
          if (Math.hypot(pos.x - a.x, pos.y - a.y) < 19) hitIdx = i;
          else if (a.y > HALL.ceil && a.y < pos.y) {
            const ropeX = lerp(tok.x, pos.x, (a.y - HALL.ceil) / Math.max(1, pos.y - HALL.ceil));
            if (Math.abs(ropeX - a.x) < 4) hitIdx = i;
          }
        });
        if (hitIdx >= 0) {
          this.collectToken(hitIdx);
          a.stuck = true;
          a.life = 2.5;
          break;
        }
      }
    }
    this.arrows = this.arrows.filter((a) => a.life < 3.5);

    for (const f of this.falling) {
      f.vy += 900 * dt;
      f.y += f.vy * dt;
      f.rot += dt * 6;
    }
    this.falling = this.falling.filter((f) => f.y < GY + 40);

    for (const t of this.thrown) {
      t.vy += 600 * dt;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
    }
    this.thrown = this.thrown.filter((t) => {
      const hitTile = this.solidTileAt(t.x, t.y);
      if (hitTile || t.y >= GY || t.x < 0 || t.x > WORLD_W) {
        this.sfx.play("boom");
        this.burst(t.x, Math.min(t.y, GY), "#c9b18a", 22, 300);
        if (hitTile) {
          for (const tt of this.tiles) {
            if (tt.alive && Math.hypot(tt.x + TILE / 2 - t.x, tt.y + TILE / 2 - t.y) < 44) this.killTile(tt);
          }
        }
        return false;
      }
      return true;
    });
  }

  updateParticles(dt: number) {
    for (const q of this.particles) {
      q.life += dt;
      q.vy += q.g * dt;
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      if (q.g > 0 && q.y > GY) {
        q.y = GY;
        q.vy *= -0.3;
        q.vx *= 0.6;
      }
    }
    this.particles = this.particles.filter((q) => q.life < q.max);
    if (this.particles.length > 600) this.particles.splice(0, this.particles.length - 600);
  }

  updatePickups() {
    const p = this.p;
    if (!this.found.has("keycard") && Math.abs(p.x - KEYCARD.x) < 26 && Math.abs(p.y - KEYCARD.y) < 40) {
      this.burst(KEYCARD.x, p.y - 20, "#5ff3ff", 20);
      this.findSecret("keycard");
    }
    for (const egg of this.eggs) {
      if (egg.revealed && !egg.taken && Math.hypot(p.x - egg.x, p.y - 23 - egg.y) < 34) {
        egg.taken = true;
        this.burst(egg.x, egg.y, "#ffd66b", 30, 260);
        this.findSecret(`egg-${egg.tower}`);
      }
    }
  }

  interactables(): Interactable[] {
    const list: Interactable[] = [];
    const p = this.p;
    if (p.area === "lab") {
      papers.forEach((paper, i) => {
        const x = CAMPUS.x1 + 110 + i * 230;
        list.push({ x1: x - 20, x2: x + 170, y: CAMPUS.labFloor, key: "E", label: "Read the paper", run: () => this.ev.modal({ kind: "paper", paper }) });
      });
      list.push({
        x1: CAMPUS.elevatorX - 20,
        x2: CAMPUS.elevatorX + 80,
        y: CAMPUS.labFloor,
        key: "E",
        label: "Elevator up",
        run: () => {
          p.area = "city";
          p.y = GY;
          p.vy = 0;
          p.onGround = true;
          p.platform = null;
          this.sfx.play("use");
        },
      });
      return list;
    }

    for (const b of booths) {
      list.push({
        x1: b.x + 10,
        x2: b.x + MALL.boothW - 10,
        y: GY - b.floor * MALL.floorH,
        key: "E",
        label: `Open ${b.project.name}`,
        run: () => {
          this.viewedProjects.add(b.project.slug);
          this.emitProgress();
          this.ev.modal({ kind: "project", booth: b });
        },
      });
    }
    careerFloors.forEach((job, k) => {
      list.push({
        x1: TOWER.x1 + 10,
        x2: TOWER.x2 - 10,
        y: GY - k * TOWER.floorH,
        key: "E",
        label: `Read: ${job.company.split(",")[0]}`,
        run: () => {
          this.viewedJobs.add(job.slug);
          this.emitProgress();
          this.ev.modal({ kind: "job", job, floor: k });
        },
      });
    });
    if (p.mode === "walk") {
      list.push({
        x1: MACHINE.x - 50,
        x2: MACHINE.x + 50,
        y: MACHINE.y,
        key: "E",
        label: "Climb into the machine",
        run: () => {
          p.mode = "super";
          p.onGround = false;
          p.platform = null;
          p.vy = -200;
          this.carrying = false;
          this.sfx.play("hero");
          this.burst(p.x, p.y - 30, "#ff5fa8", 30, 260);
          this.ev.toast("SUPER MODE", "WASD fly · Shift rocket · Mouse laser · F grab & throw · X power down");
          this.emitProgress();
        },
      });
    }
    list.push({
      x1: CONTACT.billboardX + 40,
      x2: CONTACT.billboardX + CONTACT.billboardW - 40,
      y: GY,
      key: "E",
      label: "Copy my email",
      run: () => this.ev.copy(contactLinks.email),
    });
    list.push({ x1: CONTACT.mailboxX - 30, x2: CONTACT.mailboxX + 40, y: GY, key: "E", label: "Send me a message", run: () => this.ev.modal({ kind: "contact" }) });
    list.push({ x1: CONTACT.linkedinX - 25, x2: CONTACT.linkedinX + 45, y: GY, key: "E", label: "Open LinkedIn", run: () => this.ev.link("linkedin") });
    list.push({ x1: CONTACT.githubX - 25, x2: CONTACT.githubX + 45, y: GY, key: "E", label: "Open GitHub", run: () => this.ev.link("github") });
    list.push({
      x1: CONTACT.flagX - 40,
      x2: CONTACT.flagX + 40,
      y: GY,
      key: "E",
      label: this.flagUp ? "Flag is up" : "Raise the HIRE ME flag",
      run: () => {
        if (!this.flagUp) {
          this.flagUp = true;
          this.sfx.play("secret");
          this.ev.toast("Flag raised", "Recruiters within a 5 mile radius have been notified. (Not really. Email works better.)");
        }
      },
    });
    diplomas.forEach((edu, i) => {
      const x = CAMPUS.x1 + 90 + i * 230;
      list.push({ x1: x - 10, x2: x + 170, y: GY, key: "E", label: `Read: ${edu.degree}`, run: () => this.ev.modal({ kind: "edu", edu }) });
    });
    list.push({
      x1: CAMPUS.deskX - 50,
      x2: CAMPUS.deskX + 110,
      y: GY,
      key: "E",
      label: "Talk to reception",
      run: () => {
        this.deskTalkT = 4;
        this.deskLine = this.found.has("keycard")
          ? "Keycard checks out. The elevator's all yours."
          : "The lab is staff only. Lost your keycard? Last seen on the mall roof.";
        this.sfx.play("use");
      },
    });
    list.push({
      x1: CAMPUS.elevatorX - 20,
      x2: CAMPUS.elevatorX + 80,
      y: GY,
      key: "E",
      label: this.found.has("keycard") ? "Take the elevator to LAB" : "Elevator (staff only)",
      run: () => {
        if (!this.found.has("keycard")) {
          this.sfx.play("deny");
          this.deskTalkT = 4;
          this.deskLine = "Whoa, staff only down there. Find the keycard first.";
          return;
        }
        p.area = "lab";
        p.y = CAMPUS.labFloor;
        p.vy = 0;
        p.onGround = true;
        p.platform = null;
        this.camY = CAMPUS.labFloor - this.viewH * 0.8;
        this.sfx.play("use");
        this.findSecret("lab");
      },
    });
    list.push({ x1: END_X - 40, x2: END_X + 200, y: GY, key: "E", label: "See your report", run: () => this.ev.modal({ kind: "report" }) });
    return list;
  }

  updateInteract() {
    const p = this.p;
    const prompts: Prompt[] = [];
    if (p.mode === "walk" || p.area === "lab") {
      const near = this.interactables().find((it) => p.x >= it.x1 && p.x <= it.x2 && Math.abs(p.y - it.y) < 24);
      if (near) {
        prompts.push({ key: near.key, label: near.label });
        if (this.hit("e", "enter")) near.run();
      }
    }
    // The sign
    if (p.mode === "walk") {
      if (this.carrying) {
        prompts.push({ key: "Q", label: "Put down" });
        if (this.hit("q")) {
          this.carrying = false;
          this.sign = { x: p.x + p.face * 18, y: p.y };
          this.sfx.play("land");
        }
      } else if (!this.hasBow && Math.abs(p.x - this.sign.x) < 40 && Math.abs(p.y - this.sign.y) < 30 && p.area === "city") {
        prompts.push({ key: "Q", label: "Pick up the sign" });
        if (this.hit("q")) {
          this.carrying = true;
          this.sfx.play("use");
        }
      }
      for (const lift of this.lifts) {
        if (p.onGround && p.platform === lift) prompts.unshift({ key: "W/S", label: "Ride the lift" });
      }
    } else {
      prompts.push({ key: "F", label: this.grabbed ? "Throw" : "Grab" }, { key: "X", label: "Power down" });
    }
    const sig = prompts.map((x) => x.key + x.label).join("|");
    if (sig !== this.lastPrompts) {
      this.lastPrompts = sig;
      this.ev.prompts(prompts);
    }
  }

  updateCamera(dt: number) {
    const p = this.p;
    const tx = clamp(p.x - this.viewW / 2, 0, Math.max(0, WORLD_W - this.viewW));
    const base = GY - this.viewH * 0.815;
    let ty = base;
    if (p.area === "lab") ty = CAMPUS.labFloor - this.viewH * 0.8;
    else if (p.y < GY - 150) ty = Math.min(base, p.y - this.viewH * 0.6);
    this.camX = lerp(this.camX, tx, Math.min(1, dt * 8));
    this.camY = lerp(this.camY, ty, Math.min(1, dt * 5));
  }

  /* ------------------------------------------------------------- render */

  daylight() {
    // Starts at dusk, a full day every 4 minutes.
    return 0.5 - 0.5 * Math.cos(Math.PI * 2 * (this.time / 240 + 0.62));
  }

  render(ctx: CanvasRenderingContext2D) {
    const s = this.scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const day = this.daylight();
    this.drawSky(ctx, day);
    ctx.setTransform(s, 0, 0, s, -this.camX * s, -this.camY * s);
    this.drawSkyline(ctx, day, 0.25, 0);
    this.drawSkyline(ctx, day, 0.5, 1);
    this.drawGround(ctx);
    this.drawWorld(ctx, day);
    this.drawEntities(ctx);
    this.drawPlayer(ctx);
    this.drawFx(ctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.drawZoneSign(ctx);
  }

  /** Renders a still of a spot in the world for the tutorial cards. */
  renderPreview(ctx: CanvasRenderingContext2D, w: number, h: number, cam: { x: number; y: number; zoom: number }, pose: { x: number; y: number; mode?: "walk" | "super"; area?: "city" | "lab"; bow?: boolean }) {
    const saved = { w: this.w, h: this.h, camX: this.camX, camY: this.camY, p: { ...this.p }, bow: this.hasBow, carrying: this.carrying, charge: this.charge, laser: this.laserOn };
    this.resize(w, h);
    this.scale *= cam.zoom;
    this.viewW = w / this.scale;
    this.viewH = h / this.scale;
    this.camX = cam.x - this.viewW / 2;
    this.camY = cam.y - this.viewH / 2;
    Object.assign(this.p, { x: pose.x, y: pose.y, mode: pose.mode ?? "walk", area: pose.area ?? "city", vx: 0, walkT: 0, onGround: true, face: 1 });
    this.hasBow = Boolean(pose.bow);
    this.charge = pose.bow ? 0.8 : 0;
    this.carrying = false;
    this.laserOn = pose.mode === "super";
    if (this.laserOn) this.laserEnd = { x: pose.x + 260, y: pose.y + 120 };
    const savedMouse = { ...this.mouse };
    this.mouse.x = (pose.x + 200 - this.camX) * this.scale;
    this.mouse.y = (pose.y - 160 - this.camY) * this.scale;
    this.render(ctx);
    Object.assign(this.mouse, savedMouse);
    Object.assign(this.p, saved.p);
    this.hasBow = saved.bow;
    this.carrying = saved.carrying;
    this.charge = saved.charge;
    this.laserOn = saved.laser;
    this.resize(saved.w, saved.h);
    this.camX = saved.camX;
    this.camY = saved.camY;
  }

  drawSky(ctx: CanvasRenderingContext2D, day: number) {
    const g = ctx.createLinearGradient(0, 0, 0, this.h);
    const dusk = Math.max(0, 1 - Math.abs(day - 0.45) * 4);
    g.addColorStop(0, mix(mix("#0a0f2c", "#3f86d8", day), "#3b2a63", dusk * 0.5));
    g.addColorStop(1, mix(mix("#1f2a55", "#9fcbf3", day), "#f08a6a", dusk * 0.6));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
    if (day < 0.5) {
      ctx.globalAlpha = (0.5 - day) * 2;
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 90; i++) {
        const x = ((hash(i) * 3000 - this.camX * 0.05) % this.w + this.w) % this.w;
        const y = hash(i + 50) * this.h * 0.55;
        const tw = 0.5 + 0.5 * Math.sin(this.time * 2 + i);
        ctx.fillRect(x, y, 2, 2 * tw + 0.5);
      }
      ctx.globalAlpha = 1;
    }
    // sun / moon
    const arc = ((this.time / 240 + 0.62) % 1) * Math.PI * 2;
    const cx = this.w * 0.5 + Math.sin(arc) * this.w * 0.42;
    const cy = this.h * 0.75 - Math.cos(arc) * this.h * 0.6;
    ctx.fillStyle = "#fff4c2";
    ctx.beginPath();
    ctx.arc(cx, cy, 26 * this.scale, 0, Math.PI * 2);
    ctx.fill();
    const mx = this.w * 0.5 - Math.sin(arc) * this.w * 0.42;
    const my = this.h * 0.75 + Math.cos(arc) * this.h * 0.6;
    ctx.fillStyle = "#e9ecff";
    ctx.beginPath();
    ctx.arc(mx, my, 18 * this.scale, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSkyline(ctx: CanvasRenderingContext2D, day: number, par: number, layer: number) {
    const offX = this.camX * (1 - par);
    const offY = this.camY * (1 - par) * 0.6;
    const spacing = layer ? 110 : 150;
    const startI = Math.floor((this.camX - offX) / spacing) - 2;
    const endI = startI + Math.ceil(this.viewW / spacing) + 4;
    const body = layer ? mix("#2a3150", "#8e99ad", day) : mix("#1a2140", "#aab5c8", day);
    const win = layer ? mix("#ffd66b", "#c9d3e2", day) : mix("#c9a94e", "#c3cddb", day);
    const dark = layer ? mix("#20263f", "#7d889c", day) : mix("#161b33", "#9aa5b8", day);
    for (let i = startI; i < endI; i++) {
      const r = hash(i * (layer + 1.3));
      const w = spacing * (0.6 + r * 0.7);
      const hgt = (layer ? 160 : 260) + hash(i * 9.1 + layer) * (layer ? 220 : 240);
      const x = i * spacing + offX + (hash(i * 4.7) - 0.5) * 30;
      const top = GY - hgt + offY;
      ctx.fillStyle = body;
      ctx.fillRect(x, top, w, GY - top + 2);
      ctx.fillStyle = dark;
      ctx.fillRect(x + w - 6, top, 6, GY - top);
      for (let wy = top + 14; wy < GY - 14; wy += 22) {
        for (let wx = x + 10; wx < x + w - 14; wx += 18) {
          const lit = hash(wx * 0.13 + wy * 0.71) < (day < 0.5 ? 0.55 : 0.85);
          ctx.fillStyle = lit ? win : dark;
          ctx.fillRect(wx, wy, 7, 9);
        }
      }
    }
  }

  drawGround(ctx: CanvasRenderingContext2D) {
    const x0 = this.camX - 10;
    const x1 = this.camX + this.viewW + 10;
    const bottom = this.camY + this.viewH + 10;
    if (this.dirt) {
      const pat = ctx.createPattern(this.dirt, "repeat");
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(x0, GY, x1 - x0, bottom - GY);
      }
    } else {
      ctx.fillStyle = "#6b4a2f";
      ctx.fillRect(x0, GY, x1 - x0, bottom - GY);
    }
    // grass in parks, sidewalk downtown, real floors inside buildings
    const indoor: [number, number, string, string][] = [
      [MALL.x1, MALL_X2, "#b9b2a2", "#8d8778"],
      [HALL.x1, HALL.x2, "#8d6440", "#6a4a2c"],
      [TOWER.x1 - 10, TOWER.x2 + 10, "#b9b2a2", "#8d8778"],
      [CAMPUS.x1, CAMPUS.x2, "#cbbf9e", "#a89c7c"],
    ];
    for (const z of zones) {
      if (z.x2 < x0 || z.x1 > x1) continue;
      const paved = z.key === "downtown" || z.key === "career" || z.key === "campus";
      ctx.fillStyle = paved ? "#9a9aa6" : "#3f9a3a";
      ctx.fillRect(z.x1, GY, z.x2 - z.x1, 8);
      ctx.fillStyle = paved ? "#7c7c88" : "#2f7f2c";
      for (let x = Math.max(z.x1, Math.floor(x0 / 8) * 8); x < Math.min(z.x2, x1); x += 8) {
        if (hash(x) < 0.5) ctx.fillRect(x, GY + (paved ? 6 : 4), 4, paved ? 2 : 4);
      }
    }
    for (const [a, b, top, edge] of indoor) {
      if (b < x0 || a > x1) continue;
      ctx.fillStyle = top;
      ctx.fillRect(a, GY, b - a, 10);
      ctx.fillStyle = edge;
      ctx.fillRect(a, GY + 8, b - a, 2);
    }
  }

  neonText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, maxW?: number, font = this.fonts.display) {
    ctx.font = `700 ${size}px ${font}`;
    let sz = size;
    if (maxW) {
      while (ctx.measureText(text).width > maxW && sz > 8) {
        sz -= 1;
        ctx.font = `700 ${sz}px ${font}`;
      }
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  }

  text(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, opts: { align?: CanvasTextAlign; weight?: number; font?: string; maxW?: number } = {}) {
    let sz = size;
    const font = opts.font ?? this.fonts.display;
    ctx.font = `${opts.weight ?? 600} ${sz}px ${font}`;
    if (opts.maxW) {
      while (ctx.measureText(text).width > opts.maxW && sz > 7) {
        sz -= 0.5;
        ctx.font = `${opts.weight ?? 600} ${sz}px ${font}`;
      }
    }
    ctx.textAlign = opts.align ?? "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (ctx.measureText(t).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }

  visible(x1: number, x2: number) {
    return x2 > this.camX - 50 && x1 < this.camX + this.viewW + 50;
  }

  drawBillboard(ctx: CanvasRenderingContext2D, x: number, w: number, lines: { text: string; color: string; size: number }[], top = GY - 330, border = "#2b2f4a") {
    if (!this.visible(x, x + w)) return;
    const hgt = 190;
    ctx.fillStyle = "#3a3d4a";
    ctx.fillRect(x + 36, top + hgt, 8, GY - top - hgt);
    ctx.fillRect(x + w - 44, top + hgt, 8, GY - top - hgt);
    ctx.fillStyle = border;
    ctx.fillRect(x - 6, top - 6, w + 12, hgt + 12);
    ctx.fillStyle = "#0d0e1c";
    ctx.fillRect(x, top, w, hgt);
    const total = lines.reduce((a, l) => a + l.size * 1.25, 0);
    let y = top + hgt / 2 - total / 2;
    for (const l of lines) {
      y += (l.size * 1.25) / 2;
      this.neonText(ctx, l.text, x + w / 2, y, l.size, l.color, w - 30);
      y += (l.size * 1.25) / 2;
    }
  }

  drawWorld(ctx: CanvasRenderingContext2D, day: number) {
    for (const b of billboards) this.drawBillboard(ctx, b.x, b.w, b.lines);
    this.drawMall(ctx);
    this.drawHall(ctx);
    this.drawTower(ctx, day);
    this.drawContact(ctx);
    this.drawCampus(ctx);
    this.drawDowntown(ctx, day);
    this.drawEnd(ctx);
  }

  drawMall(ctx: CanvasRenderingContext2D) {
    const x1 = MALL.x1;
    const x2 = MALL_X2;
    if (!this.visible(x1, x2)) return;
    const roof = MALL.roofY;
    // facade
    if (this.bricks) {
      const pat = ctx.createPattern(this.bricks, "repeat");
      if (pat) ctx.fillStyle = pat;
    } else ctx.fillStyle = "#3a2c4f";
    ctx.fillRect(x1, roof, x2 - x1, GY - roof);
    // lift shaft
    const sx = MALL.liftX;
    ctx.fillStyle = "#16202e";
    ctx.fillRect(sx, roof - 40, MALL.liftW, GY - roof + 40);
    ctx.fillStyle = "#2b3a4f";
    ctx.fillRect(sx + MALL.liftW / 2 - 1, roof - 40, 2, GY - roof + 40);
    ctx.fillRect(sx, roof - 40, 4, GY - roof + 40);
    ctx.fillRect(sx + MALL.liftW - 4, roof - 40, 4, GY - roof + 40);
    this.drawLiftCar(ctx, this.lifts[0]);
    // floors
    for (let k = 0; k < MALL.floors; k++) {
      const fy = GY - k * MALL.floorH;
      const lab = mallFloorLabels[k];
      ctx.save();
      ctx.translate(sx + MALL.liftW + 16, fy - 100);
      ctx.rotate(-Math.PI / 2);
      this.neonText(ctx, lab, 0, 0, 13, ["#5ff3ff", "#c4a5ff", "#ff5fa8"][k], 180);
      ctx.restore();
      ctx.fillStyle = k === 0 ? "#5ff36b" : "#9aa0b4";
      ctx.beginPath();
      ctx.arc(sx + MALL.liftW + 16, fy - 18, 4, 0, Math.PI * 2);
      ctx.fill();
      // slab above this floor
      const sy = fy - MALL.floorH;
      ctx.fillStyle = "#b9b2a2";
      ctx.fillRect(sx + MALL.liftW, sy, x2 - sx - MALL.liftW, 12);
      ctx.fillStyle = "#8d8778";
      ctx.fillRect(sx + MALL.liftW, sy + 10, x2 - sx - MALL.liftW, 2);
    }
    ctx.fillStyle = "#b9b2a2";
    ctx.fillRect(x1, roof, sx - x1, 12);
    for (const b of booths) this.drawBooth(ctx, b);
    // roof parapet + sign
    ctx.fillStyle = "#2a2140";
    ctx.fillRect(x1 - 6, roof - 14, x2 - x1 + 12, 14);
    const signX = (sx + MALL.liftW + x2) / 2;
    ctx.fillStyle = "#3a3d4a";
    ctx.fillRect(signX - 150, roof - 30, 4, 18);
    ctx.fillRect(signX + 146, roof - 30, 4, 18);
    ctx.fillStyle = "#14102a";
    ctx.fillRect(signX - 180, roof - 90, 360, 62);
    this.neonText(ctx, "PROJECT MALL", signX, roof - 68, 30, "#ff5fa8");
    this.neonText(ctx, `${booths.length} PROJECTS INSIDE`, signX, roof - 42, 13, "#5ff3ff");
    // keycard
    if (!this.found.has("keycard")) {
      const bob = Math.sin(this.time * 3) * 4;
      ctx.shadowColor = "#5ff3ff";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#e6faff";
      ctx.fillRect(KEYCARD.x - 12, KEYCARD.y - 34 + bob, 24, 16);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#1e88e5";
      ctx.fillRect(KEYCARD.x - 12, KEYCARD.y - 34 + bob, 24, 5);
      ctx.fillStyle = "#333";
      ctx.fillRect(KEYCARD.x - 8, KEYCARD.y - 25 + bob, 7, 4);
    }
  }

  drawLiftCar(ctx: CanvasRenderingContext2D, lift: Lift) {
    const y = lift.y;
    ctx.fillStyle = "rgba(120,180,220,0.18)";
    ctx.fillRect(lift.x + 6, y - 96, lift.w - 12, 96);
    ctx.strokeStyle = "#8fb8d8";
    ctx.lineWidth = 3;
    ctx.strokeRect(lift.x + 6, y - 96, lift.w - 12, 96);
    ctx.fillStyle = "#cfd8e3";
    ctx.fillRect(lift.x + 4, y - 4, lift.w - 8, 6);
    ctx.fillStyle = "#4d6176";
    ctx.fillRect(lift.x + lift.w / 2 - 1, y - 400, 2, 304);
  }

  drawBooth(ctx: CanvasRenderingContext2D, b: Booth) {
    const fy = GY - b.floor * MALL.floorH;
    const x = b.x;
    const w = MALL.boothW;
    if (!this.visible(x, x + w)) return;
    // alcove
    ctx.fillStyle = "#211a33";
    ctx.fillRect(x + 8, fy - MALL.floorH + 22, w - 16, MALL.floorH - 22);
    // spotlight
    const g = ctx.createLinearGradient(0, fy - 170, 0, fy);
    g.addColorStop(0, "rgba(255,240,200,0.20)");
    g.addColorStop(1, "rgba(255,240,200,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 20, fy - 172);
    ctx.lineTo(x + w / 2 + 20, fy - 172);
    ctx.lineTo(x + w - 14, fy - 40);
    ctx.lineTo(x + 14, fy - 40);
    ctx.fill();
    ctx.fillStyle = "#ffe9a8";
    ctx.fillRect(x + w / 2 - 14, fy - 176, 28, 5);
    // screen
    const sx = x + 32;
    const sy = fy - 150;
    const sw = w - 64;
    const sh = 82;
    ctx.fillStyle = "#0a0b14";
    ctx.fillRect(sx - 5, sy - 5, sw + 10, sh + 10);
    const sg = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
    sg.addColorStop(0, `hsl(${b.hue} 55% 18%)`);
    sg.addColorStop(1, `hsl(${(b.hue + 40) % 360} 60% 10%)`);
    ctx.fillStyle = sg;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(sx, sy, sw, 7);
    ctx.fillStyle = `hsl(${b.hue} 90% 65%)`;
    ctx.fillRect(sx + 4, sy + 2, 3, 3);
    this.text(ctx, initials(b.project.name), sx + 34, sy + 40, 26, `hsl(${b.hue} 90% 72%)`, { weight: 800 });
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 4; i++) ctx.fillRect(sx + 66, sy + 20 + i * 11, sw - 80 - ((i * 23) % 30), 4);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.moveTo(sx + sw - 16, sy + sh - 18);
    ctx.lineTo(sx + sw - 16, sy + sh - 6);
    ctx.lineTo(sx + sw - 6, sy + sh - 12);
    ctx.fill();
    if (this.viewedProjects.has(b.project.slug)) {
      ctx.fillStyle = "#5ff36b";
      ctx.fillRect(sx + sw - 14, sy + 2, 10, 3);
    }
    // counter
    ctx.fillStyle = "#7a4e2c";
    ctx.fillRect(x + 6, fy - 40, w - 12, 40);
    ctx.fillStyle = "#a8724a";
    ctx.fillRect(x + 4, fy - 44, w - 8, 6);
    this.text(ctx, b.project.name.split(":")[0], x + w / 2, fy - 20, 16, "#f6efe6", { weight: 700, maxW: w - 30 });
    // pillar
    ctx.fillStyle = "#2c2342";
    ctx.fillRect(x + w - 4, fy - MALL.floorH + 12, 8, MALL.floorH - 12);
  }

  drawHall(ctx: CanvasRenderingContext2D) {
    const { x1, x2, ceil } = HALL;
    if (!this.visible(x1 - 50, x2 + 50)) return;
    // back wall: planks
    ctx.fillStyle = "#5a3b24";
    ctx.fillRect(x1, ceil, x2 - x1, GY - ceil);
    ctx.fillStyle = "#4e3320";
    for (let x = x1; x < x2; x += 26) ctx.fillRect(x, ceil, 2, GY - ceil);
    // roof
    ctx.fillStyle = "#3b2616";
    ctx.fillRect(x1 - 20, ceil - 30, x2 - x1 + 40, 30);
    ctx.fillStyle = "#6a6f80";
    ctx.fillRect(x1 - 26, ceil - 4, x2 - x1 + 52, 6);
    // door posts
    ctx.fillStyle = "#c7c1b3";
    ctx.fillRect(x1 - 8, ceil, 10, GY - ceil);
    ctx.fillRect(x2 - 2, ceil, 10, GY - ceil);
    // targets
    for (let x = x1 + 200; x < x2 - 100; x += 320) {
      ctx.fillStyle = "#3a3d4a";
      ctx.fillRect(x - 2, GY - 70, 4, 70);
      for (const [r, c] of [[24, "#f2f2f2"], [19, "#e53935"], [13, "#f2f2f2"], [7, "#e53935"]] as const) {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x, GY - 90, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    this.text(ctx, `TROPHIES ${this.collected.size}/${skillTokens.length}`, x1 + 90, ceil + 22, 14, "#ffd66b", { weight: 700, font: this.fonts.pixel });
    // tokens
    skillTokens.forEach((tok, i) => {
      if (this.collected.has(tok.id)) return;
      const pos = this.tokenPos(i);
      ctx.strokeStyle = "#d8c9a3";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tok.x, ceil);
      ctx.lineTo(pos.x, pos.y - 17);
      ctx.stroke();
      this.drawToken(ctx, i, pos.x, pos.y, pos.a);
    });
    // empty hooks for collected ones
    ctx.fillStyle = "#8a8f9f";
    skillTokens.forEach((tok) => {
      if (this.collected.has(tok.id)) ctx.fillRect(tok.x - 2, ceil, 4, 6);
    });
    // bow stand
    if (!this.hasBow) {
      const bx = x1 + 40;
      ctx.fillStyle = "#3a3d4a";
      ctx.fillRect(bx - 2, GY - 60, 4, 60);
      ctx.strokeStyle = "#a8724a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bx + 6, GY - 70, 22, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = "#eee";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + 6, GY - 92);
      ctx.lineTo(bx + 6, GY - 48);
      ctx.stroke();
    }
  }

  drawToken(ctx: CanvasRenderingContext2D, i: number, x: number, y: number, a: number) {
    const tok = skillTokens[i];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-a * 0.5);
    ctx.fillStyle = "#151827";
    ctx.fillRect(-17, -17, 34, 34);
    ctx.strokeStyle = "#5b6185";
    ctx.lineWidth = 2;
    ctx.strokeRect(-17, -17, 34, 34);
    const img = tok.icon ? this.images.get(tok.icon) : undefined;
    if (img && img.complete && img.naturalWidth) {
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = "#f4f4f8";
      ctx.fillRect(-13, -13, 26, 26);
      ctx.drawImage(img, -11, -11, 22, 22);
      ctx.imageSmoothingEnabled = false;
    } else {
      this.text(ctx, tok.short, 0, 1, tok.short.length > 2 ? 11 : 14, "#5ff3ff", { weight: 800 });
    }
    ctx.restore();
    this.text(ctx, tok.name, x, y + 27, 10, "#f3e6c8", { weight: 600, maxW: 80 });
  }

  drawTower(ctx: CanvasRenderingContext2D, day: number) {
    const { x1, x2, liftX, liftW, floorH } = TOWER;
    if (!this.visible(x1, x2)) return;
    const roof = TOWER_ROOF;
    ctx.fillStyle = mix("#2d3550", "#cbb98f", day * 0.6);
    ctx.fillRect(x1 - 10, roof - 10, x2 - x1 + 20, GY - roof + 10);
    careerFloors.forEach((job, k) => {
      const fy = GY - k * floorH;
      const top = fy - floorH;
      ctx.fillStyle = k % 2 ? "#1d2338" : "#232a42";
      ctx.fillRect(x1 + 6, top + 10, x2 - x1 - 12, floorH - 10);
      // left room: logo + role
      const lx = x1 + 24;
      const logo = LOGOS[job.slug];
      const img = logo ? this.images.get(logo) : undefined;
      ctx.fillStyle = "#f4f4f8";
      ctx.fillRect(lx, top + 30, 48, 48);
      if (img && img.complete && img.naturalWidth) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, lx + 2, top + 32, 44, 44);
        ctx.imageSmoothingEnabled = false;
      } else this.text(ctx, initials(job.company), lx + 24, top + 54, 18, "#1f2f57", { weight: 800 });
      const tw = liftX - lx - 70;
      this.text(ctx, job.company.split(",")[0], lx + 60, top + 38, 16, "#ffffff", { align: "left", weight: 700, maxW: tw });
      this.text(ctx, job.role, lx + 60, top + 60, 12, "#c4a5ff", { align: "left", weight: 600, maxW: tw });
      this.text(ctx, `${job.start} – ${job.end}`, lx + 60, top + 80, 11, "#9aa3c0", { align: "left", weight: 500, font: this.fonts.mono, maxW: tw });
      this.text(ctx, `F${k + 1}`, lx, top + 110, 12, "#5ff3ff", { align: "left", weight: 700, font: this.fonts.pixel });
      if (job.current) this.neonText(ctx, "● NOW", lx + 60, top + 112, 11, "#5ff36b");
      // right room: metrics
      const rx = liftX + liftW + 20;
      const rw = x2 - rx - 24;
      const ms = (job.metrics ?? []).slice(0, 3);
      ms.forEach((m, i) => {
        const bw = rw / Math.max(1, ms.length) - 8;
        const bx = rx + i * (bw + 8);
        ctx.fillStyle = "#121628";
        ctx.fillRect(bx, top + 34, bw, 76);
        ctx.strokeStyle = "#3a4166";
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, top + 34, bw, 76);
        this.text(ctx, m.value, bx + bw / 2, top + 60, 18, "#ffd66b", { weight: 800, maxW: bw - 10 });
        const lines = (() => {
          ctx.font = `500 10px ${this.fonts.display}`;
          return this.wrap(ctx, m.label, bw - 12).slice(0, 2);
        })();
        lines.forEach((ln, j) => this.text(ctx, ln, bx + bw / 2, top + 84 + j * 12, 10, "#b9c0da", { weight: 500 }));
      });
      // slab
      ctx.fillStyle = "#b9b2a2";
      ctx.fillRect(x1 - 10, top, x2 - x1 + 20, 10);
      if (this.viewedJobs.has(job.slug)) {
        ctx.fillStyle = "#5ff36b";
        ctx.fillRect(x2 - 22, top + 16, 10, 4);
      }
    });
    // shaft
    ctx.fillStyle = "#121a26";
    ctx.fillRect(liftX, roof, liftW, GY - roof);
    ctx.fillStyle = "#2b3a4f";
    ctx.fillRect(liftX, roof, 4, GY - roof);
    ctx.fillRect(liftX + liftW - 4, roof, 4, GY - roof);
    this.drawLiftCar(ctx, this.lifts[1]);
    // roof
    ctx.fillStyle = "#b9b2a2";
    ctx.fillRect(x1 - 14, roof - 4, liftX - x1 + 14, 10);
    ctx.fillRect(liftX + liftW, roof - 4, x2 - liftX - liftW + 14, 10);
    ctx.fillStyle = "#3a3d4a";
    ctx.fillRect(x1 + 40, roof - 120, 4, 116);
    ctx.fillStyle = Math.sin(this.time * 4) > 0 ? "#ff3b3b" : "#5a1a1a";
    ctx.fillRect(x1 + 38, roof - 126, 8, 8);
    // tower sign
    ctx.fillStyle = "#14102a";
    ctx.fillRect(x1 + 70, roof - 62, 200, 44);
    this.neonText(ctx, "CAREER TOWER", x1 + 170, roof - 40, 20, "#ffd66b");
    if (this.p.mode === "walk") this.drawMachine(ctx, MACHINE.x, MACHINE.y);
    else {
      ctx.fillStyle = "#3a3d4a";
      ctx.fillRect(MACHINE.x - 34, MACHINE.y - 12, 68, 12);
    }
  }

  drawMachine(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#3a3d4a";
    ctx.fillRect(x - 40, y - 12, 80, 12);
    ctx.fillStyle = "#8a90a6";
    ctx.fillRect(x - 22, y - 46, 12, 34);
    ctx.fillRect(x + 10, y - 46, 12, 34);
    ctx.fillStyle = "#c7ccda";
    ctx.fillRect(x - 30, y - 110, 60, 66);
    ctx.fillStyle = "#e53958";
    ctx.fillRect(x - 30, y - 110, 60, 10);
    ctx.fillStyle = "#14102a";
    ctx.fillRect(x - 20, y - 96, 40, 18);
    ctx.fillStyle = `rgba(95,243,255,${0.6 + 0.4 * Math.sin(this.time * 5)})`;
    ctx.fillRect(x - 16, y - 92, 32, 8);
    ctx.fillStyle = "#8a90a6";
    ctx.fillRect(x - 42, y - 100, 12, 40);
    ctx.fillRect(x + 30, y - 100, 12, 40);
    ctx.fillStyle = "#ffd66b";
    ctx.fillRect(x - 8, y - 70, 16, 16);
    this.text(ctx, "?", x, y - 62, 12, "#14102a", { weight: 800 });
  }

  drawContact(ctx: CanvasRenderingContext2D) {
    const c = CONTACT;
    if (!this.visible(c.billboardX - 20, c.flagX + 120)) return;
    this.drawBillboard(
      ctx,
      c.billboardX,
      c.billboardW,
      [
        { text: "EMAIL ME", color: "#ff5fa8", size: 22 },
        { text: contactLinks.email, color: "#5ff3ff", size: 22 },
        { text: "E TO COPY IT", color: "#c4a5ff", size: 13 },
      ],
      GY - 250,
      "#ff5fa8",
    );
    // mailbox
    const mx = c.mailboxX;
    ctx.fillStyle = "#3a3d4a";
    ctx.fillRect(mx + 4, GY - 50, 6, 50);
    ctx.fillStyle = "#1e5bd8";
    ctx.fillRect(mx - 14, GY - 82, 42, 34);
    ctx.fillStyle = "#2a6cf0";
    ctx.fillRect(mx - 14, GY - 82, 42, 6);
    this.text(ctx, "MAIL", mx + 7, GY - 62, 10, "#ffffff", { weight: 800 });
    ctx.fillStyle = "#e53935";
    ctx.fillRect(mx + 28, GY - 80, 4, 16);
    // signposts
    const post = (x: number, label: string, bg: string) => {
      ctx.fillStyle = "#6a4a2c";
      ctx.fillRect(x + 8, GY - 60, 5, 60);
      ctx.fillStyle = bg;
      ctx.fillRect(x - 10, GY - 92, 42, 34);
      this.text(ctx, label, x + 11, GY - 75, 16, "#ffffff", { weight: 800 });
    };
    post(c.linkedinX, "in", "#0a66c2");
    post(c.githubX, "GH", "#24292f");
    // flag
    const fx = c.flagX;
    ctx.fillStyle = "#c9ccd6";
    ctx.fillRect(fx, GY - 230, 5, 230);
    ctx.fillStyle = "#ffd66b";
    ctx.fillRect(fx - 2, GY - 236, 9, 8);
    const fy = lerp(GY - 50, GY - 220, this.flagT);
    const wave = Math.sin(this.time * 6) * 3;
    ctx.fillStyle = "#ff3d8b";
    ctx.beginPath();
    ctx.moveTo(fx + 5, fy);
    ctx.lineTo(fx + 95, fy + wave);
    ctx.lineTo(fx + 95, fy + 40 + wave);
    ctx.lineTo(fx + 5, fy + 40);
    ctx.fill();
    this.text(ctx, "HIRE ME", fx + 50, fy + 20 + wave / 2, 14, "#ffffff", { weight: 800 });
  }

  drawCampus(ctx: CanvasRenderingContext2D) {
    const c = CAMPUS;
    if (!this.visible(c.x1, c.x2)) return;
    // building
    ctx.fillStyle = "#6e3530";
    ctx.fillRect(c.x1, c.top, c.x2 - c.x1, GY - c.top);
    ctx.fillStyle = "#5c2b27";
    for (let y = c.top + 8; y < GY; y += 12) ctx.fillRect(c.x1, y, c.x2 - c.x1, 2);
    ctx.fillStyle = "#463040";
    ctx.fillRect(c.x1 - 10, c.top - 16, c.x2 - c.x1 + 20, 16);
    ctx.fillStyle = "#14102a";
    ctx.fillRect((c.x1 + c.x2) / 2 - 140, c.top - 70, 280, 50);
    this.neonText(ctx, "CAMPUS", (c.x1 + c.x2) / 2, c.top - 52, 24, "#5ff3ff");
    this.neonText(ctx, "EDUCATION · RECEPTION", (c.x1 + c.x2) / 2, c.top - 30, 11, "#ff5fa8");
    // upper windows
    for (let x = c.x1 + 30; x < c.x2 - 40; x += 70) {
      ctx.fillStyle = "#f2d27a";
      ctx.fillRect(x, c.top + 24, 40, 50);
      ctx.fillStyle = "#3a2028";
      ctx.fillRect(x + 19, c.top + 24, 2, 50);
    }
    // lobby
    const lt = GY - 190;
    ctx.fillStyle = "#231d33";
    ctx.fillRect(c.x1 + 12, lt, c.x2 - c.x1 - 24, 190);
    ctx.fillStyle = "#cbbf9e";
    ctx.fillRect(c.x1 + 12, lt - 8, c.x2 - c.x1 - 24, 8);
    diplomas.forEach((edu, i) => {
      const x = c.x1 + 90 + i * 230;
      ctx.fillStyle = "#c79a3c";
      ctx.fillRect(x, lt + 26, 160, 100);
      ctx.fillStyle = "#f8f3e4";
      ctx.fillRect(x + 6, lt + 32, 148, 88);
      this.text(ctx, edu.school.split(" (")[0], x + 80, lt + 50, 12, "#2a2440", { weight: 800, maxW: 136 });
      this.text(ctx, edu.degree, x + 80, lt + 72, 11, "#5a4a2a", { weight: 600, maxW: 136 });
      this.text(ctx, `GPA ${edu.gpa}`, x + 80, lt + 92, 11, "#1f2f57", { weight: 700, maxW: 136 });
      this.text(ctx, `${edu.start} – ${edu.end}`, x + 80, lt + 108, 9, "#6a6a7a", { weight: 500, maxW: 136 });
    });
    // desk + receptionist
    const dx = c.deskX;
    this.drawPerson(ctx, dx + 30, GY - 30, { hair: "#4a2c1a", top: "#2e7d6b", skin: "#e0b08a" });
    ctx.fillStyle = "#6a4a2c";
    ctx.fillRect(dx - 20, GY - 46, 120, 46);
    ctx.fillStyle = "#8d6440";
    ctx.fillRect(dx - 24, GY - 52, 128, 8);
    this.text(ctx, "RECEPTION", dx + 40, GY - 26, 11, "#f6efe6", { weight: 700 });
    if (this.deskTalkT > 0) this.bubble(ctx, dx + 30, GY - 100, this.deskLine);
    // elevator
    const ex = c.elevatorX;
    ctx.fillStyle = "#8a90a6";
    ctx.fillRect(ex - 6, GY - 130, 72, 130);
    ctx.fillStyle = "#b8bdcb";
    ctx.fillRect(ex, GY - 124, 29, 124);
    ctx.fillRect(ex + 31, GY - 124, 29, 124);
    ctx.fillStyle = "#14102a";
    ctx.fillRect(ex + 8, GY - 160, 44, 22);
    this.neonText(ctx, "LAB", ex + 30, GY - 149, 13, this.found.has("keycard") ? "#5ff36b" : "#ff5f5f");
    // underground lab, only once the camera goes looking
    if (this.p.area === "lab" || this.camY > 60) this.drawLab(ctx);
  }

  drawLab(ctx: CanvasRenderingContext2D) {
    const c = CAMPUS;
    ctx.fillStyle = "#0b0f1a";
    ctx.fillRect(c.x1, c.labTop, c.x2 - c.x1, c.labFloor - c.labTop);
    ctx.fillStyle = "#1a2236";
    for (let x = c.x1; x < c.x2; x += 40) ctx.fillRect(x, c.labTop, 1, c.labFloor - c.labTop);
    ctx.fillStyle = "#2a3550";
    ctx.fillRect(c.x1, c.labFloor, c.x2 - c.x1, 10);
    ctx.fillStyle = "#3b2616";
    ctx.fillRect(c.x1 - 10, c.labTop - 10, c.x2 - c.x1 + 20, 10);
    this.neonText(ctx, "SECRET LAB · RESEARCH", (c.x1 + c.x2) / 2, c.labTop + 24, 16, "#5ff36b");
    papers.forEach((paper, i) => {
      const x = c.x1 + 110 + i * 230;
      const y = c.labFloor - 170;
      ctx.fillStyle = "#06070d";
      ctx.fillRect(x - 6, y - 6, 172, 112);
      ctx.shadowColor = "#5ff3ff";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#0f2a35";
      ctx.fillRect(x, y, 160, 100);
      ctx.shadowBlur = 0;
      this.text(ctx, `${paper.venue.match(/\(([^)]+)\)/)?.[1] ?? paper.venue} · ${paper.year}`, x + 80, y + 14, 10, "#ffd66b", { weight: 700, maxW: 150, font: this.fonts.mono });
      ctx.font = `600 11px ${this.fonts.display}`;
      this.wrap(ctx, paper.title, 148)
        .slice(0, 5)
        .forEach((ln, j) => this.text(ctx, ln, x + 80, y + 34 + j * 13, 11, "#c9f6ff", { weight: 600 }));
      ctx.fillStyle = "#3a3d4a";
      ctx.fillRect(x + 76, y + 106, 8, c.labFloor - y - 106);
    });
    // racks
    for (let i = 0; i < 2; i++) {
      const rx = c.x2 - 230 + i * 50;
      ctx.fillStyle = "#1a1d2a";
      ctx.fillRect(rx, c.labFloor - 140, 40, 140);
      for (let j = 0; j < 9; j++) {
        ctx.fillStyle = "#2a2f40";
        ctx.fillRect(rx + 4, c.labFloor - 134 + j * 15, 32, 11);
        ctx.fillStyle = hash(j + i * 10 + Math.floor(this.time * 4)) > 0.5 ? "#5ff36b" : "#1d4a2a";
        ctx.fillRect(rx + 28, c.labFloor - 130 + j * 15, 4, 3);
      }
    }
    const ex = c.elevatorX;
    ctx.fillStyle = "#8a90a6";
    ctx.fillRect(ex - 6, c.labFloor - 130, 72, 130);
    ctx.fillStyle = "#b8bdcb";
    ctx.fillRect(ex, c.labFloor - 124, 29, 124);
    ctx.fillRect(ex + 31, c.labFloor - 124, 29, 124);
  }

  drawDowntown(ctx: CanvasRenderingContext2D, day: number) {
    if (!this.visible(towerSpecs[0].x - 20, towerSpecs[2].x + 300)) return;
    // Foreground brick towers, deliberately unlike the grey skyline so it's
    // obvious which buildings can be broken.
    const palettes = [
      ["#7a2e22", "#c0563d"],
      ["#1f4f5a", "#3f8f9c"],
      ["#4a2e6b", "#8a5bb0"],
    ];
    towerSpecs.forEach((spec, ti) => {
      const w = spec.cols * TILE;
      const top = GY - spec.rows * TILE;
      if (!this.visible(spec.x - 10, spec.x + w + 10)) return;
      // footprint outline so missing chunks read as holes
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(spec.x - 1, top - 1, w + 2, GY - top + 1);
      const alive = this.tiles.some((t) => t.tower === ti && t.alive);
      if (alive) {
        ctx.fillStyle = "#14102a";
        ctx.fillRect(spec.x + w / 2 - 40, GY - 26, 80, 20);
        ctx.fillStyle = "#ffd66b";
        for (let i = 0; i < 80; i += 10) ctx.fillRect(spec.x + w / 2 - 40 + i, GY - 26, 5, 3);
        this.text(ctx, "SEALED", spec.x + w / 2, GY - 14, 10, "#ffd66b", { weight: 800, font: this.fonts.pixel });
      }
    });
    for (const t of this.tiles) {
      if (!t.alive || !this.visible(t.x, t.x + TILE)) continue;
      const [dark, light] = palettes[t.tower % palettes.length];
      ctx.fillStyle = mix(dark, light, 0.35 + day * 0.45 + t.shade * 0.15);
      ctx.fillRect(t.x, t.y, TILE, TILE);
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(t.x, t.y + TILE - 2, TILE, 2);
      ctx.fillRect(t.x + TILE - 2, t.y, 2, TILE);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(t.x, t.y, TILE, 2);
      ctx.fillStyle = hash(t.x * 0.3 + t.y) < (day < 0.5 ? 0.6 : 0.25) ? "#ffd66b" : "#151a2c";
      ctx.fillRect(t.x + 7, t.y + 6, 10, 10);
      if (t.hp < 1) {
        ctx.fillStyle = `rgba(0,0,0,${(1 - t.hp) * 0.6})`;
        ctx.fillRect(t.x, t.y, TILE, TILE);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(t.x + 4, t.y + 12, 8, 1);
        ctx.fillRect(t.x + 11, t.y + 8, 1, 6);
      }
    }
    for (const egg of this.eggs) {
      if (!egg.revealed || egg.taken) continue;
      const bob = Math.sin(this.time * 3 + egg.tower) * 3;
      ctx.shadowColor = "#ffd66b";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#fff1b8";
      ctx.beginPath();
      ctx.ellipse(egg.x, egg.y + bob, 9, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ff5fa8";
      ctx.fillRect(egg.x - 7, egg.y + bob - 1, 14, 3);
    }
  }

  drawEnd(ctx: CanvasRenderingContext2D) {
    if (!this.visible(END_X - 50, WORLD_W)) return;
    ctx.fillStyle = "#6a4a2c";
    ctx.fillRect(END_X + 30, GY - 90, 8, 90);
    ctx.fillRect(END_X + 150, GY - 90, 8, 90);
    ctx.fillStyle = "#a8724a";
    ctx.fillRect(END_X, GY - 170, 190, 90);
    ctx.fillStyle = "#7a4e2c";
    ctx.strokeStyle = "#5a3b24";
    ctx.lineWidth = 3;
    ctx.strokeRect(END_X, GY - 170, 190, 90);
    this.text(ctx, "END OF THE LINE", END_X + 95, GY - 145, 16, "#2a1a0e", { weight: 800 });
    this.text(ctx, "Thanks for playing!", END_X + 95, GY - 122, 12, "#2a1a0e", { weight: 600 });
    this.text(ctx, "E: your report", END_X + 95, GY - 102, 12, "#2a1a0e", { weight: 700, font: this.fonts.mono });
    // fence
    ctx.fillStyle = "#d9d2c0";
    for (let x = END_X + 230; x < WORLD_W; x += 18) ctx.fillRect(x, GY - 50, 8, 50);
    ctx.fillRect(END_X + 230, GY - 40, WORLD_W - END_X - 230, 6);
  }

  bubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
    ctx.font = `600 12px ${this.fonts.display}`;
    const lines = this.wrap(ctx, text, 200);
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20;
    const h = lines.length * 16 + 14;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 6, y);
    ctx.lineTo(x, y + 8);
    ctx.fill();
    lines.forEach((l, i) => this.text(ctx, l, x, y - h + 15 + i * 16, 12, "#14102a", { weight: 600 }));
  }

  drawPerson(ctx: CanvasRenderingContext2D, x: number, feet: number, c: { hair: string; top: string; skin: string }) {
    const px = 2.2;
    const ox = x - 6 * px;
    const oy = feet - 21 * px;
    BODY.forEach((row, r) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === ".") continue;
        ctx.fillStyle = ch === "h" ? c.hair : ch === "s" ? c.skin : ch === "n" || ch === "t" ? c.top : PAL[ch];
        ctx.fillRect(ox + i * px, oy + r * px, px + 0.3, px + 0.3);
      }
    });
  }

  drawEntities(ctx: CanvasRenderingContext2D) {
    // sign
    if (!this.carrying) this.drawSign(ctx, this.sign.x, this.sign.y, 0);
    for (const a of this.arrows) {
      const ang = a.stuck ? Math.atan2(a.vy, a.vx) : Math.atan2(a.vy, a.vx);
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(ang);
      ctx.globalAlpha = a.life > 2.5 ? Math.max(0, 1 - (a.life - 2.5)) : 1;
      ctx.fillStyle = "#c9a26b";
      ctx.fillRect(-22, -1, 22, 2);
      ctx.fillStyle = "#d8dce6";
      ctx.fillRect(0, -2, 5, 4);
      ctx.fillStyle = "#e53958";
      ctx.fillRect(-24, -3, 5, 6);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    for (const f of this.falling) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      this.drawToken(ctx, f.idx, 0, 0, 0);
      ctx.restore();
    }
    for (const t of this.thrown) {
      ctx.fillStyle = "#8d97ad";
      ctx.fillRect(t.x - 12, t.y - 12, 24, 24);
    }
  }

  drawSign(ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.fillStyle = "#6a4a2c";
    ctx.fillRect(-3, -70, 6, 70);
    ctx.fillStyle = "#c79a5c";
    ctx.fillRect(-44, -112, 88, 50);
    ctx.strokeStyle = "#7a5636";
    ctx.lineWidth = 3;
    ctx.strokeRect(-44, -112, 88, 50);
    this.text(ctx, "OPEN TO", 0, -96, 15, "#2a1a0e", { weight: 800 });
    this.text(ctx, "WORK", 0, -77, 17, "#2a1a0e", { weight: 800 });
    ctx.restore();
  }

  drawPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.p;
    if (p.area === "lab" && this.camY < 100) return;
    const sup = p.mode === "super";
    const ox = p.x - 6 * P;
    const oy = p.y - 21 * P - (sup ? Math.sin(this.time * 4) * 2 : 0);
    ctx.save();
    if (p.face < 0) {
      ctx.translate(p.x * 2, 0);
      ctx.scale(-1, 1);
    }
    if (sup) {
      // cape
      const flap = Math.sin(this.time * 10) * 4;
      ctx.fillStyle = "#e53958";
      ctx.beginPath();
      ctx.moveTo(ox + 3 * P, oy + 8 * P);
      ctx.lineTo(ox - 8 - Math.abs(p.vx) * 0.04, oy + 20 * P + flap);
      ctx.lineTo(ox + 4 * P, oy + 18 * P);
      ctx.fill();
    }
    // legs
    const step = Math.sin(p.walkT * 2);
    const legL = p.onGround || sup ? step * 3 : -3;
    const legR = p.onGround || sup ? -step * 3 : 3;
    ctx.fillStyle = PAL.p;
    ctx.fillRect(ox + 3 * P + legL, oy + 16 * P, 3 * P, 4 * P);
    ctx.fillRect(ox + 7 * P + legR, oy + 16 * P, 3 * P, 4 * P);
    ctx.fillStyle = PAL.k;
    ctx.fillRect(ox + 3 * P + legL, oy + 20 * P, 3.5 * P, P);
    ctx.fillRect(ox + 7 * P + legR, oy + 20 * P, 3.5 * P, P);
    // body
    BODY.forEach((row, r) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === ".") continue;
        ctx.fillStyle = PAL[ch];
        ctx.fillRect(ox + i * P, oy + r * P, P + 0.3, P + 0.3);
      }
    });
    // arm
    const armSwing = p.onGround ? -step * 2 : -4;
    ctx.fillStyle = PAL.n;
    if (this.carrying || this.grabbed) {
      ctx.fillRect(ox + 8 * P, oy + 3 * P, 2 * P, 6 * P);
    } else if (!this.hasBow) {
      ctx.fillRect(ox + 6 * P + armSwing, oy + 9 * P, 2 * P, 5 * P);
      ctx.fillStyle = PAL.s;
      ctx.fillRect(ox + 6 * P + armSwing, oy + 14 * P, 2 * P, P);
    }
    if (sup) {
      ctx.fillStyle = "#c7ccda";
      ctx.fillRect(ox + 2 * P, oy + 8 * P, 8 * P, 2 * P);
      ctx.fillStyle = "#e53958";
      ctx.fillRect(ox + 5 * P, oy + 10 * P, 2 * P, 2 * P);
    }
    ctx.restore();

    if (this.carrying) this.drawSign(ctx, p.x + p.face * 4, oy + 50, Math.sin(p.walkT * 2) * 0.06 + 0.12 * p.face);
    if (this.grabbed) {
      ctx.fillStyle = mix("#5a6078", "#a3a9b8", this.grabbed.shade);
      ctx.fillRect(p.x - 14, oy - 32, 28, 28);
      ctx.strokeStyle = "#2a3048";
      ctx.strokeRect(p.x - 14, oy - 32, 28, 28);
    }
    if (this.hasBow) this.drawBow(ctx);
    if (sup && this.laserOn) {
      const sx = p.x + p.face * 8;
      const sy = p.y - 32;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(95,243,255,0.35)";
      ctx.lineWidth = 12 + Math.sin(this.time * 40) * 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(this.laserEnd.x, this.laserEnd.y);
      ctx.stroke();
      ctx.strokeStyle = "#e9feff";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#e9feff";
      ctx.beginPath();
      ctx.arc(this.laserEnd.x, this.laserEnd.y, 6 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawBow(ctx: CanvasRenderingContext2D) {
    const p = this.p;
    const wm = this.worldMouse();
    const ox = p.x;
    const oy = p.y - 30;
    const ang = Math.atan2(wm.y - oy, wm.x - ox);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(ang);
    ctx.strokeStyle = "#a8724a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(10, 0, 18, -Math.PI / 2.2, Math.PI / 2.2);
    ctx.stroke();
    const pull = this.charge * 12;
    ctx.strokeStyle = "#eeeeee";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10 + 18 * Math.cos(-Math.PI / 2.2), 18 * Math.sin(-Math.PI / 2.2));
    ctx.lineTo(10 - pull, 0);
    ctx.lineTo(10 + 18 * Math.cos(Math.PI / 2.2), 18 * Math.sin(Math.PI / 2.2));
    ctx.stroke();
    if (this.charge > 0) {
      ctx.fillStyle = "#c9a26b";
      ctx.fillRect(10 - pull, -1, 26, 2);
      ctx.fillStyle = "#d8dce6";
      ctx.fillRect(36 - pull, -2, 5, 4);
    }
    ctx.restore();
    if (this.charge > 0) {
      // trajectory preview
      const sp = 450 + 900 * this.charge;
      let x = ox;
      let y = oy;
      let vx = Math.cos(ang) * sp;
      let vy = Math.sin(ang) * sp;
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      for (let i = 0; i < 16; i++) {
        for (let s = 0; s < 3; s++) {
          vy += 900 * 0.012;
          x += vx * 0.012;
          y += vy * 0.012;
        }
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
    }
  }

  drawFx(ctx: CanvasRenderingContext2D) {
    for (const q of this.particles) {
      ctx.globalAlpha = Math.max(0, 1 - q.life / q.max);
      ctx.fillStyle = q.color;
      ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
    }
    ctx.globalAlpha = 1;
  }

  drawZoneSign(ctx: CanvasRenderingContext2D) {
    const z = this.zoneAt(this.p.x);
    if (z.key === "start" || z.key === "end") return;
    const s = Math.min(1, this.scale);
    const w = 220 * s;
    const h = 46 * s;
    const x = this.w / 2 - w / 2;
    const swing = Math.sin(this.time * 1.5) * 0.015;
    ctx.save();
    ctx.translate(this.w / 2, 0);
    ctx.rotate(swing);
    ctx.translate(-this.w / 2, 0);
    ctx.fillStyle = "#3a3d4a";
    ctx.fillRect(x + 30 * s, 0, 2, 14 * s);
    ctx.fillRect(x + w - 32 * s, 0, 2, 14 * s);
    ctx.fillStyle = "#0d1626";
    ctx.fillRect(x, 14 * s, w, h);
    ctx.strokeStyle = "#5ff3ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, 14 * s + 3, w - 6, h - 6);
    ctx.font = `700 ${22 * s}px ${this.fonts.pixel}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#5ff3ff";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#e9feff";
    ctx.fillText(z.title, this.w / 2, 14 * s + h / 2 + 1);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

