import { SkillsDoc } from "@/components/terminal/docs";
import NextPrompt from "@/components/ui/NextPrompt";
import PageShell from "@/components/ui/PageShell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Skills",
  description:
    "Python, TypeScript and Java; Postgres, Redis and Mongo; Docker, Kubernetes and AWS; Kafka and RabbitMQ. The working toolkit of a backend engineer.",
  path: "/skills",
});

export default function SkillsPage() {
  return (
    <PageShell
      title="skills.md"
      command="cat skills.md"
      footer={
        <NextPrompt
          suggestions={[
            { label: "cat projects.md", href: "/projects" },
            { label: "cat experience.md", href: "/experience" },
            { label: "open resume", href: "/resume" },
          ]}
        />
      }
    >
      <SkillsDoc />
    </PageShell>
  );
}
