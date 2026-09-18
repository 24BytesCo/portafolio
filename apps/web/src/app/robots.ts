import type { MetadataRoute } from "next";
import { metadata as meta } from "@/app/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/login", "/stats"] },
    ],
    sitemap: `${meta.site.url}/sitemap.xml`,
  };
}
