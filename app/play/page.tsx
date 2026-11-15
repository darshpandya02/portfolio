import type { Metadata } from "next";
import { JetBrains_Mono, Silkscreen, Space_Grotesk } from "next/font/google";

import CityGame from "@/components/game/CityGame";
import { experience, profile, projects, SITE_URL, skills } from "@/lib/content";

const pixel = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Play",
  description: `${profile.name}'s portfolio as a playable pixel city: a project mall, an archery hall of skills, a career tower and a few secrets.`,
  alternates: { canonical: `${SITE_URL}/play` },
};

export default function PlayPage() {
  return (
    <main className={`${pixel.className}`}>
      {/* The game is a canvas, so crawlers and screen readers get the same content as text. */}
      <div className="sr-only">
        <h1>{profile.name}: the portfolio game</h1>
        <p>{profile.summary}</p>
        <h2>Projects</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.slug}>
              {p.name}: {p.tagline}
            </li>
          ))}
        </ul>
        <h2>Career</h2>
        <ul>
          {experience.map((j) => (
            <li key={j.slug}>
              {j.role}, {j.company} ({j.start} to {j.end})
            </li>
          ))}
        </ul>
        <h2>Skills</h2>
        <p>{skills.flatMap((g) => g.items).join(", ")}</p>
      </div>
      <CityGame
        fonts={{
          pixel: pixel.style.fontFamily,
          display: grotesk.style.fontFamily,
          mono: mono.style.fontFamily,
        }}
      />
      {/* The floating chat button would sit on top of the touch controls. */}
      <style>{`.ed-float{display:none!important}html,body{overflow:hidden;overscroll-behavior:none}`}</style>
    </main>
  );
}
