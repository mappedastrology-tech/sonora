/**
 * Pre-launch verification, run against the built output in dist/.
 *
 * This is the checklist from the build spec, automated where automation is
 * possible. It does not replace Lighthouse, a real phone, or a keyboard pass —
 * those are listed at the end as manual steps.
 *
 * Usage: npm run build && npm run verify
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

let failures = 0;
let warnings = 0;

const pass = (message) => console.log(`  ok    ${message}`);
const fail = (message) => {
  failures += 1;
  console.log(`  FAIL  ${message}`);
};
const warn = (message) => {
  warnings += 1;
  console.log(`  warn  ${message}`);
};

const heading = (title) => console.log(`\n${title}`);

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function html(name) {
  return readFile(path.join(dist, name), 'utf8');
}

/** Curly quotes are emitted as entities; compare on a normalised copy. */
function decode(source) {
  return source
    .replace(/&rsquo;|&#8217;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&middot;/g, '\u00b7')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Every page, and a phrase from its body copy that must survive with JS off. */
const PAGES = [
  ['index.html', '/', 'Ranking first isn’t the same as getting found'],
  ['method.html', '/method', 'Everything starts with learning the market'],
  ['services.html', '/services', 'Strategy Sprint'],
  ['about.html', '/about', 'It was never a product problem'],
  ['blog.html', '/blog', 'Working notes on search, positioning'],
  ['book.html', '/book', 'Thirty minutes'],
  ['contact.html', '/contact', 'What’s not working?'],
  ['thanks.html', '/thanks', 'within a business day'],
  ['privacy.html', '/privacy', 'This site collects almost nothing'],
  ['404.html', '/404', 'opposite of the problem we usually solve'],
];

/*
 * Posts are appended from the content directory rather than listed here, and
 * the phrase each one is checked for comes out of its own body. A hardcoded
 * list went stale the moment a post was renamed, and the checks it owned went
 * quiet instead of failing.
 */
const blogSource = path.join(root, 'src', 'content', 'blog');
const POST_SLUGS = [];
for (const file of (await readdir(blogSource)).filter((f) => f.endsWith('.md'))) {
  const raw = await readFile(path.join(blogSource, file), 'utf8');
  if (/^draft:\s*true/m.test(raw)) continue;
  const body = raw.slice(raw.indexOf('\n---\n', 4) + 5);
  const sentence = body
    .split('\n')
    .map((line) => line.replace(/^#+\s*/, '').trim())
    .find((line) => line.length > 60 && !line.startsWith('*') && !line.startsWith('-'));
  const slug = file.replace(/\.md$/, '');
  POST_SLUGS.push(slug);
  PAGES.push([`blog/${slug}.html`, `/blog/${slug}`, sentence.slice(0, 48)]);
}

heading('Body copy present in the served HTML (JS disabled)');
const documents = new Map();
for (const [file, route, phrase] of PAGES) {
  if (!(await exists(path.join(dist, file)))) {
    fail(`${route} — ${file} was not built`);
    continue;
  }
  const source = await html(file);
  documents.set(route, source);
  if (decode(source).includes(phrase)) {
    pass(`${route} contains "${phrase.slice(0, 34)}…"`);
  } else {
    fail(`${route} is missing body copy: "${phrase}"`);
  }
}

heading('Unique titles and descriptions');
const titles = new Map();
const descriptions = new Map();
for (const [route, source] of documents) {
  /* Decode before measuring: an ampersand is five characters in the markup and
     one on a results page, so measuring the raw HTML overstates any title
     containing one. */
  const title = decode(source.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const description = decode(
    source.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''
  );

  if (!title) {
    fail(`${route} has no <title>`);
  } else {
    if (titles.has(title)) fail(`${route} duplicates the title on ${titles.get(title)}`);
    titles.set(title, route);
    if (title.length > 60) warn(`${route} title is ${title.length} chars (target: under 60)`);
  }

  if (!description) {
    fail(`${route} has no meta description`);
  } else {
    if (descriptions.has(description)) {
      fail(`${route} duplicates the description on ${descriptions.get(description)}`);
    }
    descriptions.set(description, route);
    if (description.length > 155) {
      warn(`${route} description is ${description.length} chars (target: under 155)`);
    }
  }
}
if (titles.size === documents.size) pass(`${titles.size} unique titles`);
if (descriptions.size === documents.size) pass(`${descriptions.size} unique descriptions`);

heading('Canonical, Open Graph, Twitter');
let before = failures;
for (const [route, source] of documents) {
  const required = [
    'rel="canonical"',
    'property="og:title"',
    'property="og:description"',
    'property="og:image"',
    'property="og:type"',
    'property="og:url"',
    'name="twitter:card"',
  ];
  const missing = required.filter((tag) => !source.includes(tag));
  if (missing.length) fail(`${route} is missing: ${missing.join(', ')}`);
}
if (failures === before) pass('every page has canonical, og:*, and twitter:card');

heading('Structured data');
let TYPES_BY_ROUTE = {
  '/': ['Organization', 'WebSite', 'BreadcrumbList'],
  '/method': ['Organization', 'WebSite', 'FAQPage', 'BreadcrumbList'],
  '/services': ['Organization', 'WebSite', 'Service', 'BreadcrumbList'],
  '/about': ['Organization', 'WebSite', 'Person', 'BreadcrumbList'],
};

TYPES_BY_ROUTE['/blog'] = ['Organization', 'WebSite', 'BreadcrumbList', 'Blog'];

for (const slug of POST_SLUGS) {
  TYPES_BY_ROUTE[`/blog/${slug}`] = [
    'Organization',
    'WebSite',
    'BlogPosting',
    'BreadcrumbList',
  ];
}

for (const [route, source] of documents) {
  const raw = source.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  )?.[1];

  if (!raw) {
    fail(`${route} has no JSON-LD`);
    continue;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`${route} JSON-LD does not parse: ${error.message}`);
    continue;
  }

  const types = parsed['@graph'].flatMap((node) => node['@type']);
  const expected = TYPES_BY_ROUTE[route] ?? ['Organization', 'WebSite', 'BreadcrumbList'];
  const missing = expected.filter((type) => !types.includes(type));

  if (missing.length) {
    fail(`${route} JSON-LD is missing ${missing.join(', ')}`);
  } else {
    pass(`${route} — ${[...new Set(types)].join(', ')}`);
  }
}

heading('Prohibited content');
const forbidden = [
  // No prices or rates anywhere on the site.
  [/\$\s?\d/, 'a dollar figure'],
  [/\bper month\b/i, 'a rate'],
  [/\bretainer fee\b/i, 'a fee reference'],

  // Positioning rules from the copy spec. Each of these was ruled out for a
  // reason, and each is the kind of phrase that creeps back in during an edit.
  [/without an ad budget/i, '"without an ad budget"'],
  [/category compan(y|ies)/i, '"category company", which is not a real term'],
  [/\bnot visibility\b/i, 'a construction denying that visibility matters'],

  /*
   * Sonora speaks as "we". These three constructions are unambiguously Sonora
   * talking about itself, so they catch a slip back into "I" without touching
   * the places the *buyer* speaks — the FAQ's "How do I increase my pipeline?"
   * and the fit quiz's answers, which are correct in the first person.
   */
  [/\bI(’|')ll\b/, 'Sonora speaking as "I"'],
  [/\bTell me\b/i, 'Sonora speaking as "me"'],
  [/\bmore about me\b/i, 'Sonora speaking as "me"'],

  // Brand voice: phrasings the build spec bans outright.
  [/in today's landscape/i, '"in today\u2019s landscape"'],
  [/here's the thing/i, '"here\u2019s the thing"'],
  [/nobody's talking about/i, '"nobody\u2019s talking about"'],
  [/game-changing/i, '"game-changing"'],
  [/\bsupercharge/i, '"supercharge"'],
  [/let's dive in/i, '"let\u2019s dive in"'],
  [/it's no secret that/i, '"it\u2019s no secret that"'],

  // Figures the v5 handoff retires by name.
  [/\b222%/, 'the retired 222% figure'],
  [/\b220%/, 'the retired 220% figure'],
  [/Paddle/i, 'the retired Paddle CAC index'],
  [/\b(107|134)[- ]day/i, 'the retired sales-cycle figures'],
  [/276 of every 1,000/i, 'the superseded 276-per-1,000 figure (use 231)'],
];

let prohibitedHits = 0;
for (const [route, source] of documents) {
  const text = source.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  for (const [pattern, label] of forbidden) {
    if (pattern.test(text)) {
      fail(`${route} contains ${label}`);
      prohibitedHits += 1;
    }
  }
}
if (!prohibitedHits) {
  pass('no prices or rates, and none of the ruled-out phrasings');
}

/*
 * Every statistic on the site is third-party research and must carry its
 * source. A figure with no citation reads as a claim about Sonora's own
 * results, which is exactly what the spec forbids.
 */
heading('Sourced statistics');
const home = documents.get('/');
const SOURCES = ['SparkToro', 'Gartner'];
const missingSources = SOURCES.filter((source) => !home?.includes(source));
if (missingSources.length) {
  fail(`homepage charts are missing citations: ${missingSources.join(', ')}`);
} else {
  pass(`all three homepage charts cite a source (${SOURCES.join(', ')})`);
}

/*
 * Charts must be in the served HTML, and every figure they carry must be
 * readable as text — by a screen reader and by a model. The line chart is SVG
 * and ships a visually-hidden table; the coverage chart is HTML and CSS, so its
 * numbers are already text and a duplicate table would only repeat them.
 */
const chartCount = (home?.match(/<svg[^>]*role="img"/g) ?? []).length;
if (chartCount >= 1) {
  pass(`${chartCount} inline SVG chart(s) present with JS disabled`);
} else {
  fail('expected an inline SVG chart in the served homepage, found none');
}

const tableCount = (home?.match(/<table[\s>]/g) ?? []).length;
if (tableCount >= 1) {
  pass(`${tableCount} chart data table(s) for the SVG chart`);
} else {
  fail('the SVG chart has no data table');
}

const FIGURES = [
  ['49%', 'zero-click 2019'],
  ['64.8%', 'zero-click 2020'],
  ['58.5%', 'zero-click 2024'],
  ['68%', 'zero-click 2026'],
  ['231', 'clicks per 1,000 reaching the open web'],
  ['67%', 'rep-free preference'],
  ['45%', 'AI use during purchase'],
];

const text = decode(home ?? '').replace(/<[^>]+>/g, ' ');
const missingFigures = FIGURES.filter(([figure]) => !text.includes(figure));
if (missingFigures.length) {
  fail(
    `chart figures missing from the served text: ${missingFigures
      .map(([figure, label]) => `${figure} (${label})`)
      .join(', ')}`
  );
} else {
  pass(`all ${FIGURES.length} chart figures readable as text`);
}

heading('Accessibility structure');
before = failures;
for (const [route, source] of documents) {
  const h1Count = (source.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) fail(`${route} has ${h1Count} <h1> elements (expected 1)`);

  const levels = [...source.matchAll(/<h([1-6])[\s>]/g)].map((match) => Number(match[1]));
  for (let index = 1; index < levels.length; index += 1) {
    if (levels[index] - levels[index - 1] > 1) {
      fail(`${route} skips from h${levels[index - 1]} to h${levels[index]}`);
      break;
    }
  }

  if (!source.includes('class="skip-link"')) fail(`${route} has no skip-to-content link`);
  if (!source.includes('<main')) fail(`${route} has no <main>`);
  if (!source.includes('<footer')) fail(`${route} has no <footer>`);

  const imagesWithoutAlt = [...source.matchAll(/<img\b[^>]*>/g)].filter(
    (match) => !/\salt=/.test(match[0])
  );
  if (imagesWithoutAlt.length) {
    fail(`${route} has ${imagesWithoutAlt.length} <img> without alt`);
  }
}
if (failures === before) {
  pass('one h1 per page, no skipped levels, landmarks and alt text present');
}

heading('Machine-readable files');
for (const file of ['llms.txt', 'robots.txt', 'rss.xml', 'sitemap-index.xml']) {
  if (await exists(path.join(dist, file))) {
    pass(`/${file}`);
  } else {
    fail(`/${file} is missing`);
  }
}

const llms = await readFile(path.join(dist, 'llms.txt'), 'utf8');
/* llms.txt is the site's own briefing for a model. A page missing from it is
   invisible to anything that reads it first. */
const CORE_IN_LLMS = ['/method', '/services', '/why-now', '/about', '/blog', '/book'];
const missingCore = CORE_IN_LLMS.filter((route) => !llms.includes(`${route})`));
if (missingCore.length) {
  fail(`llms.txt does not list: ${missingCore.join(', ')}`);
} else {
  pass(`llms.txt lists all ${CORE_IN_LLMS.length} core pages`);
}

const missingFromLlms = POST_SLUGS.filter((slug) => !llms.includes(`/blog/${slug}`));
if (missingFromLlms.length) {
  fail(`llms.txt is missing posts: ${missingFromLlms.join(', ')}`);
} else {
  pass(`llms.txt lists all ${POST_SLUGS.length} published post(s)`);
}

/*
 * A post that ends in a question-and-answer section has to carry FAQPage, and
 * the count has to match. This is the markup an answer engine reads to lift a
 * question and its answer intact, and it breaks silently — the page looks
 * identical either way.
 */
for (const slug of POST_SLUGS) {
  const raw = await readFile(path.join(blogSource, `${slug}.md`), 'utf8');
  const heading = /^##\s+(common questions|frequently asked|faqs?)\s*$/im.exec(raw);
  if (!heading) continue;

  const section = raw.slice(heading.index + heading[0].length).split(/^##\s+/m)[0];
  const asked = (section.match(/^\*\*.+\*\*\s*$/gm) ?? []).length;

  const built = documents.get(`/blog/${slug}`) ?? '';
  const graph = built.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  const faq = JSON.parse(graph ?? '{}')['@graph']?.find((n) => n['@type'] === 'FAQPage');
  const marked = faq?.mainEntity?.length ?? 0;

  if (marked === asked && asked > 0) {
    pass(`/blog/${slug} marks up all ${asked} of its questions as FAQPage`);
  } else {
    fail(`/blog/${slug} asks ${asked} questions but marks up ${marked}`);
  }
}

const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
for (const agent of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']) {
  if (!robots.includes(agent)) fail(`robots.txt does not name ${agent}`);
}
if (robots.includes('Sitemap:')) pass('robots.txt references the sitemap');

heading('Icons and social images');
for (const file of [
  'favicon.ico',
  'favicon-16.png',
  'favicon-32.png',
  'apple-touch-icon.png',
  'images/og-default.png',
  /* Every post's card, derived — a named one goes stale on a rename. */
  ...POST_SLUGS.map((slug) => `images/og/${slug}.png`),
]) {
  if (await exists(path.join(dist, file))) {
    pass(`/${file}`);
  } else {
    fail(`/${file} is missing`);
  }
}

heading('Forms');
const contact = documents.get('/contact');
if (contact?.includes('data-netlify="true"') && contact.includes('name="form-name"')) {
  pass('contact form is wired to Netlify Forms');
} else {
  fail('contact form is missing Netlify Forms attributes');
}
if (contact?.includes('netlify-honeypot')) {
  pass('contact form has a honeypot');
} else {
  fail('contact form has no honeypot');
}

heading('Client-supplied values');
const site = await readFile(path.join(root, 'src', 'lib', 'site.ts'), 'utf8');
const REQUIRED_VALUES = [
  ['LINKEDIN_URL', 'export const LINKEDIN_URL', /linkedin\.com\/in\//],
  // BOOKING_URL is derived from the pasted link, so check the literal.
  [
    'BOOKING_URL',
    'const BOOKING_URL_AS_GIVEN',
    /calendar\.google\.com\/calendar\/(u\/\d+\/)?appointments\/schedules\/|calendar\.app\.google\//,
  ],
  ['GA_MEASUREMENT_ID', 'export const GA_MEASUREMENT_ID', /'G-[A-Z0-9]+'/],
];
for (const [name, declaration, pattern] of REQUIRED_VALUES) {
  /* The declaration may wrap onto the next line — the booking URL is long
     enough that the formatter puts it on its own. */
  const lines = site.split('\n');
  const at = lines.findIndex((row) => row.includes(declaration));
  const declared = at === -1 ? '' : lines.slice(at, at + 3).join('\n');
  if (pattern.test(declared)) {
    pass(`${name} is set`);
  } else {
    fail(`${name} is missing or malformed in src/lib/site.ts`);
  }
}

/* The `/u/0/` in a copied booking URL means "the first Google account signed
   in to this browser" — right for whoever copied it, wrong for every visitor.
   site.ts strips it; this makes sure the stripping still happens. */
if (/calendar\.google\.com\/calendar\/u\/\d+\//.test(documents.get('/book') ?? '')) {
  fail('the booking URL on /book still carries an account-specific /u/N/ segment');
} else {
  pass('the booking URL carries no account-specific /u/N/ segment');
}

// The tag has to reach the built pages, not just the config file.
const gaOnEveryPage = [...documents.entries()].every(([, source]) =>
  source.includes('googletagmanager.com/gtag/js')
);
if (gaOnEveryPage) {
  pass('Google tag present on every page');
} else {
  fail('Google tag missing from at least one page');
}

const book = documents.get('/book');
const schedulerFrame = /<iframe[^>]+src="([^"]*calendar\.google\.com[^"]*)"/.exec(book ?? '');
if (schedulerFrame && schedulerFrame[1].includes('gv=true')) {
  pass('the scheduler is embedded and carries gv=true');
} else if (schedulerFrame) {
  fail('the embedded scheduler is missing gv=true, so Google will not serve it');
} else if (/href="https:\/\/calendar\.app\.google\//.test(book ?? '')) {
  /*
   * A short calendar.app.google link is a redirect and carries
   * X-Frame-Options, so it cannot be framed — the page falls back to sending
   * people to the booking page in a new tab, which works but is a step worse
   * than an inline calendar. Swapping in the long
   * calendar.google.com/calendar/appointments/schedules/… URL turns the embed
   * back on with no other change.
   */
  warn('the booking link is the short form, so the calendar cannot be embedded');
} else {
  fail('booking page does not reach the Google Calendar schedule at all');
}
/*
 * Some browsers and extensions block third-party calendar frames, so the page
 * has to carry a plain link too. Test the structure rather than the wording:
 * an anchor to the schedule that survives the iframe being stripped out.
 */
const bookWithoutFrames = book?.replace(/<iframe[\s\S]*?<\/iframe>/g, '') ?? '';
if (/<a\b[^>]*href="https:\/\/calendar\.(app\.google|google\.com)\//.test(bookWithoutFrames)) {
  pass('booking page has a non-iframe fallback link');
} else {
  fail('booking page has no fallback if the iframe is blocked');
}

/*
 * The fit quiz on /services tells the reader "nothing is sent". Keep that
 * honest: the page must ship no form and no network call of its own. The
 * analytics tag is loaded by the layout from googletagmanager, not by the
 * page, so it is matched by host rather than exempted by hand.
 */
const services = documents.get('/services');
if (services?.includes('Answers stay on this page')) {
  const pageScripts = (services.match(/<script[\s\S]*?<\/script>/g) ?? [])
    .filter((tag) => !tag.includes('googletagmanager'))
    .join('\n');
  const sends = /<form[\s>]/.test(services) || /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket)\b/.test(pageScripts);
  if (sends) {
    fail('/services claims nothing is sent, but it ships a form or a network call');
  } else {
    pass('the fit quiz sends nothing, as it claims');
  }
} else {
  fail('the fit quiz hint text is missing from /services');
}

// The privacy page has to describe the analytics that are actually installed.
const privacy = documents.get('/privacy');
if (privacy?.includes('Google Analytics') && /sets cookies/i.test(privacy)) {
  pass('privacy page describes the cookies GA4 sets');
} else {
  fail('privacy page does not match the analytics actually installed');
}

heading('Brand artwork');
const brandDir = path.join(root, 'public', 'brand');
const REQUIRED_BRAND = [
  'sonora-full.png',
  'sonora-wordmark.png',
  'sonora-icon.png',
  'sonora-arch.png',
];
for (const file of REQUIRED_BRAND) {
  if (await exists(path.join(brandDir, file))) {
    pass(`public/brand/${file}`);
  } else {
    fail(`public/brand/${file} is missing`);
  }
}
if (await exists(path.join(brandDir, '.placeholder-artwork'))) {
  warn(
    'brand artwork is still generated, not the supplied PNGs — see README, "The logo files"'
  );
}
if (await exists(path.join(root, 'public', 'images', '.placeholder-headshot'))) {
  warn('headshot is still a placeholder — drop taylor-corbett-source.jpg in public/images/');
}

heading('Still to do by hand');
console.log('  - Lighthouse on mobile: Performance >= 95, Accessibility 100, SEO 100');
console.log('  - Validate JSON-LD in Google’s Rich Results Test');
console.log('  - Submit a real contact-form entry after the first deploy');
console.log('  - Keyboard-navigate every page');
console.log('  - Open the site on a real phone');

console.log(
  `\n${failures ? 'FAILED' : 'PASSED'} — ${failures} failure(s), ${warnings} warning(s)\n`
);

process.exit(failures ? 1 : 0);
