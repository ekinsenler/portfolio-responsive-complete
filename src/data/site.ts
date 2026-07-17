import { z } from 'astro:schema';

/**
 * Single, validated source of truth for profile-level facts.
 * Everything here is verified from existing site content — nothing is invented.
 * Parsed through Zod at build time so a malformed edit fails the build loudly.
 */

const socialSchema = z.object({
  label: z.string(),
  href: z.string().url(),
  // Icon key resolved to an inline SVG in src/components/icons (no icon-font CDN).
  icon: z.enum(['linkedin', 'github']),
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
});

const siteSchema = z.object({
  /** Brand/nav label (kept from the original site). */
  siteName: z.string(),
  /** Full name for SEO / structured data. */
  fullName: z.string(),
  firstName: z.string(),
  role: z.string(),
  /** Canonical origin — must match CNAME. */
  url: z.string().url(),
  /** SEO <title> base and meta description. */
  seoTitle: z.string(),
  description: z.string(),
  /** Verbatim about-section paragraph. */
  about: z.string(),
  education: z.array(educationSchema),
  socials: z.array(socialSchema),
  /** Credly badge IDs embedded in the About section. */
  credlyBadgeIds: z.array(z.string()),
  /** Formspree endpoint for the contact form (unchanged). */
  formspreeEndpoint: z.string().url(),
  /**
   * CV/resume. `available: false` until a real PDF is supplied by the owner.
   * The path is where the file should live in public/ when added — never fabricated.
   */
  cv: z.object({
    available: z.boolean(),
    path: z.string(),
  }),
});

export type Site = z.infer<typeof siteSchema>;

export const site: Site = siteSchema.parse({
  siteName: "Ekin's Portfolio",
  fullName: 'Ekin Senler',
  firstName: 'Ekin',
  role: 'AI Engineer',
  url: 'https://www.ekinsenler.com',
  seoTitle: 'Ekin Senler — AI Engineer',
  description:
    'Ekin Senler is an AI Engineer with an MSc in Artificial Intelligence and Robotics (Sapienza Università di Roma) and a BSc in Computer Science (Sabancı University), specialising in machine learning, NLP, computer vision, and LLM applications.',
  about:
    'I graduated from Sabancı University with a degree in Computer Science, and then completed my master’s degree in Artificial Intelligence and Robotics at Sapienza Università di Roma. I have a passion for artificial intelligence and data science. My enthusiasm for this field constantly drives me to learn and explore more. I greatly enjoy working in this field and making contributions to it 🤖',
  education: [
    {
      institution: 'Sapienza Università di Roma',
      degree: "Master's degree",
      field: 'Artificial Intelligence and Robotics',
    },
    {
      institution: 'Sabancı University',
      degree: "Bachelor's degree",
      field: 'Computer Science',
    },
  ],
  socials: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/ekinsenler',
      icon: 'linkedin',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/ekinsenler',
      icon: 'github',
    },
  ],
  credlyBadgeIds: ['2b21ab9c-9e5c-42ba-9b33-ffeeb94e9ab7', 'f2b1ee20-fad9-4076-a647-30e1be0dc24d'],
  formspreeEndpoint: 'https://formspree.io/f/xzbnkbvq',
  cv: {
    // TODO(owner): drop the real CV at public/cv/ekin-senler-cv.pdf and set available: true.
    available: false,
    path: '/cv/ekin-senler-cv.pdf',
  },
});
