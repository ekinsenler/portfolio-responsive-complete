# Portfolio Modernization Plan

Status date: 2026-07 · Branch: `modernize-astro` · Owner: Ekin Senler

This document is the baseline audit + executable backlog for modernizing
`ekinsenler.com`. Task status is updated only after verification.

---

## 1. Baseline audit (the "before" state)

The site was a fork of `bedimcode/portfolio-responsive-complete` served as **raw
static files from `main`** by GitHub Pages, with a custom domain
(`www.ekinsenler.com`, `CNAME`) fronted by Cloudflare (DNS/proxy only — no Pages
Functions/Workers). There was **no build step, no CI, no package manifest**.

**Files:** `index.html` (single page), `assets/css/styles.css` (compiled from an
un-toolchained `styles.scss`), `assets/js/main.js`, `contact-form-handler.php`
(dead — Pages cannot execute PHP), favicon set, and profile images.

**Issues found:**

| Area             | Finding                                                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content model    | Adding a project meant hand-editing HTML; `<div>`s were illegally nested directly in a `<ul>`; an `<h5>` skipped `<h4>`.                                                                                                                                                                                      |
| Accessibility    | Menu toggle was a `<div>` with no `aria-expanded`/keyboard support; hero "Contact" CTA was `href="#"` (broken); social icon links had no accessible name; form inputs had no `<label>`s; About image had empty `alt`.                                                                                         |
| Performance      | Render-blocking CDNs: Boxicons CSS, ScrollReveal (unpinned `unpkg`), Google Fonts `@import`. Images oversized: `pp_nobackground.png` (1.9 MB, **unused**), `pp_ai.png` (768 KB), `bubbles_logo.png` (4500×4500, shown at 150px), `pp_background.jpeg` (308 KB with EXIF/GPS). No `.webp`/responsive variants. |
| SEO              | No meta description, canonical, Open Graph/Twitter cards, structured data, `robots.txt`, or sitemap. `site.webmanifest` had empty name and broken icon paths.                                                                                                                                                 |
| Security/privacy | Dead PHP handler hardcoded a personal email; contact via Formspree (kept). No secrets present.                                                                                                                                                                                                                |
| Deployment       | No CI; relied on Pages "deploy from branch". No `.nojekyll` (latent risk with `_`-prefixed dirs).                                                                                                                                                                                                             |

**Baseline measurement note:** the pre-existing site could not be scored with
Lighthouse from this environment without standing up the old server; the audit above
is source-derived. The **after** measurements below are real Lighthouse runs.

---

## 2. Architecture decision

**Chosen: Astro (static output + islands).** Full rationale, scored alternatives,
migration and rollback strategy: **`docs/adr/0001-frontend-architecture.md`**.

Confirmed product decisions (with the owner):

- Design: accessible **dark mode**, **CV/resume** capability, **project case-study**
  capability (structure now), keep the **blue accent + blob hero** identity.
- Attribution: **leave as-is** this pass; tracked as `LEGAL-1`.
- Chatbot: **readiness docs + boundaries only** — no live bot, no secrets.

---

## 3. Executable backlog

Priority: **Now** / Next / Later. Effort: S/M/L. Status: ✅ done · ⬜ not started.
All **Now** items were implemented and verified in this pass.

### 1. Repository safety & baseline

| ID     | Pri | Eff | Status | Task / acceptance                                                   |
| ------ | --- | --- | ------ | ------------------------------------------------------------------- |
| SAFE-1 | Now | S   | ✅     | Work on branch `modernize-astro`; `main` untouched and recoverable. |
| SAFE-2 | Now | S   | ✅     | Baseline audit recorded here.                                       |

### 2. Build & architecture foundation

| ID      | Pri | Eff | Status | Task / acceptance                                                                                                                                                                  |
| ------- | --- | --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BUILD-1 | Now | M   | ✅     | Astro + TS scaffold, `package.json` + committed lockfile, `astro.config` (`site`/`base:'/'`/sitemap), `public/CNAME` + `.nojekyll`. Verify: `dist/CNAME` present, assets relative. |
| BUILD-2 | Now | S   | ✅     | ESLint (flat) + Prettier + `astro check` + npm scripts. Verify: all clean.                                                                                                         |
| ADR-1   | Now | S   | ✅     | `docs/adr/0001-frontend-architecture.md`.                                                                                                                                          |

### 3. Content model & components

