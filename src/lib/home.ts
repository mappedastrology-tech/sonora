/**
 * Homepage data. Kept out of the page so the copy is editable in one place.
 */
export const STATS = [
  { value: '7', label: 'information sources weighed before a decision' },
  { value: '67%', label: 'prefer a rep-free buying process' },
  { value: '45%', label: 'used AI during a recent purchase' },
] as const;

/**
 * The two routes out of a pipeline problem. One is the reflex, one is the
 * work. "engine" is selected by default — with no JavaScript that is simply
 * the state the page renders in, and both cards stay fully readable.
 */
export const PATHS = [
  {
    key: 'rep',
    kicker: 'The usual response',
    title: 'Hire another rep',
    body: 'A rep with no leads spends the week prospecting cold instead of closing. It is the slowest and most expensive way to create demand — and it is why so many first sales hires quietly don’t work out.',
    ctaActive: 'You are here →',
    ctaInactive: 'See what happens',
  },
  {
    key: 'engine',
    kicker: 'What we build',
    title: 'Build the engine first',
    body: 'Get the engine that brings people to you running first. Then hire salespeople to work the flow rather than create it — and every rep you add compounds instead of starting from zero.',
    ctaActive: 'Start here →',
    ctaInactive: 'See the alternative',
  },
] as const;

/**
 * Zero-click share of US Google searches. Geometry matches the design's
 * 920×360 viewBox: gridlines every 70 units from y=20 (80%) to y=300 (0%).
 */
export const ZERO_CLICK = {
  points: [
    { year: 2019, value: 49, x: 120, y: 128, labelX: 140, labelY: 105 },
    { year: 2020, value: 64.8, x: 380, y: 73, labelX: 380, labelY: 45 },
    { year: 2024, value: 58.5, x: 640, y: 95, labelX: 640, labelY: 67 },
    { year: 2026, value: 68, x: 880, y: 62, labelX: 862, labelY: 34 },
  ],
  gridY: [20, 90, 160, 230, 300],
  axisLabels: ['80%', '60%', '40%', '20%', '0%'],
  source:
    'SparkToro, June 2026. Panels differ across years — treat the trend as directional, not the deltas as precise.',
} as const;
