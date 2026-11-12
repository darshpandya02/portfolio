import Navbar from "@/components/Navbar";
import ViewTransitions from "@/components/ViewTransitions";
import Footer from "@/components/Footer";

/** Chrome for the terminal-style pages (/terminal, /about, /projects, ...). */
export default function TerminalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="term-root flex min-h-screen flex-col bg-term-bg font-mono text-term-fg antialiased">
      <div className="crt-overlay" aria-hidden />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-term-raised focus:px-3 focus:py-2 focus:text-term-accent"
      >
        Skip to content
      </a>
      <ViewTransitions />
      <Navbar />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}
