/**
 * Dependency-free broken-link checker for the built site (dist/).
 * Verifies every internal href/src resolves to a real file, and every in-page
 * anchor (#id, /path#id) points at an element that exists. External links are
 * tallied but not fetched (kept deterministic for CI). Run: `npm run test:links`.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (entry.endsWith('.html')) out.push(p);
  }
  return out;
}

const idsOf = (html) => new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
const rel = (p) => p.replace(dist + '/', '');

const files = htmlFiles(dist);
const external = new Set();
let errors = 0;

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const ids = idsOf(html);
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);

  for (const ref of refs) {
    if (/^(https?:)?\/\//.test(ref)) {
      external.add(ref.replace(/^(https?:\/\/[^/]+).*/, '$1'));
      continue;
    }
    if (/^(mailto:|tel:|data:|#$)/.test(ref)) continue;

    if (ref.startsWith('#')) {
      const id = ref.slice(1);
      if (id && !ids.has(id)) {
        console.error(`✗ ${rel(file)} -> missing anchor ${ref}`);
        errors++;
      }
      continue;
    }

    const [path, hash] = ref.split('#');
    let target;
    if (path === '/' || path === '') {
      target = join(dist, 'index.html');
    } else if (path.startsWith('/')) {
      const clean = path.replace(/\/$/, '');
      target = [join(dist, clean), join(dist, `${clean}.html`), join(dist, clean, 'index.html')].find(
        existsSync
      );
    } else {
      target = join(dirname(file), path);
    }

    if (!target || !existsSync(target)) {
      console.error(`✗ ${rel(file)} -> missing ${ref}`);
      errors++;
      continue;
    }

    if (hash && target.endsWith('.html')) {
      const targetIds = idsOf(readFileSync(target, 'utf8'));
      if (!targetIds.has(hash)) {
        console.error(`✗ ${rel(file)} -> ${path} has no anchor #${hash}`);
        errors++;
      }
    }
  }
}

console.log(`Checked ${files.length} HTML file(s).`);
console.log(`External hosts referenced: ${[...external].sort().join(', ') || 'none'}`);

if (errors) {
  console.error(`\n${errors} broken internal link(s)/anchor(s).`);
  process.exit(1);
}
console.log('✓ No broken internal links, anchors, or assets.');
