import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/api"],
    },
    sitemap: "https://darshpandya.com/sitemap.xml",
  };
}
