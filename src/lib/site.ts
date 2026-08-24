/**
 * Single source of truth for everything that appears in more than one place:
 * URLs, contact details, nav, and the four services.
 *
 * If you are looking for something to change, it is probably in this file.
 */

export const SITE_URL = 'https://sonoramethod.com';

export const SITE_NAME = 'Sonora';

/** The brand line. */
export const TAGLINE = 'Be discoverable everywhere they look.';

/** What Sonora is, in one sentence. Used in the footer and in metadata. */
export const DESCRIPTOR =
  'Search and content strategy for companies that need pipeline.';

export const EMAIL = 'hello@sonoramethod.com';

export const AUTHOR = {
  name: 'Taylor Corbett',
  jobTitle: 'Founder and Principal Strategist',
  bioShort:
    'Taylor Corbett runs Sonora, a search and content strategy practice for companies that need pipeline.',
};

/** Taylor's public LinkedIn profile. */
export const LINKEDIN_URL = 'https://www.linkedin.com/in/taylorjcorbett/';

/**
 * Google Calendar appointment schedule. `?gv=true` is what turns the booking
 * page into an embeddable view; the bare link is what people click if the
 * iframe is blocked.
 */
export const BOOKING_URL = 'https://calendar.app.google/KB26roAeFacVbngg6';
export const BOOKING_EMBED_URL = `${BOOKING_URL}?gv=true`;

/** Google Analytics 4 measurement ID. */
export const GA_MEASUREMENT_ID = 'G-L1SZMT6MFL';

/** Profiles that belong in JSON-LD `sameAs`. */
export const SAME_AS: string[] = [LINKEDIN_URL];

export const NAV_LINKS = [
  { label: 'Method', href: '/method' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
] as const;

/** Human-readable label for a path, used to build breadcrumbs. */
export const PAGE_LABELS: Record<string, string> = {
  '/method': 'Method',
  '/services': 'Services',
  '/about': 'About',
  '/blog': 'Blog',
  '/book': 'Book a call',
  '/contact': 'Contact',
  '/privacy': 'Privacy',
};

/**
 * The four services. One-liners here, full detail in services-detail.ts.
 *
 * Ongoing implementation oversight belongs to Fractional Head of Content and
 * nowhere else — do not add a separate execution-management service.
 */
export const SERVICES = [
  {
    slug: 'visibility-audit',
    name: 'Visibility Audit',
    oneLiner:
      'Where you stand in AI and traditional search, and what to fix first.',
    description:
      'Where you stand right now in AI and traditional search, and what to fix in what order. Covers the real query set your buyers use, an AI visibility baseline against named competitors, citation source mapping, technical AEO findings, and positioning consistency across every surface you own.',
  },
  {
    slug: 'strategy-sprint',
    name: 'Strategy Sprint',
    oneLiner: 'The plan: positioning, channels, content architecture.',
    description:
      'The audit says what is wrong; the sprint decides what you are doing about it. Positioning and the term you intend to own, a message architecture your whole company can repeat, content and channel strategy, and technical requirements written as scoped tickets your engineers can pick up.',
  },
  {
    slug: 'fractional-head-of-content',
    name: 'Fractional Head of Content',
    oneLiner:
      'Ongoing ownership of strategy, standards, channels, and vendors.',
    description:
      'Senior content leadership without the hire. Sonora owns the strategy, the editorial standard, the channels, and the vendors. Your team executes; Sonora decides what gets made and whether it ships.',
  },
  {
    slug: 'ai-visibility-monitoring',
    name: 'AI Visibility Monitoring',
    oneLiner: 'Quarterly measurement against named competitors.',
    description:
      'How you appear in AI answers, measured on a fixed prompt set, against named competitors, on a set cadence. Most AI visibility reporting is unreliable because the measurement basis keeps moving. This does not.',
  },
] as const;
