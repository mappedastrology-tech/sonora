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
const failures = [];
for (const [localPath, sourceUrl] of Object.entries(manifest)) {
  const target = join(root, 'public', localPath);
  try {
    await access(target);
    continue;
  } catch {}
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
        accept: 'image/webp,image/png,image/jpeg,image/*;q=0.8',
      },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(await res.arrayBuffer()));
    fetched++;
  } catch (err) {
    failures.push(`${localPath} <- ${sourceUrl}: ${err.message}`);
  }
}
console.log(`[blog-images] ${fetched} downloaded, ${failures.length} failed`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
