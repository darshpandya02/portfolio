import { PublicationsDoc } from "@/components/terminal/docs";
import NextPrompt from "@/components/ui/NextPrompt";
import PageShell from "@/components/ui/PageShell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Publications",
  description:
    "Published research including ACSAC 2026 on SPHERE, plus IEEE and IJRASET papers on deep learning, fraud detection and hierarchical clustering.",
  path: "/publications",
});

export default function PublicationsPage() {
  return (
    <PageShell
      title="publications.md"
      command="cat publications.md"
      footer={
        <NextPrompt
          suggestions={[
            { label: "cat about.md", href: "/about" },
            { label: "cat education.md", href: "/education" },
            { label: "cat contact.md", href: "/contact" },
          ]}
        />
      }
    >
      <PublicationsDoc />
    </PageShell>
  );
}
