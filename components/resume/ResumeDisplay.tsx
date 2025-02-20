import Head from "next/head";
import Link from "next/link";

export default async function ResumeDisplay() {
  return (
    <>
      <Head>
        <title>Resume | Your Name</title>
        <meta name="description" content="View the resume of Darsh Pandya" />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-4">
        <h1 className="text-4xl font-bold text-white-500 mb-6">My Resume</h1>
        <iframe
          src="/files/resume.pdf"
          className="w-full max-w-4xl h-[60vh] border-2 border-blue-500 rounded-lg"
        />
        <a
          href="/files/resume.pdf"
          download="resume.pdf"
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Download Resume
        </a>
      </main>
    </>
  );
};
