# ADR 0001 — Frontend architecture: Astro (static + islands)

- **Status:** Accepted
- **Date:** 2026-07
- **Deciders:** Ekin Senler (owner), engineering
- **Context branch:** `modernize-astro`

## Context

`ekinsenler.com` is a primarily informational personal portfolio (bio, education,
certifications, ~12 projects, contact) deployed on GitHub Pages behind a custom domain
via Cloudflare DNS. The previous site was raw HTML/CSS/JS with no build, no content
model, render-blocking CDNs, and accessibility/SEO gaps. Goals: modern, maintainable,
fast, low-cost, and able to grow — including a **future CV-grounded chatbot**. The owner
was considering React but explicitly did not require a framework migration.

## Decision drivers

Maintainability · ease of adding content · accessibility · SEO/social · runtime JS ·
testing/DX · GitHub Pages + custom-domain fit · routing/base-path simplicity · migration
effort/regression risk · future interactive features · chatbot integration boundaries ·
hosting cost / lock-in.

## Options considered

### A. Incrementally modernize vanilla HTML/CSS/JS (+ Vite + TS)

- **+** Lowest migration risk; least new tooling.
- **−** No first-class content model (hand-rolled JSON); component reuse is manual;
  a future chat island is bolted on; least structure for growth.

### B. Astro (static output + islands) — **chosen**

- **+** Ships static HTML with near-zero JS (great LCP + SEO). Content collections give
  a **Zod-validated single source of truth** — adding a project is one file. Islands let
  a **React chat widget** be added later without converting the site to an SPA. First-class
  TypeScript, image optimization (`astro:assets`), sitemap. Static export fits GitHub
  Pages + custom domain with `base: '/'`.
- **−** Introduces a Node/Vite build and a CI deploy step (mitigated: both added + tested).

### C. React SPA (Vite, static export)

- **+** Familiar; strong for highly interactive apps.
- **−** Heavier client JS and weaker default SEO for a content site (needs SSG/prerender
  to compete); more complexity than an informational portfolio warrants. "React is modern"
  is not sufficient justification.

### D. Full-stack framework (e.g. Next SSR)

- **−** SSR/serverless runtime is unnecessary for static content and does not match the
  GitHub Pages static host; highest complexity and lock-in. Rejected.

## Scorecard (1–5, higher is better)

| Driver                             | A. Incremental | B. Astro | C. React SPA |
| ---------------------------------- | :------------: | :------: | :----------: |
| Maintainability / content model    |       2        |    5     |      3       |
| Runtime JS / performance           |       4        |    5     |      2       |
| SEO & social (static)              |       3        |    5     |      2       |
| Accessibility baseline             |       3        |    4     |      3       |
| GitHub Pages + custom domain fit   |       5        |    5     |      4       |
| Routing / base-path simplicity     |       5        |    4     |      3       |
| Migration effort / regression risk |       5        |    3     |      3       |
| Future features + chatbot island   |       2        |    5     |      4       |
| Testing / DX                       |       3        |    4     |      4       |
| Cost / lock-in                     |       5        |    5     |      4       |
| **Total**                          |     **37**     |  **45**  |    **32**    |

## Decision

Adopt **Astro with static output**. It best satisfies the measured requirements —
maintainable content model, minimal JS, excellent SEO/performance, clean GitHub Pages +
custom-domain fit — while keeping the door open to a **React chat island** later without
an SPA rewrite. This honors "prefer the least complex architecture that satisfies the
requirements": Astro adds a modest build step but removes far more accidental complexity
(hand-edited HTML, CDN fragility) than it introduces.

## Consequences

**Positive:** validated content collections; `astro:assets` image optimization;
component reuse; static HTML for SEO/LCP; type safety; CI-tested build; future islands.
Measured result: Lighthouse (mobile) Perf 100 / A11y 100 / Best-Practices 96 / SEO 100;
axe 0 serious/critical in both themes.

**Negative / trade-offs:** a Node toolchain and a GitHub Actions deploy now exist
(contributors need Node ≥ 20; a one-time Pages "Source: GitHub Actions" switch is
required). Accepted as worthwhile.

## Migration strategy

Rebuild on a branch (`modernize-astro`), preserving all content, anchor URLs
(`#home/#about/#projects/#contact`), the custom domain (`public/CNAME`), and the
Formspree endpoint. Migrate the 12 projects into content entries; reorganize images into
`src/assets` (optimized) and `public/` (favicons/CNAME). Verify with type-check, lint,
build, link check, Playwright e2e, axe, and Lighthouse before merging.

## Rollback

The pre-migration site remains on `main` history. To roll back: revert the merge (or set
GitHub Pages Source back to "Deploy from branch: `main`"). No external/DNS changes are
required to revert. See `docs/MODERNIZATION_PLAN.md` §5.
