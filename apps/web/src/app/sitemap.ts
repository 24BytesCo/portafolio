import type { MetadataRoute } from "next";
import { metadata as meta } from "@/app/config";
import { blog, project } from "@/app/source";

/**
 * Sitemap propio de 24bytes.pro. Hasta 2026-09-16 el dominio no tenía ninguno
 * y la única entrada en Search Console era el sitemap de secop.24bytes.pro
 * (que es otro sitio); Google también recibía `og:url` apuntando a
 * www.example.com por el valor de relleno de config.ts.
 */
const base = meta.site.url;

function fecha(valor: unknown): Date | undefined {
  if (!valor) return undefined;
  const d = valor instanceof Date ? valor : new Date(String(valor));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const fijas: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];
  const proyectos: MetadataRoute.Sitemap = [...project.getPages()].map((p) => ({
    url: `${base}${p.url}`,
    lastModified: fecha((p.data as { date?: unknown }).date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));
  const entradas: MetadataRoute.Sitemap = [...blog.getPages()].map((p) => ({
    url: `${base}${p.url}`,
    lastModified: fecha((p.data as { date?: unknown }).date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...fijas, ...proyectos, ...entradas];
}
