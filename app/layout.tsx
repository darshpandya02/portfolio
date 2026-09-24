import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import Navbar from "@/components/Navbar";
import ViewTransitions from "@/components/ViewTransitions";
import Footer from "@/components/Footer";
import { profile, SITE_URL } from "@/lib/content";
import { themeBootScript } from "@/lib/terminal/themes";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s | ${profile.name}`,
  },
  description: profile.summary,
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  keywords: [
    "Darsh Pandya",
    "Software Engineer",
    "Backend Engineer",
    "Distributed Systems",
    "SPHERE Research Infrastructure",
    "Northeastern University",
    "Boston",
    "Portfolio",
    "Terminal Portfolio",
    "Python",
    "TypeScript",
    "Kubernetes",
    "Kafka",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: profile.name,
    title: `${profile.name} — ${profile.role}`,
    description: profile.summary,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description: profile.summary,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  viewportFit: "cover",
  themeColor: "#0b0e14",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gtag = process.env.G_TAG;
  const clarity = process.env.CLARITY_KEY;

  return (
    <html lang="en" className={mono.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {gtag ? (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gtag}`} />
            <Script id="google-analytics">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gtag}');`}
            </Script>
          </>
        ) : null}
        {clarity ? (
          <Script id="clarity-script" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarity}");`}
          </Script>
        ) : null}
      </head>
      <body className="flex min-h-screen flex-col bg-term-bg font-mono text-term-fg antialiased">
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
        <SpeedInsights />
      </body>
    </html>
  );
}
