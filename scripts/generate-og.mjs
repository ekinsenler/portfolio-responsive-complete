/**
 * Generates public/og-image.png (1200×630) — the social sharing card.
 * Uses only verified facts (name, role, domain). Run: `npm run og`.
 * Re-run whenever the name/role changes. Text renders in a system sans-serif.
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'public', 'og-image.png');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a1120"/>
      <stop offset="1" stop-color="#111a30"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3e6ff4"/>
      <stop offset="1" stop-color="#7aa2ff"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1040" cy="120" r="280" fill="url(#accent)" opacity="0.16"/>
  <circle cx="1120" cy="560" r="160" fill="url(#accent)" opacity="0.10"/>
  <rect x="90" y="238" width="64" height="8" rx="4" fill="url(#accent)"/>
  <text x="90" y="326" font-family="Helvetica, Arial, sans-serif" font-size="88" font-weight="700" fill="#f4f7ff">Ekin Senler</text>
  <text x="90" y="402" font-family="Helvetica, Arial, sans-serif" font-size="48" font-weight="600" fill="#7aa2ff">AI Engineer</text>
  <text x="90" y="470" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="400" fill="#9fb0d0">Machine Learning &#183; NLP &#183; Computer Vision &#183; LLMs</text>
  <text x="90" y="566" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="600" fill="#5f7bb8">www.ekinsenler.com</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log('Wrote', out);
