import type { APIRoute } from 'astro';
import { SITE } from '../config';

export const GET: APIRoute = ({ site }) => {
  const body = SITE.private
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
