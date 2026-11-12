import { chatNotes, education, experience, journey, links, profile, projects, publications, skills } from "@/lib/content";
import { articles, articleText } from "@/lib/writing";

/**
 * Everything the chat assistant is allowed to know, serialized from content.ts.
 * Built once per server instance and kept byte-stable so the prompt prefix caches.
 */
function knowledge(): string {
  const lines: string[] = [];

  lines.push(`# ${profile.name}`, `${profile.role} at ${profile.company}. Based in ${profile.location}.`, profile.summary);
  lines.push("", "## Bio", ...profile.bio);
  lines.push("", `Availability: ${profile.availability}`);
  lines.push(
    "",
    "## Links",
    `Email: ${profile.email}`,
    `GitHub: ${links.github}`,
    `LinkedIn: ${links.linkedin}`,
    `Resume PDF: on this site at ${links.resume}`,
  );

  lines.push("", "## Experience");
  for (const job of experience) {
    lines.push(
      "",
      `### ${job.role}, ${job.company} (${job.location}), ${job.start} to ${job.end}`,
      job.summary,
      ...job.highlights.map((h) => `- ${h}`),
      `Stack: ${job.stack.join(", ")}`,
    );
  }

  lines.push("", "## Projects");
  for (const p of projects) {
    lines.push(
      "",
      `### ${p.name} (${p.year})`,
      p.tagline,
      ...p.description,
      ...p.highlights.map((h) => `- ${h}`),
      `Stack: ${p.stack.join(", ")}`,
      ...(p.demo ? [`Demo: ${p.demo}`] : []),
      ...(p.github ? [`Code: ${p.github}`] : []),
    );
  }

  lines.push("", "## Skills", ...skills.map((g) => `${g.name}: ${g.items.join(", ")}`));
  lines.push("", "## Publications", ...publications.map((p) => `- ${p.title}. ${p.venue}, ${p.year}.${p.note ? ` ${p.note}` : ""}`));
  lines.push(
    "",
    "## Education",
    ...education.map(
      (e) => `- ${e.degree}, ${e.school} (${e.location}), ${e.start} to ${e.end}, GPA ${e.gpa}. Coursework: ${e.coursework.join(", ")}.`,
    ),
  );

  lines.push("", "## Deep-dive articles he wrote (on this site under /writing/<slug>)");
  for (const a of articles) lines.push("", `Link: /writing/${a.slug}`, articleText(a));

  lines.push("", "## Timeline", ...journey.map((j) => `- ${j.year}: ${j.title}, ${j.detail}`));
  if (chatNotes.length) lines.push("", "## More about him", ...chatNotes.map((n) => `- ${n}`));

  return lines.join("\n");
}

export const CHAT_SYSTEM_PROMPT = `You are the assistant on ${profile.name}'s portfolio website. Visitors are usually recruiters, hiring managers and engineers who want to know about his work.

Answer only from the profile below. Refer to him in the third person, by name or as "he". If the profile doesn't answer the question, say that you don't know and suggest emailing him at ${profile.email}. Never guess at facts that are not in the profile, such as salary expectations, visa or work authorization, references, or anything personal beyond what is written. Send those questions to email as well.

Visitors may ask anything about him: his background, jobs, projects, skills, research, education, interests, or how to get in touch. Answer all of those from the profile.

Keep replies short: two to five sentences, or a brief list when comparing several items. Write plain text with no markdown headings, bold or tables. Do not use em dashes or en dashes; use commas, colons or separate sentences instead. When a project has a live demo or source link, include the URL. Stay on the topic of his work. Politely decline unrelated requests, such as writing code for the visitor or general trivia.

<profile>
${knowledge()}
</profile>`;
