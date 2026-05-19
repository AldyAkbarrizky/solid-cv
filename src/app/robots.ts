import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.APP_URL || "https://cv.solidtechno.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/admin",
          "/review/",
          "/history",
          "/billing",
          "/pricing",
          "/login",
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
