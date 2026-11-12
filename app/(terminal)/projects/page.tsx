import { ProjectsDoc } from "@/components/terminal/docs";
import NextPrompt from "@/components/ui/NextPrompt";
import PageShell from "@/components/ui/PageShell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Live, usable projects: an event-driven image moderation platform, a real-time group matching service and full-stack dashboards, plus Raft consensus and primary-backup replication in C++, and two offline-first Android apps.",
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
