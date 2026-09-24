import { AboutDoc } from "@/components/terminal/docs";
import NextPrompt from "@/components/ui/NextPrompt";
import PageShell from "@/components/ui/PageShell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Darsh Pandya — software engineer in Boston working on SPHERE, an NSF-backed public research infrastructure for reproducible cybersecurity experimentation.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell
      title="about.md"
      command="cat about.md"
      footer={
        <NextPrompt
          suggestions={[
            { label: "cat experience.md", href: "/experience" },
            { label: "cat projects.md", href: "/projects" },
            { label: "cat contact.md", href: "/contact" },
          ]}
        />
      }
    >
      <AboutDoc />
    </PageShell>
  );
}
