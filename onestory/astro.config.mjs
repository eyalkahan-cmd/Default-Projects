// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL is the final public address (e.g. https://onestory.co.il).
// Until the site goes public it stays a placeholder and every page ships with noindex.
const site = process.env.SITE_URL ?? 'https://example.com';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  build: { format: 'directory', assets: 'assets' },
  integrations: [sitemap()],
});
