# Chatbot Architecture (readiness — not yet live)

> **Status: design + readiness only.** No chatbot is shipped. No `/api/chat` code,
> model key, or secret exists in this repo. This document defines the boundary, data
> contract, security controls, and acceptance tests so a first version can be built and
> deployed later **with the owner's explicit approval** (it requires a serverless backend
> and a model-provider key — potentially paid).

## 1. Purpose & scope

A small assistant that answers questions **about Ekin Senler** using **only approved
public information** from this portfolio. It must disclose that it is an AI assistant
based on public materials, cite the section it used, and **abstain** when the answer is
not in its knowledge base. It must not impersonate the owner, invent opinions, make
commitments, or state unsupported facts.

**Out of scope for v1 (hard limits):** arbitrary URL ingestion, file uploads,
tools/actions, access to private systems, cross-user memory, embeddings/vector DB.

## 2. Boundary

```
Browser chat UI (lazy-loaded island, never auto-opens)
   │  POST same-origin /api/chat   (message + short history)
   ▼
Trusted serverless/edge handler   (holds the model key; exact-origin check)
   │  builds prompt from →
   ▼
Curated read-only public knowledge base   (/api/knowledge.json, build-time)
   │
   ▼
Replaceable model-provider adapter   (Anthropic / OpenAI / …)
   │
   ▼
Grounded, source-referenced answer  (or explicit abstention)
```

GitHub Pages is static and cannot run server code, so the model call **must** go through
a trusted backend. Options for that backend are compared in §8.

## 3. Knowledge data contract (built now)

- **Schema:** `src/schemas/knowledge.ts` — a **versioned** (`KNOWLEDGE_SCHEMA_VERSION`),
  Zod-validated shape for public facts (person, education, projects, disclaimers).
- **Generation:** `src/pages/api/knowledge.json.ts` emits **`/api/knowledge.json`** at
  build time from `src/data/site.ts` + the `projects` collection. The backend consumes
  this artifact — **it never parses a PDF per request**.
- **Public vs excluded:** the artifact contains only facts already published on the site.
  **Excluded by construction:** email, private CV details, anything not in `site.ts`/
  project entries. Start with this curated structured context — do **not** add embeddings
  or a vector database until evaluations prove a small CV needs them.
- **Staleness:** the backend checks `schemaVersion` and should refuse/warn on mismatch;
  regenerate the artifact on every deploy so context can't silently drift from the site.

## 4. Security controls (required before any launch)

Treat **all** user input and retrieved content as untrusted.

- **Exact-origin check:** accept requests only from `https://www.ekinsenler.com`
  (`CHAT_ALLOWED_ORIGIN`); reject others. No wildcard CORS.
- **Schema validation:** validate request body (message string, optional bounded history)
  and the model's output shape; reject anything malformed.
- **Input / history / output limits:** `CHAT_MAX_INPUT_CHARS`, `CHAT_MAX_HISTORY_TURNS`,
  `CHAT_MAX_OUTPUT_TOKENS` (see `.env.example`).
- **Rate & concurrency limits:** per-IP `CHAT_RATE_LIMIT_PER_MIN`; cap concurrent calls.
- **Token/cost budget & kill switch:** `CHAT_MONTHLY_TOKEN_BUDGET`; `CHAT_KILL_SWITCH`
  disables the endpoint instantly (also usable as a feature flag).
- **Prompt-injection resistance:** system prompt instructs the model to treat knowledge
  and user text as data, never as instructions; never reveal the system prompt or secrets.
- **Output sanitization & link allowlist:** render the reply as plain text / escaped
  Markdown (no raw HTML). Only links whose host is on an allowlist (e.g. the portfolio,
  the owner's GitHub/LinkedIn, project links) may be surfaced.
- **Timeouts:** provider timeout with a graceful fallback message.
- **Secrets stay server-side:** model key, any bot-verification secret, and the system
  prompt live only in the serverless environment. Never in client code, the bundle, or git.

## 5. Behavior policy

- Discloses it is an AI assistant answering from public materials.
- Answers **only** about the portfolio owner from the knowledge base; cites the
  section/`sourceId` used.
- **Abstains** honestly ("I don't have that information") when unsupported; never guesses.
- Never impersonates the owner, invents opinions/metrics, or makes commitments on their
  behalf.

## 6. Chatbot acceptance test plan

Ship v1 only when these pass:

1. **Correct answer + accurate source reference** for in-scope questions.
2. **Unsupported question → honest abstention** (no fabrication).
3. **Conflicting source content** handled predictably (prefer newest/most specific; flag).
4. **Stale/version mismatch** between backend and `/api/knowledge.json` is detected.
5. **Prompt injection** — direct, encoded, and multi-turn attempts — is refused.
6. **System-prompt / secret exfiltration** attempts fail.
7. **HTML / Markdown / link / XSS payloads** render inertly (escaped, no script exec).
8. **Request / response / history limits** enforced (oversize input rejected).
9. **Rate limiting / abuse protection** triggers as configured.
10. **Provider timeout / outage** yields a graceful, honest fallback.
11. **No secret leakage** in source, logs, or the production bundle.
12. **No conversation leakage** between sessions (history is ephemeral).
13. **Budget cap, feature flag, and kill switch** each verifiably disable/limit the bot.

## 7. Privacy, retention & observability

- **Ephemeral history by default;** no cross-user memory.
- **Do not log full conversations or personal data** unless explicitly approved; prefer
  aggregate metrics (counts, latencies, token usage, error rates).
- Define retention/deletion windows and the provider data-flow (which text leaves to the
  model provider) before launch; add a short privacy note if conversations are retained.

## 8. Hosting options for the backend (compare before choosing — not decided)

| Option                                                                | Same-origin `/api/chat`                                           | Migration effort              | Previews                    | Limits                                   | Cost                          | Lock-in             | Custom domain / TLS                   |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------- | --------------------------- | ---------------------------------------- | ----------------------------- | ------------------- | ------------------------------------- |
| **1. Keep GitHub Pages + Cloudflare Worker**                          | Via Cloudflare route mapping `/api/*` → Worker on the same domain | Low (frontend unchanged)      | Worker preview URLs         | CPU/time per request; generous free tier | Low (free tier likely enough) | Medium (Cloudflare) | Already on Cloudflare; TLS unaffected |
| **2. Move frontend to Cloudflare Pages + Pages Functions**            | Native same-origin functions                                      | Medium (change host + deploy) | First-class per-PR previews | Similar to Workers                       | Low                           | Medium–High         | Re-point domain to Pages              |
| **3. Other static host + serverless (e.g. Netlify/Vercel functions)** | Native functions                                                  | Medium–High (leave GH Pages)  | First-class previews        | Platform-specific                        | Low–Medium                    | Higher              | Re-point domain                       |

**Preliminary lean (not a commitment):** Option 1 keeps the current, working GitHub
Pages + Cloudflare setup and adds the smallest surface — a single Worker for `/api/chat`
routed on the existing domain — preserving same-origin without a hosting migration. The
owner decides if/when to proceed; an exact runbook will accompany that change. **No
external, DNS, or paid resource change will be made without explicit approval.**

## 9. What exists now vs. later

- **Now (this repo):** boundary design, versioned public-facts schema, build-time
  `/api/knowledge.json`, `.env.example` (names only), this document.
- **Later (needs approval):** the lazy-loaded, accessible, keyboard-operable, reduced-
  motion-aware chat widget (never auto-opens); the `/api/chat` handler + provider adapter;
  the Worker deploy + provider key.