| ID        | Pri | Eff | Status | Task / acceptance                                                                                                                             |
| --------- | --- | --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| CONTENT-1 | Now | M   | ✅     | Zod-validated `projects` collection + `src/data/site.ts`.                                                                                     |
| CONTENT-2 | Now | M   | ✅     | 12 projects migrated to one entry each; grid renders from the collection; invalid `<div>`-in-`<ul>` markup gone. Verify: e2e counts 12 cards. |
| CONTENT-3 | Now | L   | ✅     | Hero/About/Projects/Contact/Header/Footer components; all anchors + content preserved.                                                        |

### 4. Visual modernization

| ID       | Pri | Eff | Status | Task / acceptance                                                                                                       |
| -------- | --- | --- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| DESIGN-1 | Now | M   | ✅     | `tokens.css` design system (color/type/space/radius/shadow/motion).                                                     |
| DESIGN-2 | Now | M   | ✅     | Accessible dark mode: no-flash init, system-pref fallback, persisted toggle. Verify: e2e persistence + axe both themes. |
| DESIGN-3 | Now | L   | ✅     | Modern layout/hierarchy/nav/CTA; blob + blue identity retained.                                                         |
| DESIGN-4 | Now | S   | ✅     | CV capability wired (button appears when `cv.available`); no placeholder shipped.                                       |

### 5. Accessibility (WCAG 2.2 AA)

| ID     | Pri | Eff | Status | Task / acceptance                                                                                        |
| ------ | --- | --- | ------ | -------------------------------------------------------------------------------------------------------- |
| A11Y-1 | Now | S   | ✅     | Real `<button>` menu toggle with `aria-expanded`, keyboard + Escape.                                     |
| A11Y-2 | Now | M   | ✅     | Hero CTA → `#contact`; accessible names on icon/social links; skip link; logical headings (h1→h2→h3).    |
| A11Y-3 | Now | M   | ✅     | Contact form: labels, `required`, correct types, honeypot, **honest** submit (success only on real 200). |
| A11Y-4 | Now | S   | ✅     | `prefers-reduced-motion` respected (reveal, transitions, smooth scroll).                                 |

### 6. Performance & assets

| ID     | Pri | Eff | Status | Task / acceptance                                                                                                                                |
| ------ | --- | --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| PERF-1 | Now | M   | ✅     | `astro:assets` → AVIF/WebP + responsive srcset + intrinsic dims; hero eager, below-fold lazy; EXIF stripped on re-encode; unused images deleted. |
| PERF-2 | Now | M   | ✅     | Self-host Poppins; drop Boxicons + ScrollReveal CDNs; Credly loaded once, async, HTTPS.                                                          |
| PERF-3 | Now | S   | ✅     | Lockfile committed; minimal deferred JS; no layout shift.                                                                                        |

### 7. SEO & structured data

| ID    | Pri | Eff | Status | Task / acceptance                                                        |
| ----- | --- | --- | ------ | ------------------------------------------------------------------------ |
| SEO-1 | Now | M   | ✅     | Title, description, canonical, OG + Twitter, theme-color.                |
| SEO-2 | Now | S   | ✅     | `robots.txt`, `@astrojs/sitemap`, `404.astro`, fixed `site.webmanifest`. |
| SEO-3 | Now | S   | ✅     | Person + WebSite JSON-LD from verified facts only.                       |
| SEO-4 | Now | S   | ✅     | Branded OG card generated (`scripts/generate-og.mjs`).                   |

### 8. Security & privacy

| ID    | Pri | Eff | Status | Task / acceptance                                                                                       |
| ----- | --- | --- | ------ | ------------------------------------------------------------------------------------------------------- |
| SEC-1 | Now | S   | ✅     | `.env.example` (names only); secret scan of source + `dist/` clean; `rel="noopener"` on external links. |
| SEC-2 | Now | S   | ✅     | Dead `contact-form-handler.php` removed (recoverable via git); email absent from bundle.                |
| SEC-3 | Now | S   | ✅     | Privacy posture documented (below). No new tracking/cookies added by us.                                |

### 9. Automated tests & CI

| ID     | Pri | Eff | Status | Task / acceptance                                                            |
| ------ | --- | --- | ------ | ---------------------------------------------------------------------------- |
| CI-1   | Now | M   | ✅     | `deploy.yml`: checks + build + link check + deploy `dist/` to Pages.         |
| TEST-1 | Now | M   | ✅     | Playwright smoke: nav, mobile menu ARIA, theme, form, 404, skip link.        |
| TEST-2 | Now | M   | ✅     | Link checker + axe a11y scan (light + dark); `ci.yml` runs full gate on PRs. |

### 10. Deployment

