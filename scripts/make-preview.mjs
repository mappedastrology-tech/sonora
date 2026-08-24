/**
 * Builds a single-file, browsable preview of the whole site.
 *
 * This exists because the site could not be deployed from the build
 * environment. It stitches every built page into one document with a page
 * switcher so the design and copy can be reviewed in a browser. It is a
 * preview, not the site: real URLs, the booking iframe, analytics, and the
 * forms only work once it is on Netlify.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');
const out = process.argv[2];

const PAGES = [
  ['/', 'index.html', 'Home'],
  ['/method', 'method.html', 'Method'],
  ['/why-now', 'why-now.html', 'Why now'],
  ['/services', 'services.html', 'Services'],
  ['/about', 'about.html', 'About'],
  ['/blog', 'blog.html', 'Writing'],
  [
    '/blog/why-rankings-dont-get-you-into-ai-answers',
    'blog/why-rankings-dont-get-you-into-ai-answers.html',
    'A post',
  ],
  ['/book', 'book.html', 'Book'],
  ['/contact', 'contact.html', 'Contact'],
  ['/privacy', 'privacy.html', 'Privacy'],
  ['/404', '404.html', '404'],
];

const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml' };

async function dataUri(assetPath) {
  const file = await readFile(path.join(dist, assetPath.replace(/^\//, '')));
  const extension = assetPath.split('.').pop();
  return `data:${MIME[extension] ?? 'application/octet-stream'};base64,${file.toString('base64')}`;
}

/* The stylesheet filename is content-hashed, so it changes whenever the CSS
   does. Read it off the page rather than hard-coding it. */
