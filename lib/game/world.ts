/**
 * Layout of the /play city. Every booth, skill, floor and paper is built from
 * lib/content.ts, so the game never drifts from the rest of the site.
 */
import {
  education,
  experience,
  links,
  profile,
  projectBySlug,
  publications,
  showcase,
  skills,
  type Education,
  type Experience,
  type Project,
  type Publication,
} from "@/lib/content";

/** Top of the ground, in world pixels. The world is 540 logical px tall. */
export const GY = 440;
export const VIEW_H = 540;
export const WORLD_W = 11400;
export const SPAWN_X = 300;

export interface Zone {
  key: string;
  title: string;
  x1: number;
  x2: number;
}

export const zones: Zone[] = [
  { key: "start", title: "WELCOME", x1: 0, x2: 1000 },
  { key: "mall", title: "PROJECTS", x1: 1000, x2: 3360 },
  { key: "skills", title: "SKILLS", x1: 3360, x2: 5520 },
  { key: "career", title: "CAREER", x1: 5520, x2: 6950 },
  { key: "contact", title: "CONTACT", x1: 6950, x2: 8080 },
  { key: "campus", title: "CAMPUS", x1: 8080, x2: 9420 },
  { key: "downtown", title: "DOWNTOWN", x1: 9420, x2: 10950 },
  { key: "end", title: "THE END", x1: 10950, x2: WORLD_W },
];

export interface Billboard {
  x: number;
  w: number;
  lines: { text: string; color: string; size: number }[];
}

const cyan = "#5ff3ff";
const pink = "#ff5fa8";
const violet = "#c4a5ff";
const gold = "#ffd66b";

const firstName = profile.name.split(" ")[0].toUpperCase();

export const billboards: Billboard[] = [
  {
    x: 300,
    w: 500,
    lines: [
      { text: profile.name.toUpperCase(), color: cyan, size: 40 },
      { text: profile.role.toUpperCase(), color: pink, size: 19 },
      { text: "A/D MOVE   SPACE JUMP", color: violet, size: 16 },
      { text: "E TO USE THINGS", color: violet, size: 16 },
      { text: "★ HIRE ME ★", color: gold, size: 24 },
    ],
  },
  {
    x: 1040,
    w: 400,
    lines: [
      { text: "PROJECTS", color: pink, size: 38 },
      { text: `${showcase.length} THINGS I'VE BUILT`, color: pink, size: 18 },
      { text: "EVERY BOOTH IS A PROJECT", color: violet, size: 15 },
      { text: "E AT A BOOTH TO OPEN IT", color: violet, size: 15 },
      { text: "★ LIFT TO EVERY FLOOR ★", color: gold, size: 19 },
    ],
  },
  {
    x: 3400,
    w: 380,
    lines: [
      { text: "SKILLS", color: cyan, size: 38 },
      { text: "TROPHY HUNTING", color: pink, size: 18 },
      { text: "THE BOW IS BY THE DOOR", color: violet, size: 15 },
      { text: "SHOOT THE ROPES", color: violet, size: 15 },
      { text: "★ 32 SKILLS TO HUNT ★", color: gold, size: 19 },
    ],
  },
  {
    x: 5580,
    w: 400,
    lines: [
      { text: "COMING UP", color: gold, size: 34 },
      { text: "THE CAREER TOWER", color: pink, size: 18 },
      { text: "ONE FLOOR PER JOB", color: violet, size: 15 },
      { text: "W / S TO RIDE THE LIFT", color: violet, size: 15 },
      { text: "★ SOMETHING ON THE ROOF ★", color: gold, size: 17 },
    ],
  },
  {
    x: 9480,
    w: 420,
    lines: [
      { text: "DOWNTOWN", color: cyan, size: 36 },
      { text: "SECRETS SEALED INSIDE", color: pink, size: 18 },
      { text: "THESE TOWERS DON'T OPEN", color: violet, size: 15 },
      { text: "YOU'LL NEED MORE POWER", color: violet, size: 15 },
      { text: "★ TRY THE ROOF MACHINE ★", color: gold, size: 17 },
    ],
  },
];

