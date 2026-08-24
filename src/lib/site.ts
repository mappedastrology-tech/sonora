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
 * Google Calendar appointment schedule.
 *
 * Two link shapes come out of Google. "Share → copy link" gives the short
 * calendar.app.google form; "Open booking page" gives the long
 * calendar.google.com/calendar/appointments/schedules/… form. Only the long
 * one can be embedded — see BOOKING_URL_IS_EMBEDDABLE below — so paste the
 * long one here whenever you have it.
 *
 * Paste it exactly as Google gives it to you; anything account-specific is
 * stripped below.
 */
const BOOKING_URL_AS_GIVEN =
  'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0KflxEJawX4d_rAMxFBKGh0NYxpmtHMRQ3cbuqNUdIcZEFhUihAi6PdGKoQm7UppTUuUvXpS2P';

/**
 * The URL copied out of Google Calendar's address bar carries a `/u/0/`
 * segment, which means "the first Google account signed in to this browser".
 * That is correct for the person who copied it and wrong for everybody else:
 * a visitor signed in to a second account lands in the wrong account context.
 * Google's own embed snippet has no `/u/N/`, so drop it.
 */
export const BOOKING_URL = BOOKING_URL_AS_GIVEN.replace(
  /^(https:\/\/calendar\.google\.com\/calendar)\/u\/\d+\//,
  '$1/'
);

const BOOKING_SHAPES = [
  /^https:\/\/calendar\.google\.com\/calendar\/appointments\/schedules\//,
  /^https:\/\/calendar\.app\.google\//,
];

/** True when the link is a shape that takes somebody to the booking page. */
export const BOOKING_URL_IS_VALID = BOOKING_SHAPES.some((shape) =>
  shape.test(BOOKING_URL)
);

/**
 * True only for the long form — and that is the one thing that decides whether
 * the page can embed a scheduler.
 *
 * Google serves `calendar.app.google/XXXX` as a redirect and sends
 * X-Frame-Options on it, so a frame pointed at a short link never even reaches
 * the booking page: it renders "calendar.app.google refused to connect". The
 * long `calendar.google.com/calendar/appointments/schedules/…` URL is the only
 * frameable one. Both links work fine opened directly.
 *
 * To get the long form: open the appointment schedule in Google Calendar,
 * click through to the booking page, and copy the URL out of the address bar.
 */
export const BOOKING_URL_IS_EMBEDDABLE = BOOKING_SHAPES[0].test(BOOKING_URL);

export const BOOKING_EMBED_URL = BOOKING_URL.includes('gv=true')
  ? BOOKING_URL
  : `${BOOKING_URL}${BOOKING_URL.includes('?') ? '&' : '?'}gv=true`;

/** Google Analytics 4 measurement ID. */
export const GA_MEASUREMENT_ID = 'G-L1SZMT6MFL';

/** Profiles that belong in JSON-LD `sameAs`. */
export const SAME_AS: string[] = [LINKEDIN_URL];

export const NAV_LINKS = [
  { label: 'Method', href: '/method' },
  { label: 'Services', href: '/services' },
  { label: 'Why now', href: '/why-now' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
] as const;

/** Human-readable label for a path, used to build breadcrumbs. */
export const PAGE_LABELS: Record<string, string> = {
  '/method': 'Method',
  '/services': 'Services',
  '/about': 'About',
  '/why-now': 'Why now',
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
