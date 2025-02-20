import { Metadata } from "next";

import { Toaster } from "sonner";

import ContactForm from "@/components/contact/ContactForm";
import ResumeDisplay from "@/components/resume/ResumeDisplay";

export const metadata: Metadata = {
  title: "My Resume - Darsh Chetan Pandya",
  description: "Download or view my resume as a PDF.",
  metadataBase: new URL("https://darshpandya.com/resume"),
  openGraph: {
    title: "Contact | Darsh Pandya",
    description: "Contact me",
    siteName: "Darsh Pandya",
    type: "website",
    url: "https://darshpandya.com/resume",
    images: [
      {
        url: "https://res.cloudinary.com/dijxynt89/image/upload/v1725052376/Aditya_os4fzb.jpg",
      },
    ],
  }
};

export default function Resume() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-8">
      <ResumeDisplay />
      <Toaster richColors expand position="top-right" />
    </div>
  );
}
