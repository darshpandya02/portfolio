import { Metadata } from "next";

import ProjectsDisplay from "@/components/projects/ProjectsDisplay";
import ResumeDisplay from "@/components/resume/ResumeDisplay";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Projects | Darsh Pandya",
  description: "Projects by Darsh Pandya",
  metadataBase: new URL("https://darshpandya.com/projects"),
  openGraph: {
    title: "Projects | Darsh Pandya",
    description: "View my projects.",
    siteName: "Darsh Pandya",
    type: "website",
    url: "https://darshpandya.com/projects",
    images: [
      {
        url: "https://res.cloudinary.com/dijxynt89/image/upload/v1725052376/Aditya_os4fzb.jpg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Darsh Pandya",
    description: "View my projects.",
    images: [
      {
        url: "https://res.cloudinary.com/dijxynt89/image/upload/v1725052376/Aditya_os4fzb.jpg",
      },
    ],
  },
};

export default async function Projects() {
  return (
    <div className="relative min-h-screen bg-neutral-950">
      <ProjectsDisplay
        heading={"Projects"}
        description={"Here's a list of projects I have worked/working on."}
        featured={false}
      />
    </div>
  );
}
