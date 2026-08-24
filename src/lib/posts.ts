import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * Published posts, newest first. Drafts never reach a build — this is the only
 * place posts are read, so there is no second path that could leak one.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => data.draft !== true);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const postPath = (post: Post): string => `/blog/${post.id}`;

/**
 * The question-and-answer section a post ends with, pulled out of its own
 * markdown so the schema and the page can never disagree.
 *
 * Format, in both posts and any future one:
 *
 *     ## Common questions
 *
 *     **A question?**
 *     The answer paragraph.
 *
 * Throws if the section exists but yields no pairs. A post that quietly
 * shipped an empty FAQPage would look fine and mean nothing.
 */
export function extractFaqs(body: string): { question: string; answer: string }[] {
  const heading = /^##\s+(common questions|frequently asked|faqs?)\s*$/im.exec(body);
  if (!heading) return [];

  const start = heading.index + heading[0].length;
  const rest = body.slice(start);
  const next = /^##\s+/m.exec(rest);
  const section = next ? rest.slice(0, next.index) : rest;

  const faqs: { question: string; answer: string }[] = [];
  const pair = /^\*\*(.+?)\*\*\s*\n([^\n]+(?:\n(?!\s*$)[^\n]+)*)/gm;
  let match: RegExpExecArray | null;
  while ((match = pair.exec(section))) {
    faqs.push({
      question: match[1].trim(),
      answer: match[2].replace(/\s+/g, ' ').trim(),
    });
  }

  if (!faqs.length) {
    throw new Error(
      `A post has a "${heading[1]}" section but no **question** / answer pairs were found in it.`
    );
  }
  return faqs;
}
