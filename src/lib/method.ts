/**
 * The four stages, short form. The homepage renders these; /method renders the
 * expanded version from method-page.ts. Both read from one place so they can
 * never drift apart.
 */
export const STAGES = [
  {
    number: '01',
    name: 'Listen',
    short:
      'What your buyers search when they have a budget and a problem. Buying-intent queries, not whatever has the highest volume. Plus a baseline of who currently gets the answer.',
  },
  {
    number: '02',
    name: 'Locate',
    short:
      'The position you can own within a year, and the language that makes a stranger understand what you sell in one line.',
  },
  {
    number: '03',
    name: 'Saturate',
    short:
      'Show up across the whole path, from the question that starts the search to the comparison page where it ends. Being present at the top is worthless if you’re absent where the decision gets made.',
  },
  {
    number: '04',
    name: 'Sustain',
    short:
      'Measure against pipeline, not pageviews. Fixed prompt set, named competitors, numbers that stay comparable quarter over quarter.',
  },
] as const;
