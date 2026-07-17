// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Custom domain (GitHub Pages + Cloudflare DNS) serves at the root, so base is '/'.
// `site` is required for correct canonical URLs and the generated sitemap.
export default defineConfig({
  site: 'https://www.ekinsenler.com',
  base: '/',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    // Keep hashed build assets under _astro/ (safe on Pages because the
    // GitHub Actions artifact deploy bypasses Jekyll; .nojekyll is belt-and-braces).
    assets: '_astro',
  },
  image: {
    // Use the default sharp service to emit AVIF/WebP + responsive sources.
    responsiveStyles: true,
  },
});
