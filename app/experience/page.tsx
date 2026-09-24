import { ExperienceDoc } from "@/components/terminal/docs";
import NextPrompt from "@/components/ui/NextPrompt";
import PageShell from "@/components/ui/PageShell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Experience",
  description:
    "Software engineering roles at SPHERE Research Infrastructure, Northeastern's Network Science Institute, Gupshup and Chance App — plus a year teaching full-stack web development.",
  path: "/experience",
});

export default function ExperiencePage() {
  return (
    <PageShell
      title="experience.md"
      command="cat experience.md"
      footer={
        <NextPrompt
          suggestions={[
            { label: "cat education.md", href: "/education" },
            { label: "cat projects.md", href: "/projects" },
            { label: "open resume", href: "/resume" },
          ]}
        />
      }
    >
      <ExperienceDoc />
    </PageShell>
  );
}
