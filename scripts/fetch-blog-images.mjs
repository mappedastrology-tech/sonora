/**
 * Downloads blog photos that are listed in src/content/blog-images.json.
 *
 * The site's security policy only shows images served from sonoramethod.com,
 * so campaign photos in a post have to live in public/. This script copies
 * each listed photo into public/ during the build. A photo that is already
 * there is left alone, so a file committed by hand always wins.
 *
 * If a photo cannot be downloaded the build stops, which keeps the last good
 * version of the site live instead of publishing a post with a broken image.
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const manifest = JSON.parse(
  await readFile(join(root, 'src/content/blog-images.json'), 'utf8'),
);

let fetched = 0;
for (const [localPath, sourceUrl] of Object.entries(manifest)) {
  const target = join(root, 'public', localPath);
  try {
    await access(target);
    continue;
  } catch {}
  const res = await fetch(sourceUrl, {
    headers: { 'user-agent': 'Mozilla/5.0 (sonoramethod.com build)' },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`Could not download ${sourceUrl} for ${localPath}: HTTP ${res.status}`);
  }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await res.arrayBuffer()));
  fetched++;
}
console.log(`[blog-images] ${fetched} downloaded, ${Object.keys(manifest).length - fetched} already present`);
