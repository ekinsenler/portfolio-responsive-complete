# ekinsenler.com — Personal Portfolio

Personal portfolio of **Ekin Senler** (AI Engineer), built with [Astro](https://astro.build)
as a fast, static, accessible site. Deployed to GitHub Pages at
**[www.ekinsenler.com](https://www.ekinsenler.com)**.

## Tech stack

- **Astro 5** — static output, near-zero client JS, content collections
- **TypeScript** — strict, type-checked (`astro check`)
- **Design tokens + CSS** — component-scoped styles, light/dark themes
- **Self-hosted fonts** (Poppins via `@fontsource`) — no font CDN
- **Formspree** — contact form backend (unchanged from the previous site)

## Prerequisites

- **Node.js ≥ 20.3** and npm (this repo was developed on Node 26 / npm 11)

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server at http://localhost:4321
npm run build        # build static site to dist/
npm run preview      # serve the built dist/ locally
npm run check        # TypeScript / Astro diagnostics
npm run lint         # ESLint
npm run format       # Prettier (write)   — format:check for CI
npm run test:links   # broken-link/anchor/asset check on dist/
npm test             # Playwright e2e + accessibility (build first)
npm run og           # regenerate the social OG card (public/og-image.png)
npm run verify       # check + lint + format:check + build (fast local gate)
```

E2E tests need a browser once: `npx playwright install chromium`.

## Project structure

```
src/
├─ content.config.ts        # Zod-validated content collections
├─ content/projects/        # one Markdown file per project  ← add projects here
├─ data/site.ts             # validated profile facts (name, role, socials, CV…)
├─ schemas/knowledge.ts     # versioned public-facts schema (future chatbot)
├─ pages/
│  ├─ index.astro           # the single-page site
│  ├─ 404.astro
│  └─ api/knowledge.json.ts # build-time public knowledge base (→ /api/knowledge.json)
├─ layouts/BaseLayout.astro # <head>, SEO, JSON-LD, theme init, header/footer
├─ components/              # Hero, About, Projects, Contact, Header, Footer, …
├─ styles/                  # tokens.css (design system) + global.css
└─ scripts/ui.ts            # tiny progressive-enhancement bundle
public/                     # CNAME, robots.txt, manifest, favicons, og-image
```

## Editing content

**Add / edit a project** — create or edit one file in `src/content/projects/`:

```markdown
---
title: My New Project
order: 13
featured: false
tags: ['Machine Learning']
links:
  - label: View code
    href: 'https://github.com/ekinsenler/repo'
---

A short description of the project (Markdown).
```

The schema in `src/content.config.ts` validates every field at build time — a bad
link or missing title fails the build. No layout HTML to touch.

**Update profile facts** (name, role, about, education, socials, Formspree endpoint)
— edit `src/data/site.ts`. It is validated by Zod on build.

**Add your CV** — drop the PDF at `public/cv/ekin-senler-cv.pdf` and set
`cv.available: true` in `src/data/site.ts`. A "Download CV" button then appears in the
hero. (No placeholder CV is shipped — nothing is fabricated.)

## Deployment

Deployment is automated by **`.github/workflows/deploy.yml`**: on every push to `main`
it runs type-check, lint, format-check, build, and a link check, then publishes `dist/`
to GitHub Pages. The custom domain is preserved via `public/CNAME` (`www.ekinsenler.com`).

**One-time GitHub setting required** (see `docs/MODERNIZATION_PLAN.md` §Deployment):
Settings → Pages → **Source: GitHub Actions**. Until then the previous branch-based
deploy keeps serving, so the switch is safe and reversible.

**Rollback:** revert Pages Source to "Deploy from branch: `main`", or `git revert` the
change and let the workflow redeploy.

## Documentation

- `docs/MODERNIZATION_PLAN.md` — baseline audit, executable backlog, before/after metrics
- `docs/adr/0001-frontend-architecture.md` — why Astro (evidence + rejected options)
- `docs/CHATBOT_ARCHITECTURE.md` — future CV chatbot boundary, schema, and test plan

## Attribution

This site began as a fork of the [bedimcode/portfolio-responsive-complete](https://github.com/bedimcode/portfolio-responsive-complete)
template and has since been rebuilt. The upstream template ships without a LICENSE file;
its licensing/attribution status is tracked as an open TODO in `docs/MODERNIZATION_PLAN.md`
(task `LEGAL-1`) pending the owner's decision.