| ID       | Pri | Eff | Status | Task / acceptance                                                                              |
| -------- | --- | --- | ------ | ---------------------------------------------------------------------------------------------- |
| DEPLOY-1 | Now | S   | ✅     | Custom-domain build verified (CNAME in `dist/`, relative assets, anchors, 404). Runbook below. |

### 11. Chatbot readiness

| ID    | Pri | Eff | Status | Task / acceptance                                                                                        |
| ----- | --- | --- | ------ | -------------------------------------------------------------------------------------------------------- |
| BOT-1 | Now | M   | ✅     | `docs/CHATBOT_ARCHITECTURE.md` (boundary + acceptance tests).                                            |
| BOT-2 | Now | M   | ✅     | Versioned Zod schema (`src/schemas/knowledge.ts`) + build-time `/api/knowledge.json`; public-only facts. |

### Legal / attribution

| ID      | Pri  | Eff | Status | Task / acceptance                                                                                                                                                                                                                                                                                           |
| ------- | ---- | --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LEGAL-1 | Next | S   | ⬜     | Decide attribution/licensing. Upstream template has **no LICENSE**; the README credit to Bedimcode was removed in history. Owner chose "leave as-is" for this pass. **Action:** confirm reuse terms with the template author, then restore a discreet credit and/or add a LICENSE for the owner's own code. |

### Next / Later (not built this pass)

- Per-project case-study pages (schema field `slug` reserved; grid ready).
- Writing/blog content collection.
- Visual-regression snapshots in CI.
- Chatbot implementation (Cloudflare Worker `/api/chat`) — needs approval + a
  provider key (potentially paid). See `docs/CHATBOT_ARCHITECTURE.md`.
- Embeddings/vector DB — only if evaluations prove a need.

---

## 4. Before / after

| Metric                  | Before                                         | After                                                               |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| Build/toolchain         | none (raw files)                               | Astro 5 + TS, reproducible, lockfile committed                      |
| CI/CD                   | none                                           | GitHub Actions (PR gate + Pages deploy)                             |
| Render-blocking CDNs    | Boxicons, ScrollReveal, Google Fonts `@import` | none (self-hosted font, inline SVG icons)                           |
| Largest images          | 1.9 MB (unused) + 768 KB PNG                   | WebP, responsive: hero ≈ 11–58 KB, logo ≈ 1–100 KB                  |
| Client JS               | ScrollReveal + inline                          | one small deferred module                                           |
| SEO metadata            | none                                           | title, description, canonical, OG/Twitter, JSON-LD, sitemap, robots |
| Accessibility           | div menu, no labels, broken CTA                | WCAG 2.2 AA; axe: 0 serious/critical (light + dark)                 |
| **Lighthouse (mobile)** | not measured (see §1)                          | **Perf 100 · A11y 100 · Best-Practices 96 · SEO 100**               |

Lighthouse: real run against `astro preview` using Chrome for Testing. Best-Practices
96 (not 100) is attributable to the third-party Credly badge embed; still ≥ 90 target.
Re-run locally: `npm run build && npm run preview` then
`npx lighthouse http://localhost:4321/ --only-categories=performance,accessibility,best-practices,seo`.

---

## 5. Deployment runbook & required manual actions

The build/deploy is automated (`.github/workflows/deploy.yml`). Two actions require
the owner (external — not performed automatically):

1. **Switch Pages source (one-time).** GitHub → repo **Settings → Pages → Build and
   deployment → Source → "GitHub Actions"**. Do this only after the `modernize-astro`
   branch is merged and the workflow has produced a green build. Until then, the
   existing "Deploy from branch" keeps the current site live — so the switch is safe.
2. **Provide a CV PDF** (optional) at `public/cv/ekin-senler-cv.pdf` and set
   `cv.available: true` in `src/data/site.ts` to enable the download button.

**No DNS/Cloudflare changes are needed.** `public/CNAME` keeps `www.ekinsenler.com`
attached to the deployment artifact.

**Rollback:** either revert Pages Source to "Deploy from branch: `main`", or
`git revert` the merge and let the workflow redeploy the prior state. The pre-migration
site remains on `main`'s history throughout.

---

## 6. Privacy posture

- No analytics, cookies, or trackers are added by this site.
- Third parties: **Formspree** (only when a visitor submits the contact form) and
  **Credly** (badge embeds in About; loads an iframe from `credly.com`). Both are
  pre-existing owner choices. If a privacy/consent notice is later required, Credly is
  the item to disclose.
- No secrets ship to the browser; `.env.example` documents names only. `/api/knowledge.json`
  exposes only already-public portfolio facts (no email, no private data).
