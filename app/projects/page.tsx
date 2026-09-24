import { ProjectsDoc } from "@/components/terminal/docs";
import NextPrompt from "@/components/ui/NextPrompt";
import PageShell from "@/components/ui/PageShell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Two apps shipped to Android, FarePath for offline Mumbai rail fares and Splitwit for itemized bill splitting, plus distributed systems work: load-tested message queues, sharded consumers and a real-time group matching service.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <PageShell
      title="projects.md"
      command="cat projects.md"
      footer={
        <NextPrompt
          suggestions={[
            { label: "cat skills.md", href: "/skills" },
            { label: "cat experience.md", href: "/experience" },
            { label: "cat contact.md", href: "/contact" },
          ]}
        />
      }
    >
      <ProjectsDoc />
    </PageShell>
  );
}
