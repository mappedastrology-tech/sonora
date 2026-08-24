/**
 * The AI answer that names three competitors and not you.
 *
 * Shared: it is the first scene on /why-now and the hero graphic on /about,
 * and the two have to say the same thing.
 */
export const AI_ANSWER = {
  query: 'what are the best options in our category?',
  lead: 'Three names come up most often in current sources:',
  results: [
    'A competitor',
    'A competitor with a worse product',
    'A competitor you’ve never lost to',
  ],
  verdict: 'You aren’t in this answer.',
  counter: '0 of 12 cited sources mention you',
} as const;
