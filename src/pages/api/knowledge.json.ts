import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site } from '../../data/site';
import { publicKnowledgeSchema, KNOWLEDGE_SCHEMA_VERSION } from '../../schemas/knowledge';

/**
 * Build-time generation of the curated public knowledge base (dist/api/knowledge.json).
 * A future chatbot backend consumes this instead of parsing a PDF per request.
 * Only public facts are included — deliberately no email or private CV data.
 */
export const prerender = true;

export const GET: APIRoute = async () => {
  const projects = (await getCollection('projects'))
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => ({
      title: entry.data.title,
      context: entry.data.context ?? null,
      tags: entry.data.tags,
      links: entry.data.links,
      summary: (entry.body ?? '').trim(),
      sourceId: `project:${entry.id}`,
    }));

  const knowledge = publicKnowledgeSchema.parse({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    person: {
      name: site.fullName,
      role: site.role,
      url: site.url,
      about: site.about,
      socials: site.socials.map((s) => ({ label: s.label, href: s.href })),
    },
    education: site.education,
    projects,
    disclaimers: [
      `This information is drawn only from the public portfolio at ${site.url}.`,
      'A grounded assistant must abstain when an answer is not present in this data.',
    ],
  });

  return new Response(JSON.stringify(knowledge, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
