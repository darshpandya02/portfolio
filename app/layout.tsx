import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono, Newsreader, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import { profile, SITE_URL } from "@/lib/content";
import { themeBootScript } from "@/lib/terminal/themes";
import { siteBootScript } from "@/lib/site-prefs";
import ChatWidget from "@/components/site/ChatWidget";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const serif = Newsreader({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-serif",
  adjustFontFallback: false,
});

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} | ${profile.role}`,
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
    "Python",
    "TypeScript",
    "Kubernetes",
    "Kafka",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: profile.name,
    title: `${profile.name} | ${profile.role}`,
    description: profile.summary,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | ${profile.role}`,
    description: profile.summary,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  viewportFit: "cover",
  themeColor: "#06060c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gtag = process.env.G_TAG;
  const clarity = process.env.CLARITY_KEY;

  return (
    <html
      lang="en"
      className={`${mono.variable} ${serif.variable} ${sans.variable} ${grotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript + siteBootScript }} />
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
      <body>
        {children}
        {/* Own .ed scope so the widget keeps the site theme on the terminal pages too. */}
        <div className="ed ed-float">
          <ChatWidget />
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
