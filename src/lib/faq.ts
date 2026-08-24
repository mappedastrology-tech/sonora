/**
 * The FAQs on /method.
 *
 * These are written to be extracted. The first sentence of every answer is a
 * complete, standalone response to the question — an answer engine that lifts
 * one sentence still lifts something true and useful.
 *
 * The same strings feed the visible page and the FAQPage JSON-LD, so the two
 * can never disagree.
 */
export const FAQS = [
  {
    question: 'How do I increase my pipeline?',
    answer:
      'Build the marketing engine first and the sales team second. A rep with no leads spends the week prospecting cold instead of closing, which is the slowest and most expensive way to create demand — and it’s why so many first sales hires don’t work out. Marketing that’s aimed correctly puts you in front of people at the moment they’re deciding, and it keeps working after the spend stops. Hire salespeople to work that flow, not to create it.',
  },
  {
    question: 'What is answer engine optimization?',
    answer:
      'Answer engine optimization, or AEO, is the practice of getting your company named and cited by AI systems that answer questions directly instead of returning a list of links. In practice it means making your site readable by models, structuring content so answers can be extracted from it, and getting into the third-party sources those models cite when describing your category.',
  },
  {
    question: 'How is AEO different from SEO?',
    answer:
      'SEO optimizes for ranking in a list of results; AEO optimizes for being named inside an answer where no list appears. Clean technical foundations help both, but AEO depends much more on third-party sources you don’t own, structured data, and whether your category has a term a model can attach to you.',
  },
  {
    question: 'How do you get cited by AI search engines?',
    answer:
      'Three conditions have to be met: the model can access and parse your content, your site describes what you are in consistent language, and the sources it trusts in your category already reference you. This applies across ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews — the mechanics differ but the conditions don’t. Most companies fail the first or second and spend their budget on the third.',
  },
  {
    question: 'Does this actually generate leads?',
    answer:
      'Yes, and that’s the only reason to do it. The work targets the questions people ask when they’re close to spending money, not whatever has the most search volume. People who arrive from AI answers have usually already defined their problem and narrowed their options, which is why they convert at higher rates than general organic traffic.',
  },
  {
    question: 'How long before it shows up in pipeline?',
    answer:
      'Plan on six months. Training and retrieval cycles aren’t published, changes usually surface in retrieval-based engines like Perplexity before they appear elsewhere, and search compounds slowly by nature. Anyone promising results in thirty days is guessing.',
  },
] as const;
