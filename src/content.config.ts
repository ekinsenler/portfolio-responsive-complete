import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * `projects` — one Markdown file per project in src/content/projects/.
 * Adding a project = adding one file here; no layout HTML to duplicate.
 * The Markdown body holds the prose description; frontmatter is validated below.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Explicit display order (ascending). Also encoded in the filename prefix.
      order: z.number().int().positive(),
      featured: z.boolean().default(false),
      // Hide from the site without deleting the entry.
      draft: z.boolean().default(false),
      // Optional one-line context (e.g. "Master Thesis", EU project affiliation).
      context: z.string().optional(),
      // Technologies/domains taken verbatim from the project description — no invented skills.
      tags: z.array(z.string()).default([]),
      // External links (repo, project page). Validated as real URLs.
      links: z
        .array(
          z.object({
            label: z.string(),
            href: z.string().url(),
          })
        )
        .default([]),
      // Optional logo/thumbnail, optimized at build time via astro:assets.
      logo: image().optional(),
      logoAlt: z.string().optional(),
      // Reserved for future per-project case-study pages (structure ready, not built yet).
      slug: z.string().optional(),
    }),
});

export const collections = { projects };
