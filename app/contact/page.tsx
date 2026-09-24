import { Toaster } from "sonner";

import ContactForm from "@/components/contact/ContactForm";
import { ContactDoc } from "@/components/terminal/docs";
import NextPrompt from "@/components/ui/NextPrompt";
import PageShell from "@/components/ui/PageShell";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with Darsh Pandya — email, GitHub, LinkedIn, or send a message straight from the browser.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageShell
        title="contact.md"
        command="cat contact.md && mail darsh"
        footer={
          <NextPrompt
            suggestions={[
              { label: "cat about.md", href: "/about" },
              { label: "cat projects.md", href: "/projects" },
              { label: "open resume", href: "/resume" },
            ]}
          />
        }
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <ContactDoc showFormHint={false} />
          <div className="rounded border border-term-border bg-term-bg/40 p-4">
            <ContactForm />
          </div>
        </div>
      </PageShell>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--t-raised)",
            border: "1px solid var(--t-border)",
            color: "var(--t-fg)",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
          },
        }}
      />
    </>
  );
}
