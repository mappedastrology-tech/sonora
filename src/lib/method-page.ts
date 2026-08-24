/**
 * The expanded stage copy used on /method. The homepage uses the short form in
 * method.ts.
 *
 * Locate carries a sub-section on naming a category. That is the only place
 * category creation appears on the site — it is one possible output of the
 * diagnosis, not a pitch, and it never belongs on the homepage.
 */
export const STAGE_DETAIL = [
  {
    number: '01',
    name: 'Listen',
    paragraphs: [
      'Find what your buyers search when they have a budget and a problem, and who currently gets to answer it. That means the real query set in their language rather than whatever a tool says has volume, sorted by buying intent rather than traffic potential.',
      'It means a baseline of where you appear in AI answers and which sources get cited in your category — often third-party surfaces you don’t control, like review sites, forums, comparison posts, and press, as much as anyone’s own content.',
      'And it means reading your own site the way a stranger does: when your homepage, pricing page, and docs disagree about what you are, that’s the finding.',
    ],
  },
  {
    number: '02',
    name: 'Locate',
    paragraphs: [
      'Find the position you can own within a year. Not the one you want, and not the one three funded competitors are already buying.',
      'The test is whether a stranger can read one line and understand what you sell.',
    ],
    aside: {
      heading: 'When the category doesn’t have a name yet',
      paragraphs: [
        'AI has created a lot of genuinely new categories, and buyers don’t have words for them. When every prospect describes the same problem five different ways, there’s no term to search for, nothing for a model to attach to you, and no shorthand a customer can hand a colleague.',
        'Sometimes the right move is naming it. Often it isn’t — most companies that think they need a new category just need to commit to an existing one. The diagnosis tells you which.',
      ],
    },
  },
  {
    number: '03',
    name: 'Saturate',
    paragraphs: [
      'Get present across the whole path, not just the front of it. That’s owned content, the technical layer that lets a model parse you at all — structured data, served HTML, content not buried behind JavaScript — and the third-party surfaces that carry weight in your category: reviews, forums, comparison sites, press.',
      'It also means the bottom of the funnel, which most content programs neglect. Comparison pages, alternatives pages, pricing clarity, and the specific objections your sales calls keep running into.',
      'Ranking for the question that starts the search is worth very little if you’re absent from the page where the decision gets made.',
    ],
  },
  {
    number: '04',
    name: 'Sustain',
    paragraphs: [
      'Measure against pipeline, not pageviews. A fixed prompt set, a fixed cadence, and named competitors, so the numbers stay comparable quarter over quarter.',
      'Then the part most reporting skips: which queries and which pages are attached to deals, and which ones are just traffic.',
    ],
  },
] as const;
