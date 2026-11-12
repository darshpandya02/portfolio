import type { Metadata } from "next";

import SiteShell from "@/components/site/SiteShell";
import {
  About,
  Capabilities,
  Contact,
  ExperienceSection,
  Hero,
  ProjectsSection,
  Research,
  StackStrip,
  Writing,
} from "@/components/site/sections";
import { SITE_URL } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

export default function Home() {
  return (
    <SiteShell>
      <Hero />
      <StackStrip />
      <About />
      <Capabilities />
      <ExperienceSection />
      <ProjectsSection />
      <Writing />
      <Research />
      <Contact />
    </SiteShell>
  );
}
