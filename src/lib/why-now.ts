/**
 * The four scenes on /why-now, and the data behind their graphics.
 *
 * Every figure here is third-party research and carries its source. The
 * handoff retires several earlier numbers — 222%, 220%, the Paddle CAC index,
 * the 107/134-day sales cycles — and they must not come back.
 */
export { AI_ANSWER } from './ai-answer';

export const SCENES = [
  {
    id: 'ask-a-model',
    marker: '01 / 04',
    heading: 'They ask a model first',
    lead: '45% of B2B buyers used AI on their last purchase. It cites earned media 84% of the time and paid content 0.3% of the time.',
    alt: 'Illustration: an AI answer lists three competitors and names none of your company, with a counter reading zero of twelve cited sources mentioning you.',
  },
  {
    id: 'dont-click',
    marker: '02 / 04',
    heading: 'They don’t click',
    lead: 'No country still sends 300 clicks to the open web per 1,000 Google searches. The answer resolves in the chat, and you’re either in it or you’re not.',
    alt: 'Illustration: of 100 searches, 23 reach the open web and 77 resolve without a click.',
  },
  {
    id: 'seven-sources',
    marker: '03 / 04',
    heading: 'They check seven sources',
    lead: 'Review sites, forums, comparison posts, three people they trust. You control one of them.',
    alt: 'Illustration: one buyer branching to seven sources — AI answer, review site, forum, comparison, trade press, a peer, and your own site.',
  },
  {
    id: 'call-you-last',
    marker: '04 / 04',
    heading: 'They call you last',
    lead: '69% talk to a rep to confirm what they already decided. By then you’re being checked, not chosen.',
    alt: 'Illustration: a research timeline where the decision is made at 85% of the way through and your call happens at the very end.',
  },
] as const;


/** Clicks reaching the open web, per 1,000 Google searches. */
export const CLICK_BARS = [
  { country: 'Germany', value: 287 },
  { country: 'Italy', value: 280 },
  { country: 'France', value: 271 },
  { country: 'Canada', value: 268 },
  { country: 'United Kingdom', value: 232 },
  { country: 'United States', value: 231, highlight: true },
] as const;

export const CLICK_AXIS_MAX = 700;
export const CLICK_TICK = 300;

/**
 * The seven sources a buyer checks. Node centres land at (i + 0.5) / 7 of the
 * width so they line up with the branch endpoints at x = 50, 150 … 650.
 */
export const SOURCES = [
  { label: 'AI answer', icon: 'chat' },
  { label: 'Review site', icon: 'star' },
  { label: 'Forum', icon: 'messages' },
  { label: 'Compare', icon: 'list' },
  { label: 'Press', icon: 'news' },
  { label: 'A peer', icon: 'user' },
  { label: 'Your site', icon: 'world', yours: true },
] as const;
