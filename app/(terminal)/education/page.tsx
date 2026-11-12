import { EducationDoc } from "@/components/terminal/docs";
import NextPrompt from "@/components/ui/NextPrompt";
import PageShell from "@/components/ui/PageShell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Education",
  description:
    "M.S. in Computer Science from Northeastern University (3.97 GPA) and a B.Tech in Information Technology from K. J. Somaiya College of Engineering.",
  path: "/education",
});

export default function EducationPage() {
  return (
    <PageShell
      title="education.md"
      command="cat education.md"
      footer={
        <NextPrompt
          suggestions={[
            { label: "cat experience.md", href: "/experience" },
            { label: "cat publications.md", href: "/publications" },
            { label: "open resume", href: "/resume" },
          ]}
        />
      }
    >
      <EducationDoc />
    </PageShell>
  );
}
