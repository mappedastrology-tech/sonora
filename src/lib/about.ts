/**
 * /about — the bio, verbatim from the handoff.
 *
 * Third person throughout: the page speaks about Taylor, not as her. No former
 * employer is named, here or in the JSON-LD.
 */
export const CREDENTIALS = [
  'Led content and search at a B2B software company where inbound was the entire pipeline',
  'A decade in local news, ending as a digital news director',
  'Senior judgment on every decision, start to finish',
] as const;

export const BIO = [
  'It was never a product problem. Nobody owned inbound. Marketing sat third on somebody’s list, so it got pushed until after the next release, and then the one after that — while a competitor with a worse product showed up in every search and every AI answer and took the deals.',
  'Taylor Corbett founded Sonora after watching that happen too many times to companies that deserved better. She spent several years leading content and search at a B2B software company where inbound carried the pipeline. When a page slipped or an AI answer named someone else, it wasn’t a traffic dip. It was a deal going somewhere else.',
  'Before that, she spent roughly a decade in local news, ending as a digital news director. The job was knowing what people were about to search for and getting there first — not covering what happened, but publishing what everyone was about to want to know. Same instinct, different kind of demand.',
] as const;

export const BIO_QUOTE =
  'What she cares about is the gap between how good a company actually is and how good it looks to someone searching. That gap costs good companies deals they should have won, and the fix is almost never a better product.';

export const BIO_CLOSE =
  'Sonora exists to give companies that discipline without the hire. Strategy, editorial standards, channels, and vendor direction stay with Sonora; your team executes against a plan built for pipeline rather than traffic.';

/** "What's in place now?" on the enquiry form. */
export const IN_PLACE = [
  'In-house team',
  'Agency or contractor',
  'Founder doing it',
  'Nothing yet',
] as const;
