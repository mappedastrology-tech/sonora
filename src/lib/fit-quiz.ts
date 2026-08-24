/**
 * The "find your fit" recommender on /services.
 *
 * Three questions, four options each, every option scoring one of the four
 * services. No email, no analytics, no persistence — the hint line says
 * "nothing is sent" and that has to stay true.
 *
 * `href` points at the real section ids on /services, which are the service
 * slugs. (The handoff spec names them #svc-0 … #svc-3; those anchors do not
 * exist on the built page.)
 */
export const FIT_QUESTIONS = [
  {
    step: 'Question 1',
    title: 'What do you know right now?',
    options: [
      { label: 'Something isn’t working, but I can’t tell what', score: 'audit' },
      { label: 'I know the problem — I need the plan', score: 'sprint' },
      { label: 'We have a plan and nobody owns it', score: 'fhoc' },
      { label: 'We’re executing; I need to prove it works', score: 'monitor' },
    ],
  },
  {
    step: 'Question 2',
    title: 'Who does the work once the direction is set?',
    options: [
      { label: 'Nobody yet — we’d start from scratch', score: 'sprint' },
      { label: 'A team or agency, but unsupervised', score: 'fhoc' },
      { label: 'A team that’s already shipping', score: 'monitor' },
      { label: 'Not sure it’s a people problem', score: 'audit' },
    ],
  },
  {
    step: 'Question 3',
    title: 'What has to be true in ninety days?',
    options: [
      { label: 'A prioritized list of what to fix', score: 'audit' },
      { label: 'Positioning and content architecture decided', score: 'sprint' },
      { label: 'Someone senior owning the function', score: 'fhoc' },
      { label: 'A number I can defend to the board', score: 'monitor' },
    ],
  },
] as const;

/**
 * One outcome per key. Order matters: it is the tie-break precedence, so the
 * earliest key here wins a three-way tie.
 */
export const FIT_OUTCOMES = [
  {
    key: 'audit',
    name: 'Visibility Audit',
    cadence: 'One-time · Two to three weeks',
    href: '#visibility-audit',
    why: 'You have a symptom, not a diagnosis. Before anyone writes a plan, you need to know whether the gap is the content, the technical layer, or the positioning — and in what order to fix it.',
    alt: 'Strategy Sprint',
    altHref: '#strategy-sprint',
  },
  {
    key: 'sprint',
    name: 'Strategy Sprint',
    cadence: 'One-time · Four to six weeks',
    href: '#strategy-sprint',
    why: 'The problem is named; what’s missing is the decision. The sprint sets the positioning, the content architecture, and the technical tickets so your team can run without a retainer.',
    alt: 'Visibility Audit',
    altHref: '#visibility-audit',
  },
  {
    key: 'fhoc',
    name: 'Fractional Head of Content',
    cadence: 'Ongoing · Three-month minimum',
    href: '#fractional-head-of-content',
    why: 'You have people producing work and nobody setting the standard. This is senior ownership of strategy, editorial, channels, and vendors — without a full-time salary.',
    alt: 'Strategy Sprint',
    altHref: '#strategy-sprint',
  },
  {
    key: 'monitor',
    name: 'AI Visibility Monitoring',
    cadence: 'Ongoing · Quarterly',
    href: '#ai-visibility-monitoring',
    why: 'The work is happening; the reporting isn’t defensible. A locked prompt set and named competitors keep the numbers comparable quarter over quarter.',
    alt: 'Fractional Head of Content',
    altHref: '#fractional-head-of-content',
  },
] as const;
