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
      'Learning the market, the competition, and the buyer before anything gets recommended. What people actually search when they’re looking for what you sell, who currently gets those answers, and why.',
  },
  {
    number: '02',
    name: 'Locate',
    short:
      'Finding the position you can realistically own within a year, and the language that makes a stranger understand what you sell in one line.',
  },
  {
    number: '03',
    name: 'Saturate',
    short:
      'Showing up across the whole path, from the question that starts the search to the comparison page where the decision gets made.',
  },
  {
    number: '04',
    name: 'Sustain',
    short:
      'Measuring against pipeline instead of pageviews — where you show up, who shows up instead of you, and which of it is attached to deals.',
  },
] as const;
