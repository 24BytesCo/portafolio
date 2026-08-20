import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { metadata as meta } from "@/app/config";
import { project } from "@/app/source";
import { MDXLink } from "@/lib/mdx/default-components";
import { createMetadata } from "@/lib/metadata";
import { MDXContent } from "@content-collections/mdx/react";
import defaultMdxComponents from "fumadocs-ui/mdx";

import Header from "./header";

// Pre-generate static params for all project pages at build time
export function generateStaticParams() {
  return project
    .getPages()
    .map((p) => p.slugs[0])
    .filter(Boolean)
    .map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const page = project.getPage([slug]);
  if (!page) notFound();

  // Resolución robusta para OG/Twitter
  const clean = slug.replace(/^[-_]+|[-_]+$/g, "");
  const hyphen = clean.replace(/_/g, "-").replace(/-{2,}/g, "-");
  const underscore = clean.replace(/-/g, "_").replace(/_{2,}/g, "_");
  const candidates = Array.from(
    new Set([slug, clean, hyphen, underscore]),
  ).flatMap((s) => [
    `/images/projects/${s}/cover.jpg`,
    `/images/projects/${s}/cover.png`,
    `/images/projects/${s}/cover.jpeg`,
    `/images/projects/${s}/cover.webp`,
  ]);
  const cover = candidates.find((rel) =>
    fs.existsSync(path.join(process.cwd(), "public", rel)),
  );

  return createMetadata({
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      type: "article",
      images: cover
        ? [
            {
              alt: "banner",
              width: 1200,
              height: 630,
              url: cover,
              type: "image/png",
            },
          ]
        : undefined,
      authors: meta.author.name,
      // modifiedTime: page.data.date.toISOString()
    },
    twitter: {
      images: cover
        ? [
            {
              alt: "banner",
              width: 1200,
              height: 630,
              url: cover,
            },
          ]
        : undefined,
    },
  }) satisfies Metadata;
}

export default async function ProjectPage(props0: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props0.params;
  const { slug } = params;
  const page = project.getPage([slug]);
  if (!page) notFound();

  const {
    data: { body },
  } = page;

  // Resolve cover for page render as well (duplicate robust logic for runtime)
  const clean2 = slug.replace(/^[-_]+|[-_]+$/g, "");
  const hyphen2 = clean2.replace(/_/g, "-").replace(/-{2,}/g, "-");
  const underscore2 = clean2.replace(/-/g, "_").replace(/_{2,}/g, "_");
  const candidates2 = Array.from(
    new Set([slug, clean2, hyphen2, underscore2]),
  ).flatMap((s) => [
    `/images/projects/${s}/cover.jpg`,
    `/images/projects/${s}/cover.png`,
    `/images/projects/${s}/cover.jpeg`,
    `/images/projects/${s}/cover.webp`,
  ]);
  const cover2 = candidates2.find((rel) =>
    fs.existsSync(path.join(process.cwd(), "public", rel)),
  );

  return (
    <main className="my-14 flex-1">
      <div className="container mx-auto">
        <Header metadata={page.data} />
        {cover2 ? (
          <Image
            src={cover2}
            width={1280}
            height={832}
            alt={`Image of ${page.data.title}`}
            unoptimized
            className="my-12 aspect-video h-auto w-full rounded-lg object-cover"
          />
        ) : null}
        <div className="prose min-w-full">
          <MDXContent
            code={body}
            components={{
              ...defaultMdxComponents,
              a: MDXLink,
            }}
          />
        </div>
      </div>
    </main>
  );
}
