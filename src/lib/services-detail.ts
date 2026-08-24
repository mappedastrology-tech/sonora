/**
 * Full service copy for /services. The one-liners on the homepage live in
 * site.ts; these are the expanded versions.
 *
 * No prices, no rates, no packages. That is deliberate and it is not an
 * oversight to be corrected later without asking.
 *
 * Fractional Head of Content is the only service that includes ongoing
 * implementation oversight. Do not add a separate execution-management service.
 */
export const SERVICE_DETAIL = [
  {
    slug: 'visibility-audit',
    name: 'Visibility Audit',
    cadence: 'One-time · Two to three weeks',
    body: 'Where you stand right now in AI and traditional search, and what to fix in what order.',
    includes: [
      'Real query set, built from how your buyers talk',
      'AI visibility baseline against named competitors',
      'Citation source mapping — what gets cited in your category instead of you',
      'Technical findings, prioritized by impact',
      'Positioning consistency across every surface you own',
      'Sequenced roadmap',
    ],
    startHereIf:
      'you’re not generating enough inbound and don’t know whether the problem is the content, the technical layer, or the positioning.',
  },
  {
    slug: 'strategy-sprint',
    name: 'Strategy Sprint',
    cadence: 'One-time · Four to six weeks',
    body: 'The audit says what’s wrong. This decides what you’re doing about it.',
    includes: [
      'Positioning and the term you’re going to own',
      'Message architecture your whole company can repeat',
      'Content architecture — pillars, definitional layer, comparison surfaces',
      'Channel strategy across owned, social, and video',
      'Video and social direction: which formats, which platforms, what they’re for',
      'Technical requirements written as scoped tickets your engineers can pick up',
    ],
    startHereIf:
      'you know you have a pipeline problem and need a plan your team can run without us on retainer.',
  },
  {
    slug: 'fractional-head-of-content',
    name: 'Fractional Head of Content',
    cadence: 'Ongoing · Three-month minimum',
    body: 'Senior content leadership without the hire. We own strategy, standards, channels, and vendors. Your team executes; we decide what gets made and whether it ships.',
    includes: [
      'Positioning and content strategy',
      'Editorial standards and review',
      'Channel direction across blog, social, video, and email',
      'Agency, freelancer, and contractor management',
      'Quarterly reporting on search and AI visibility',
      'Alignment with sales and demand generation',
    ],
    startHereIf:
      'you need senior direction but not a full-time salary — or you have people producing work with nobody setting the direction.',
  },
  {
    slug: 'ai-visibility-monitoring',
    name: 'AI Visibility Monitoring',
    cadence: 'Ongoing · Quarterly',
    body: 'Where you appear in AI answers each quarter, who appears instead of you, and what that’s doing to your pipeline.',
    includes: [
      'Share of voice and citation position, quarter over quarter',
      'Competitive citation mapping',
      'Sentiment tracking',
      'A report that survives follow-up questions',
    ],
    startHereIf:
      'someone is going to ask whether the content is working and you need a defensible answer.',
  },
] as const;
