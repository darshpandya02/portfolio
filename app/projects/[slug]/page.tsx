import { notFound } from "next/navigation";

import { ProjectDoc } from "@/components/terminal/docs";
import NextPrompt from "@/components/ui/NextPrompt";
import PageShell from "@/components/ui/PageShell";
import { projectBySlug, projects } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: Params) {
  const project = projectBySlug(params.slug);
  if (!project) {
    return pageMetadata({ title: "Not found", description: "No such project.", path: "/projects" });
  }
  return pageMetadata({
    title: project.name,
    description: project.tagline,
    path: `/projects/${project.slug}`,
  });
}

export default function ProjectPage({ params }: Params) {
  const project = projectBySlug(params.slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const previous = projects[index - 1];
  const next = projects[index + 1];

  return (
    <PageShell
      title={`projects/${project.slug}.md`}
      command={`cat projects/${project.slug}.md`}
      footer={
        <NextPrompt
          suggestions={[
            { label: "cd ..", href: "/projects" },
            ...(previous ? [{ label: `cat ${previous.slug}.md`, href: `/projects/${previous.slug}` }] : []),
            ...(next ? [{ label: `cat ${next.slug}.md`, href: `/projects/${next.slug}` }] : []),
          ]}
        />
      }
    >
      <ProjectDoc project={project} />
    </PageShell>
  );
}
