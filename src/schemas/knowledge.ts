import { z } from 'astro:schema';

/**
 * Versioned, validated schema for the PUBLIC portfolio/CV facts a future chatbot
 * is allowed to ground its answers in. This is the ONLY knowledge source the bot
 * may use. It contains public facts only — no email, no private CV data.
 *
 * Bump KNOWLEDGE_SCHEMA_VERSION on any breaking shape change so a consuming
 * backend can detect a stale/mismatched context (see docs/CHATBOT_ARCHITECTURE.md).
 */
export const KNOWLEDGE_SCHEMA_VERSION = '1.0.0';

export const publicKnowledgeSchema = z.object({
  schemaVersion: z.literal(KNOWLEDGE_SCHEMA_VERSION),
  person: z.object({
    name: z.string(),
    role: z.string(),
    url: z.string().url(),
    about: z.string(),
    socials: z.array(z.object({ label: z.string(), href: z.string().url() })),
  }),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
    })
  ),
  projects: z.array(
    z.object({
      title: z.string(),
      context: z.string().nullable(),
      tags: z.array(z.string()),
      links: z.array(z.object({ label: z.string(), href: z.string().url() })),
      summary: z.string(),
      sourceId: z.string(),
    })
  ),
  disclaimers: z.array(z.string()),
});

export type PublicKnowledge = z.infer<typeof publicKnowledgeSchema>;
