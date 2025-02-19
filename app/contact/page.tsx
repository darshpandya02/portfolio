import { Metadata } from "next";

import { Toaster } from "sonner";

import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Darsh Pandya",
  description: "Contact me",
  metadataBase: new URL("https://darshpandya.com/contact"),
  openGraph: {
    title: "Contact | Darsh Pandya",
    description: "Contact me",
    siteName: "Darsh Pandya",
    type: "website",
    url: "https://darshpandya.com/contact",
    images: [
      {
        url: "https://res.cloudinary.com/dijxynt89/image/upload/v1725052376/Aditya_os4fzb.jpg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Darsh Pandya",
    description: "Contact me",
    images: [
      {
        url: "https://res.cloudinary.com/dijxynt89/image/upload/v1725052376/Aditya_os4fzb.jpg",
      },
    ],
  },
};

export default function Contact() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-8">
      <ContactForm />
      <Toaster richColors expand position="top-right" />
    </div>
  );
}
