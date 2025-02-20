import { Metadata } from "next";

import TechnologyDisplay from "@/components/home/technologies/TechnologyDisplay";
import ProjectsDisplay from "@/components/projects/ProjectsDisplay";
import ExperienceDisplay from "@/components/home/experiences/ExperienceDisplay";
import AboutMe from "@/components/home/AboutMe";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Home | Darsh Pandya",
  description: "View my bio, featured projects and technologies.",
  metadataBase: new URL("https://darshpandya.com"),
  openGraph: {
    title: "Home | Darsh Pandya",
    description: "View my bio, featured projects and technologies.",
    siteName: "Darsh Pandya",
    type: "website",
    url: "https://darshpandya.com",
    images: [
      {
        url: "https://res.cloudinary.com/dijxynt89/image/upload/v1725052376/Aditya_os4fzb.jpg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Home | Darsh Pandya",
    description: "View my bio, featured projects and technologies.",
    images: [
      {
        url: "https://res.cloudinary.com/dijxynt89/image/upload/v1725052376/Aditya_os4fzb.jpg",
      },
    ],
  },
};

export default async function Home() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <AboutMe />
      <TechnologyDisplay />
      <ExperienceDisplay />
      {/* <ProjectsDisplay
        heading={"Featured Projects"}
        description={""}
        featured={true}
      /> */}
    </div>
  );
}
