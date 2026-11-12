import NextPrompt from "@/components/ui/NextPrompt";
import PageShell from "@/components/ui/PageShell";
import { links } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Resume",
  description: "Download or read the resume of Darsh Pandya, software engineer in Boston.",
  path: "/resume",
});

export default function ResumePage() {
  return (
    <PageShell
      title="resume.pdf"
      command="open resume.pdf"
      footer={
        <NextPrompt
          suggestions={[
            { label: "cat experience.md", href: "/experience" },
            { label: "cat education.md", href: "/education" },
            { label: "cat contact.md", href: "/contact" },
          ]}
        />
      }
    >
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-2">
          <a
            href={links.resume}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded border border-term-accent/60 bg-term-accent/10 px-3 py-1.5 text-term-accent transition-colors hover:bg-term-accent/20"
          >
            open in new tab ↗
          </a>
          <a
            href={links.resume}
            download="darsh-pandya-resume.pdf"
            className="rounded border border-term-border bg-term-raised px-3 py-1.5 text-term-dim transition-colors hover:text-term-fg"
          >
            download
          </a>
        </div>
        <object
          data={`${links.resume}#view=FitH`}
          type="application/pdf"
          aria-label="Resume PDF"
          className="h-[70vh] min-h-[480px] w-full rounded border border-term-border bg-term-raised"
        >
          <p className="p-4 text-term-dim">
            Your browser can&apos;t display PDFs inline.{" "}
            <a href={links.resume} className="term-link" target="_blank" rel="noreferrer noopener">
              Open resume.pdf
            </a>{" "}
            instead.
          </p>
        </object>
      </div>
    </PageShell>
  );
}
