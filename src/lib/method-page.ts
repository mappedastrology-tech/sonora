/**
 * The long form of the four stages, for /method. The homepage renders the
 * short form from method.ts; both exist because the page has room to explain
 * and the card does not.
 */

/** The section that argues for the sequence, before the stages themselves. */
export const ORDER = {
  eyebrow: 'Why the order matters',
  heading: 'Sequencing is where this usually fails',
  paragraphs: [
    'Teams run acquisition before they’ve settled positioning. They add channels before choosing a motion. Then they publish a post a week and wait for something to rank.',
    'That isn’t a strategy. It’s a habit, and it produces exactly what you’d expect: rising output against flat pipeline.',
    'The four stages run in order because each one depends on the answer before it. You can’t decide what to publish before you know what you’re the answer to. You can’t measure whether it worked without knowing what you were aiming at.',
  ],
} as const;

export const STAGE_DETAIL = [
  {
    number: '01',
    name: 'Listen',
    summary: 'What buyers actually search, and who currently gets the answer.',
    paragraphs: [
      'Everything starts with learning the market. Who else is in it, what they claim, and which of them get named when someone goes looking for a solution like yours.',
      'Then the buyers. What they search, in their words, and where they are in the process. There’s a real difference between someone reading about a problem and someone comparing two vendors, and most content programs only serve the first.',
      'Then the answers themselves. Who gets cited in AI results and search results for the questions that matter, which sources those answers draw from, and what it would take to be there instead.',
      'And finally your own site, read the way a stranger reads it. When it says one thing and your competitors’ sites say the same thing in different words, that’s the finding.',
    ],
  },
  {
    number: '02',
    name: 'Locate',
    summary: 'The position you can own, in language a stranger understands.',
    paragraphs: [
      'Next we find your strongest differentiator — something your competitors can’t claim, that your buyers actually care about, and that you can hold onto for at least a year. It’s often not the thing the founder expects.',
      'A stranger should be able to read one line and know what you sell and who it’s for. Most companies can’t manage that, usually because their homepage, sales deck, and documentation each answer it differently.',
    ],
    /* Set apart by a gold rule so it reads as an aside rather than a fifth
       stage. The copy leads with "On category." — that becomes the heading. */
    aside: {
      heading: 'On category',
      paragraphs: [
        'The instinct is to invent a new one. Usually that’s wrong. Anchoring to a category buyers already understand, with a modifier that’s yours, is easier to defend and easier to search for.',
        'Naming something new is occasionally the right call — when every prospect describes the same problem five different ways and there’s no term to attach to it. The diagnosis tells you which situation you’re in.',
      ],
    },
  },
  {
    number: '03',
    name: 'Saturate',
    summary: 'Present across the whole path, not just the front of it.',
    paragraphs: [
      'Then the position goes out into the world, which is the part most engagements skip.',
      'Lean teams spend around 90% of their effort on making content and 10% on distributing it. It should be closer to even. A page nobody finds is not a marketing asset.',
      'That means three layers at once. Your owned content. The technical layer that decides whether a model can read you at all — structured data, clean served HTML, content not buried behind JavaScript. And the third-party surfaces that carry the most weight in AI answers: reviews, forums, comparison sites, press.',
      'Those are the places. What matters just as much is where someone is in their process when they land. Most content programs pile everything at the front — explainers, definitions, problem-awareness posts — and put almost nothing at the point of decision. Comparison pages, alternatives pages, clear pricing, direct answers to the objections your sales calls keep hitting.',
    ],
    /* The closing line carries the whole stage, so the layout sets it apart
       rather than burying it at the end of a long paragraph. */
    pullQuote:
      'Ranking for the question that starts a search is worth very little if you’re missing from the page where it ends.',
  },
  {
    number: '04',
    name: 'Sustain',
    summary: 'Measurement that stays comparable quarter over quarter.',
    paragraphs: [
      'Last, we measure what happened — against pipeline rather than pageviews.',
      'Every quarter: where you’re showing up in AI answers and search results, who’s showing up instead of you, and which sources those answers pull from.',
      'Then the part most reporting skips — which queries and which pages are attached to real deals, and which are just producing traffic.',
    ],
  },
] as const;
