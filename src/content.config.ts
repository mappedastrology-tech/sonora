/**
 * Blog content collection.
 *
 * Posts are markdown files in src/content/blog/. The filename becomes the URL
 * slug: `the-sonora-method.md` is served at /blog/the-sonora-method.
 *
 * `description` is required because it is the page's meta description. A post
 * without one fails the build rather than shipping an empty tag.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    /* Set this when a post is revised. It becomes the sitemap's lastmod, so a
       correction is visible to a crawler without faking the original date. */
    updated: z.coerce.date().optional(),
    author: z.string().default('Taylor Corbett'),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    /* Drives the topic filters on /blog and the post's arch icon. A closed set
       rather than free text, so a typo cannot invent a filter nobody can
       clear. */
    topic: z.enum(['Search', 'Positioning', 'AI answers', 'Measurement']),
    /* One line lifted from the post, shown on the featured card. */
    pullQuote: z.string().optional(),
  }),
});

export const collections = { blog };
