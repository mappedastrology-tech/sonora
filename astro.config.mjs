// @ts-check
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The canonical origin. Every absolute URL on the site — canonicals, OG tags,
// JSON-LD, the sitemap, RSS — is derived from this one value. Change it here
// and nowhere else.
export const SITE = 'https://sonoramethod.com';

/*
 * lastmod, but only where it can be stated truthfully.
 *
 * The tempting version of this is `lastmod: new Date()`, which stamps every
 * URL with the build time. That is worse than nothing: it claims the whole site
 * changed on every deploy, and a sitemap whose dates are noise is a sitemap
 * whose dates get ignored. So each page is dated from something real, and a
 * page with no honest date simply carries none — a partial lastmod is valid,
 * an inaccurate one is not.
 *
 * Posts carry their own dates in frontmatter. Everything else is dated by the
 * commit that last touched its source file, which means a build with no git
 * history available (a shallow clone) reports no date rather than a wrong one.
 */
const gitLastModified = (file) => {
  try {
    const stamp = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return stamp ? new Date(stamp) : null;
  } catch {
    return null;
  }
};

const frontmatterDate = (file) => {
  if (!existsSync(file)) return null;
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'))?.[1] ?? '';
  // `updated` wins when a post has been revised; `date` is when it went up.
  const raw =
    /^updated:\s*(\S+)/m.exec(block)?.[1] ?? /^date:\s*(\S+)/m.exec(block)?.[1];
  if (!raw) return null;
  const date = new Date(raw.replace(/^["']|["']$/g, ''));
  return Number.isNaN(date.valueOf()) ? null : date;
};

const sourceFile = (pathname) => {
  if (pathname === '/') return 'src/pages/index.astro';
  if (pathname === '/blog') return 'src/pages/blog/index.astro';
  if (pathname.startsWith('/blog/')) return `src/content/blog/${pathname.slice(6)}.md`;
  return `src/pages/${pathname.slice(1)}.astro`;
};

const lastmodFor = (pathname) => {
  const file = sourceFile(pathname);
  const fromPost = pathname.startsWith('/blog/') ? frontmatterDate(file) : null;
  return fromPost ?? gitLastModified(file);
};

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: {
    // Emit /method.html rather than /method/index.html so Netlify serves clean
    // URLs without a trailing-slash redirect.
    format: 'file',
  },
  integrations: [
    sitemap({
      // /thanks is noindex — a form confirmation has no business in a sitemap.
      filter: (page) => !page.includes('/thanks'),
      serialize: (item) => {
        const { pathname } = new URL(item.url);
        /*
         * Nothing here can change the homepage URL. With trailingSlash 'never'
         * or build.format 'file' — this site has both — the integration rewrites
         * `<loc>${SITE}/</loc>` to `<loc>${SITE}</loc>` as a string replace on
         * the finished XML, after this hook has run. So the alignment happens
         * on the other side: absoluteUrl() in src/lib/site.ts emits the root
         * bare, so the canonical, og:url and JSON-LD all match this file.
         */
        const lastmod = lastmodFor(pathname);
        if (lastmod) {
          item.lastmod = lastmod;
        } else {
          // Visible in the deploy log, because silence here looks like success.
          console.warn(
            `[sitemap] no lastmod for ${pathname} — nothing dated ${sourceFile(pathname)}`
          );
        }
        return item;
      },
    }),
  ],
});