async function readStylesheets(html) {
  const hrefs = [...html.matchAll(/<link rel="stylesheet" href="(\/_astro\/[^"]+)"/g)].map(
    (match) => match[1]
  );

  if (!hrefs.length) {
    throw new Error('No local stylesheet found in the built HTML.');
  }

  const sheets = [];
  for (const href of hrefs) {
    sheets.push(await readFile(path.join(dist, href.replace(/^\//, '')), 'utf8'));
  }
  return sheets.join('\n');
}

let css = await readStylesheets(await readFile(path.join(dist, 'index.html'), 'utf8'));

// Every local image becomes a data URI so the page is self-contained.
const assets = new Map();
for (const asset of [
  '/brand/sonora-full.webp',
  '/brand/sonora-wordmark.webp',
  '/brand/sonora-wordmark-knockout.webp',
  '/brand/sonora-icon.webp',
  '/images/taylor-corbett.webp',
]) {
  assets.set(asset, await dataUri(asset));
}

/* Assets are referenced from CSS as well as from markup — the wordmark is a
   mask-image, not an <img>. Missing this left the logo invisible in every
   preview, since a standalone file has no server to resolve /brand/ against. */
for (const [asset, uri] of assets) {
  css = css.split(asset).join(uri);
}

const known = new Set(PAGES.map(([route]) => route));

/** Per-page scoped styles that Astro inlines into <head> rather than the
 *  shared stylesheet. Without these, component layout rules are missing. */
function headStyles(html) {
  const head = html.slice(0, html.indexOf('</head>'));
  return [...head.matchAll(/<style>([\s\S]*?)<\/style>/g)]
    .map((match) => match[1])
    .join('\n');
}

function transform(html, route) {
  /*
   * Body only — the artifact supplies the document shell. Everything after the
   * opening <body> tag, not up to </body>: Astro emits a page's hoisted
   * scripts *after* the closing tag, and slicing there dropped them. That is
   * how the method hero and the blog filters came to be inert in the preview
   * while working on the site.
   */
  let body = html.slice(html.indexOf('<body'));
  body = body.slice(body.indexOf('>') + 1);
  body = body.replace(/<\/body>|<\/html>/g, '');

  /*
   * Keep the interactive component scripts — the fit quiz, the nav toggle, the
   * homepage path switcher — so the preview behaves rather than just looking
   * right. Astro inlines them all as type="module", so there is nothing to
   * fetch from a server a standalone file does not have.
   *
   * Two kinds go: analytics has no business in a preview, and the layout's
   * scroll observer would fight the preview's own. The preview replaces it
   * because these pages are stitched into one document and each has to replay
   * on its visit — `data-reveal` identifies it, being the only script that
   * mentions it.
   */
  body = body.replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (tag, attrs, source) => {
    const isModule = /type="module"/.test(attrs);
    const isObserver = source.includes('data-reveal');
    return isModule && !isObserver ? tag : '';
  });

  // Inline the images.
  for (const [asset, uri] of assets) {
    body = body.split(asset).join(uri);
  }

  // Internal links drive the page switcher instead of navigating.
  body = body.replace(/href="(\/[^"#]*)"/g, (match, href) => {
    const target = href.replace(/\/$/, '') || '/';
    return known.has(target) ? `href="#" data-goto="${target}"` : match;
  });

  // The booking iframe points at Google; the preview cannot load it.
  body = body.replace(
    /<iframe[\s\S]*?<\/iframe>/,
    `<div class="preview-note">
       <strong>Google Calendar booking embed</strong>
       <span>Loads on the live site. Previews cannot embed third-party calendars.</span>
     </div>`
  );

  return `<section class="pv-page" data-route="${route}" hidden>${body}</section>`;
}

const sections = [];
const scopedStyles = new Set();
for (const [route, file] of PAGES) {
  const html = await readFile(path.join(dist, file), 'utf8');
  const styles = headStyles(html);
  if (styles) scopedStyles.add(styles);
  sections.push(transform(html, route));
}

const tabs = PAGES.map(
  ([route, , label]) =>
    `<button type="button" data-goto="${route}" class="pv-tab">${label}</button>`
).join('');

const page = `<title>Sonora Site Preview</title>
<style>
${css}
${[...scopedStyles].join('\n')}

/* ---- preview chrome only. None of this is part of the site. ---- */
.pv-bar {
  position: sticky; top: 0; z-index: 500;
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: #16133F; color: #FAF7F2;
  font-family: var(--font-body); font-size: 13px;
}
.pv-bar .pv-label {
  font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  opacity: .6; margin-right: 8px; font-size: 11px;
}
.pv-tab {
  appearance: none; cursor: pointer;
  padding: 7px 13px; border-radius: 999px;
  border: 1px solid rgba(250,247,242,.25);
  background: transparent; color: #FAF7F2;
  font: inherit; font-weight: 500;
}
.pv-tab:hover { border-color: #F3C677; }
.pv-tab[aria-current="true"] { background: #F3C677; border-color: #F3C677; color: #0C0A3E; }
.pv-page[hidden] { display: none; }
.pv-note-bar {
  padding: 10px 16px; background: #F4EFE7; color: #3A3852;
  font-family: var(--font-body); font-size: 13px; line-height: 1.5;
  border-bottom: 1px solid var(--rule);
}
.preview-note {
  display: flex; flex-direction: column; gap: 6px;
  max-width: 820px; padding: 40px 32px;
  border: 2px dashed var(--rule); border-radius: 2px;
  background: #F4EFE7; font-family: var(--font-body);
}
.preview-note strong { color: var(--ink); }
.preview-note span { color: var(--muted); font-size: 15px; }
/* The real header is sticky; stacked under the preview bar it fights for the
   top edge, so it is pinned normally here. */
.pv-page .site-header { position: static; }
</style>

<nav class="pv-bar" aria-label="Preview pages">
  <span class="pv-label">Preview</span>
  ${tabs}
</nav>
<p class="pv-note-bar">
  This is a static preview of every page, stitched into one file so it can be
  viewed without a deploy. Forms, the booking calendar, analytics and the real
  URLs only work once the site is live on Netlify.
</p>

${sections.join('\n')}

<script>
  (function () {
    document.documentElement.classList.add('js');
    const pages = document.querySelectorAll('.pv-page');
    const tabs = document.querySelectorAll('.pv-tab');

    function show(route) {
      let matched = false;
      pages.forEach(function (page) {
        const isTarget = page.dataset.route === route;
        page.hidden = !isTarget;
        if (isTarget) matched = true;
      });
      if (!matched) return show('/');
      tabs.forEach(function (tab) {
        tab.setAttribute('aria-current', String(tab.dataset.goto === route));
      });
      // Instant, not smooth: the site sets scroll-behavior: smooth, and a
      // page switch that eases back to the top would arm sections the reader
      // is only scrolling past.
      window.scrollTo({ top: 0, behavior: 'instant' });
      // A frame later, so the newly-unhidden page has boxes and the scroll
      // reset has landed — otherwise a section still measures as in view and
      // arms before the reader gets to it.
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          pages.forEach(function (page) {
            if (page.dataset.route === route) animate(page);
          });
        });
      });
    }

    /*
     * Preview-only. This mirrors the scroll observer in src/layouts/Base.astro
     * so the motion can be reviewed here, and re-arms on every page visit —
     * the real site loads one page at a time and never needs to replay. The
     * site's own behaviour is verified against the built pages, not this.
     */
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(page) {
      const reveals = Array.from(page.querySelectorAll('[data-reveal]'));
      const blocks = Array.from(page.querySelectorAll('[data-animate]'));

      // Clear anything a previous visit to this page left behind.
      reveals.forEach(function (el) {
        delete el.dataset.shown;
        el.classList.remove('is-visible');
        el.style.transition = '';
        el.style.transitionDelay = '';
      });
      blocks.forEach(function (el) {
        delete el.dataset.armed;
        delete el.dataset.instant;
      });

      function showReveal(el, moving) {
        if (el.dataset.shown) return;
        el.dataset.shown = '1';
        if (moving) {
          const sibs = Array.from(
            el.parentElement.querySelectorAll(':scope > [data-reveal]')
          );
          el.style.transitionDelay =
            Math.min(Math.max(sibs.indexOf(el), 0), 4) * 80 + 'ms';
        } else {
          el.style.transition = 'none';
        }
        el.classList.add('is-visible');
      }

      function armBlock(el, moving) {
        if (el.dataset.armed) return;
        if (!moving) el.dataset.instant = '1';
        el.dataset.armed = '1';
      }

      if (reduced || !('IntersectionObserver' in window)) {
        reveals.forEach(function (el) { showReveal(el, false); });
        blocks.forEach(function (el) { armBlock(el, false); });
        return;
      }

      if (page._observers) page._observers.forEach(function (o) { o.disconnect(); });

      const revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            showReveal(entry.target, true);
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }
      );

      const blockObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            const el = entry.target;
            const rect = el.getBoundingClientRect();
            if (!entry.isIntersecting || !rect.height) return;
            const vis =
              Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
            const frac =
              Math.max(vis, 0) / Math.min(rect.height, window.innerHeight);
            if (frac < 0.35) return;
            armBlock(el, true);
            blockObserver.unobserve(el);
          });
        },
        { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35] }
      );

      reveals.forEach(function (el) { revealObserver.observe(el); });
      blocks.forEach(function (el) { blockObserver.observe(el); });
      page._observers = [revealObserver, blockObserver];

      window.setTimeout(function () {
        reveals.forEach(function (el) { showReveal(el, false); });
        blocks.forEach(function (el) { armBlock(el, false); });
      }, 12000);
    }

    document.addEventListener('click', function (event) {
      const trigger = event.target.closest('[data-goto]');
      if (!trigger) return;
      event.preventDefault();
      show(trigger.dataset.goto);
    });

    show('/');
  })();
</script>`;

await writeFile(out, page);
console.log(`preview written to ${out} (${(page.length / 1024).toFixed(0)} KB)`);