/* ---------------- Project mall ---------------- */

export const MALL = {
  x1: 1520,
  liftX: 1530,
  liftW: 100,
  boothStart: 1650,
  boothW: 230,
  floorH: 200,
  floors: 3,
  get roofY() {
    return GY - this.floorH * this.floors;
  },
};

export interface Booth {
  project: Project;
  floor: number;
  x: number;
  area: string;
  hue: number;
}

const areaFloors: { label: string; areas: string[] }[] = [
  { label: "DISTRIBUTED SYSTEMS", areas: ["Distributed systems"] },
  { label: "LOW-LEVEL + AI / ML", areas: ["Low-level", "AI / ML"] },
  { label: "PRODUCT", areas: ["Product"] },
];

export const mallFloorLabels = areaFloors.map((f) => f.label);

export const booths: Booth[] = areaFloors.flatMap((floor, fi) =>
  showcase
    .filter((s) => floor.areas.includes(s.area))
    .map((s) => ({ s, project: projectBySlug(s.slug) }))
    .filter((b): b is { s: (typeof showcase)[number]; project: Project } => Boolean(b.project))
    .map(({ s, project }, i) => ({
      project,
      floor: fi,
      x: MALL.boothStart + i * MALL.boothW,
      area: s.area,
      hue: (fi * 97 + i * 53) % 360,
    })),
);

const boothsPerFloor = Math.max(...[0, 1, 2].map((f) => booths.filter((b) => b.floor === f).length));
export const MALL_X2 = MALL.boothStart + boothsPerFloor * MALL.boothW + 30;

/** The lab keycard waits on the mall roof, far end. */
export const KEYCARD = { x: MALL_X2 - 70, y: MALL.roofY };

/* ---------------- Archery hall ---------------- */

export const HALL = { x1: 3860, x2: 5460, ceil: GY - 330 };

const ICON_FILES: Record<string, string> = {
  Python: "python-original.svg",
  JavaScript: "javascript-original.svg",
  Java: "java-original.svg",
  Kotlin: "kotlin-original.svg",
  C: "c-original.svg",
  "C++": "cplusplus-original.svg",
  "C#": "csharp-original.svg",
  HTML: "html5-original.svg",
  CSS: "css3-original.svg",
  "Node.js": "nodejs-original-wordmark.svg",
  Django: "django-plain-wordmark.svg",
  Flask: "flask-original-wordmark.svg",
  React: "react-original.svg",
  Angular: "angularjs-original.svg",
  Redux: "redux-original.svg",
  PostgreSQL: "postgresql-original.svg",
  MySQL: "mysql-original.svg",
  MongoDB: "mongodb-original.svg",
  Redis: "redis-original.svg",
  Docker: "docker-original.svg",
  Kubernetes: "kubernetes-original.svg",
  AWS: "amazonwebservices-original-wordmark.svg",
  "Apache Kafka": "apachekafka-original.svg",
  RabbitMQ: "rabbitmq-original.svg",
  Jenkins: "jenkins-original.svg",
  Maven: "maven-original.svg",
  Gradle: "gradle-original.svg",
  Jira: "jira-original.svg",
};

const SHORT: Record<string, string> = {
  TypeScript: "TS",
  "Next.js": "N",
  "Spring Boot": "SB",
  FastAPI: "API",
  PyTorch: "PT",
  TensorFlow: "TF",
  Git: "git",
  "GitHub Actions": "GHA",
  GraphQL: "GQL",
  TailwindCSS: "TW",
  Linux: "LNX",
  Nginx: "NGX",
};

/** Up to 32 skills: everything with an icon first, then the headline ones. */
const allSkills = skills.flatMap((g) => g.items.map((name) => ({ name, group: g.name })));
const withIcon = allSkills.filter((s) => ICON_FILES[s.name]);
const extras = ["TypeScript", "Next.js", "Spring Boot", "FastAPI", "PyTorch", "Git", "Linux", "GraphQL"]
  .map((name) => allSkills.find((s) => s.name === name))
  .filter((s): s is { name: string; group: string } => Boolean(s));

