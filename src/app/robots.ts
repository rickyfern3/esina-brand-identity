import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/run-audit", "/api/submit-profile", "/api/run-match"],
      },
    ],
    sitemap: "https://esina.app/sitemap.xml",
    host: "https://esina.app",
  };
}
