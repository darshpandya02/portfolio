import { SITE_URL } from "@/lib/content";

const TARGET = "https://leetcode.com/u/Darshpandya02/";
const TITLE = "LeetCode | Darshpandya02";
const DESCRIPTION = "Data structures and algorithms practice by Darsh Pandya.";
const IMAGE = `${SITE_URL}/images/social/leetcode-card.jpg`;

/**
 * Link-preview shim for the LeetCode profile. LeetCode blocks link-preview
 * crawlers (LinkedIn, Slack), so this serves the preview tags itself and
 * sends people straight on to the profile.
 */
export function GET() {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESCRIPTION}">
<meta property="og:url" content="${SITE_URL}/leetcode">
<meta property="og:image" content="${IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="noindex">
<link rel="canonical" href="${TARGET}">
<meta http-equiv="refresh" content="0; url=${TARGET}">
</head>
<body style="background:#06060c;color:#eeedf9;font-family:system-ui,sans-serif">
<p>Taking you to <a href="${TARGET}" style="color:#22d3ee">${TARGET}</a>…</p>
<script>location.replace(${JSON.stringify(TARGET)});</script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
