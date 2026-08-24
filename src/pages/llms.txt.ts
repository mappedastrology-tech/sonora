/**
 * /llms.txt — a plain-text map of the site for language models.
 *
 * Generated as a route rather than a static file so the Blog section lists
 * every published post automatically. Nothing to update by hand when a post
 * ships.
 */
import type { APIRoute } from 'astro';
import { getPublishedPosts, postPath } from '../lib/posts';
import { SITE_URL, EMAIL, SERVICES } from '../lib/site';

const url = (path: string) => `${SITE_URL}${path}`;

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const writing = posts
    .map((post) => `- [${post.data.title}](${url(postPath(post))}): ${post.data.description}`)
    .join('\n');

  const services = SERVICES.map(
    (service) => `- ${service.name}: ${service.oneLiner}`
  ).join('\n');

  const body = `# Sonora

> Sonora is a search and content strategy practice run by Taylor Corbett. It
> helps companies that need pipeline get found by their buyers — AI search
> visibility (answer engine optimization), SEO, positioning, and content
> direction. Sonora sets strategy and directs the work; the client's team or
> contractors produce it.

## Core pages

- [The Sonora Method](${url('/method')}): A four-stage framework for turning search into pipeline — Listen, Locate, Saturate, Sustain. Covers answer engine optimization across ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews.
- [Services](${url('/services')}): Visibility audit, strategy sprint, fractional head of content, AI visibility monitoring.
- [Why now](${url('/why-now')}): What changed in how B2B buyers search — AI answers, the fall in clicks reaching the open web, the number of sources weighed before a decision, and when a vendor gets contacted. Every figure carries its source.
- [About](${url('/about')}): Background of Taylor Corbett, founder.

## Services

${services}

## Blog

- [Blog](${url('/blog')}): Working notes on search, positioning, and what buyers do before they contact you.
${writing}

## Contact

- [Book a call](${url('/book')})
- ${EMAIL}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
