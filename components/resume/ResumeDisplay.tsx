import Head from "next/head";
import Link from "next/link";

export default async function ResumeDisplay() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Resume
          </h2>
          <p className="mt-2 text-lg leading-8 text-white"> Below is my resume, highlighting my experience in software engineering. </p>
      </div><br />
      <main className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-4">
        <iframe
          src="/files/resume.pdf"
          className="w-full max-w-4xl h-[100vh] border-2 border-blue-500 rounded-lg"
        />
        <a
          href="/files/resume.pdf"
          download="resume.pdf"
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Download Resume
        </a>
        <br />
      </main>
    </div>
  );
};