export interface SkillToken {
  id: string;
  name: string;
  group: string;
  icon?: string;
  short: string;
  x: number;
  rope: number;
  phase: number;
}

const picked = [...withIcon, ...extras].slice(0, 32);
const span = HALL.x2 - HALL.x1 - 120;
export const skillTokens: SkillToken[] = picked.map((s, i) => ({
  id: s.name,
  name: s.name,
  group: s.group,
  icon: ICON_FILES[s.name] ? `/images/technologies/${ICON_FILES[s.name]}` : undefined,
  short: SHORT[s.name] ?? s.name.slice(0, 3),
  x: HALL.x1 + 60 + (i + 0.5) * (span / picked.length),
  rope: [40, 115, 75, 150][i % 4],
  phase: i * 1.7,
}));

/* ---------------- Career tower ---------------- */

export const TOWER = { x1: 6060, x2: 6780, liftX: 6360, liftW: 110, floorH: 170 };

/** Oldest job on the ground floor, current job at the top. */
export const careerFloors: Experience[] = [...experience].reverse();
export const TOWER_ROOF = GY - TOWER.floorH * careerFloors.length;
export const MACHINE = { x: 6620, y: TOWER_ROOF };

export const LOGOS: Record<string, string> = {
  sphere: "/images/experiences/sphere.jpeg",
  "chance-app": "/images/experiences/chance.jpeg",
  gupshup: "/images/experiences/gupshup.jpeg",
  netsi: "/images/experiences/netsi.jpeg",
  "neu-ta": "/images/experiences/neu.png",
  ubiwell: "/images/experiences/neu.png",
};

/* ---------------- Contact ---------------- */

export const CONTACT = {
  billboardX: 7080,
  billboardW: 400,
  mailboxX: 7560,
  linkedinX: 7680,
  githubX: 7780,
  flagX: 7920,
};

/* ---------------- Campus + secret lab ---------------- */

export const CAMPUS = {
  x1: 8140,
  x2: 9360,
  top: GY - 330,
  deskX: 8760,
  elevatorX: 9200,
  labFloor: GY + 330,
  labTop: GY + 90,
};

export const diplomas: Education[] = education;
export const papers: Publication[] = publications;

/* ---------------- Downtown ---------------- */

export const TILE = 24;
export const towerSpecs = [
  { x: 9980, cols: 7, rows: 15, egg: { c: 3, r: 4 } },
  { x: 10300, cols: 8, rows: 19, egg: { c: 4, r: 10 } },
  { x: 10640, cols: 6, rows: 13, egg: { c: 2, r: 7 } },
];

export interface Secret {
  id: string;
  title: string;
  body: string;
}

export const secrets: Secret[] = [
  {
    id: "keycard",
    title: "Staff keycard",
    body: "Found on the mall roof. The receptionist at the campus building will let you into the lab now.",
  },
  {
    id: "lab",
    title: "The secret lab",
    body: "Underneath campus: every paper I've worked on, glowing on the wall. Press E at a screen to read one.",
  },
  {
    id: "egg-0",
    title: "Egg: Mumbai to Boston",
    body: "I grew up in Mumbai, did my B.Tech at K. J. Somaiya, and moved to Boston in 2023 for an M.S. at Northeastern.",
  },
  {
    id: "egg-1",
    title: "Egg: off the clock",
    body: profile.bio[profile.bio.length - 1],
  },
  {
    id: "egg-2",
    title: "Egg: boring on purpose",
    body: "Favourite architecture: the boring kind. Idempotent writes, leases, retries with backoff, and a dead-letter queue, so a crash at 3am is a retry and not an incident.",
  },
];

export const END_X = 11080;

export const contactLinks = {
  email: profile.email,
  emailHref: links.email,
  linkedin: links.linkedin,
  github: links.github,
  resume: links.resume,
};

export const playerName = firstName;
