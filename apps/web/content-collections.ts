import { defineCollection, defineConfig } from "@content-collections/core";
import {
  createDocSchema,
  createMetaSchema,
  transformMDX,
} from "@fumadocs/content-collections/configuration";

const projects = defineCollection({
  name: "projects",
  directory: "content/projects",
  include: "**/*.mdx",
  schema: (z) => {
    const docSchema = createDocSchema(z);
    return {
      ...docSchema,
      image: z.string().optional(),
      thumbnail: z.string().optional(),
      website: z.string().optional(),
      github: z.string().optional(),
      tags: z
        .array(
          z.object({
            label: z.string(),
          }),
        )
        .optional(),
      date: z
        .string()
        .or(z.date())
        .transform((value, context) => {
          try {
            return new Date(value);
          } catch {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date",
            });
            return z.NEVER;
          }
        }),
    };
  },
  transform: transformMDX,
});

const projectMetas = defineCollection({
  name: "projectMeta",
  directory: "content/projects",
  include: "**/meta.json",
  parser: "json",
  schema: createMetaSchema,
});

const blog = defineCollection({
  name: "blog",
  directory: "content/blog",
  include: "**/*.mdx",
  schema: (z) => {
    const docSchema = createDocSchema(z);
    return {
      ...docSchema,
      author: z.string(),
      // Imagen grande que abre el artículo. Si falta, se usa la portada del
      // índice (`/images/blog/<slug>/cover.jpg`).
      portada: z
        .object({
          src: z.string(),
          alt: z.string(),
          ancho: z.number().optional(),
          alto: z.number().optional(),
        })
        .optional(),
      // Cierre del artículo: a dónde mandar a quien llegó hasta el final.
      cta: z
        .object({
          titulo: z.string(),
          texto: z.string(),
          href: z.string(),
          etiqueta: z.string(),
        })
        .optional(),
      date: z
        .string()
        .or(z.date())
        .transform((value, context) => {
          try {
            return new Date(value);
          } catch {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid date",
            });
            return z.NEVER;
          }
        }),
    };
  },
  transform: transformMDX,
});

const blogMetas = defineCollection({
  name: "blogMeta",
  directory: "content/blog",
  include: "**/meta.json",
  parser: "json",
  schema: createMetaSchema,
});

export default defineConfig({
  collections: [projects, projectMetas, blog, blogMetas],
});
