/**
 * Build-time asset generation. Runs before every `npm run build`.
 *
 * 1. Writes placeholder brand PNGs, but only where a file is missing. Drop
 *    Taylor's real PNGs into public/brand/ and they are used untouched.
 * 2. Derives favicon.ico, favicon-32.png, favicon-16.png and
 *    apple-touch-icon.png from public/brand/sonora-icon.png every time, so
 *    replacing the icon regenerates all four.
 * 3. Renders the default Open Graph card and one card per blog post.
 * 4. Converts a supplied headshot to WebP, or writes a placeholder.
 *
 * Nothing here runs in the browser. Fonts are read from scripts/fonts/ so the
 * build does not depend on network access.
 */
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFile, writeFile, mkdir, readdir, access, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  iconSvg,
  archSvg,
  wordmarkSvg,
  fullSvg,
  ogTextSvg,
  headshotPlaceholderSvg,
  INK,
  PAPER,
} from './brand-svg.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, 'public');
const brandDir = path.join(publicDir, 'brand');
const imagesDir = path.join(publicDir, 'images');
const fontsDir = path.join(root, 'scripts', 'fonts');

const FONT_FILES = [
  path.join(fontsDir, 'Poppins-SemiBold.ttf'),
  path.join(fontsDir, 'Inter-Regular.ttf'),
];

const log = (message) => console.log(`  ${message}`);

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function renderPng(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: {
      fontFiles: FONT_FILES,
      loadSystemFonts: false,
      defaultFontFamily: 'Poppins',
    },
  });
  return resvg.render().asPng();
}

/** Writes a PNG only if the destination is missing. Returns true if written. */
async function writeIfMissing(filePath, buffer) {
  if (await exists(filePath)) return false;
  await writeFile(filePath, buffer);
  return true;
}

/**
 * Minimal ICO container. Modern browsers accept PNG-encoded ICO entries, so
 * each size is embedded as a PNG rather than a BMP.
 */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const directory = [];

  for (const entry of entries) {
    const record = Buffer.alloc(16);
    record.writeUInt8(entry.size >= 256 ? 0 : entry.size, 0); // width
    record.writeUInt8(entry.size >= 256 ? 0 : entry.size, 1); // height
    record.writeUInt8(0, 2); // palette
    record.writeUInt8(0, 3); // reserved
    record.writeUInt16LE(1, 4); // colour planes
    record.writeUInt16LE(32, 6); // bits per pixel
    record.writeUInt32LE(entry.data.length, 8);
    record.writeUInt32LE(offset, 12);
    directory.push(record);
    offset += entry.data.length;
  }

  return Buffer.concat([
    header,
    ...directory,
    ...entries.map((entry) => entry.data),
  ]);
}

/** Frontmatter reader. Only needs title and draft, so a full parser is overkill. */
function readFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!pair) continue;
    let value = pair[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[pair[1]] = value;
  }
  return data;
}

/**
 * Turns the supplied artwork in public/brand/source/ into the marks the site
 * uses.
 *
 * The originals are black line art on a transparent background, generously
 * padded inside a 2000px square. Two things change:
 *
 *   - The padding is trimmed off, so the CSS sizes the mark itself rather than
 *     the empty space around it. A 140px-wide nav logo was rendering the actual
 *     wordmark at about half that.
 *   - Black becomes --ink. The brand system rules out pure black anywhere, and
 *     #000 against a warm cream palette reads as a foreign object.
 *
 * The recolour keeps the artwork's own alpha channel and only replaces the RGB
 * underneath it, so antialiased edges survive exactly as drawn.
 *
 * The originals are never modified. Re-run this after replacing anything in
 * source/ and every derived file follows.
 */
async function normalizeBrandSource() {
  const sourceDir = path.join(brandDir, 'source');
  if (!(await exists(sourceDir))) return false;

  const files = (await readdir(sourceDir)).filter((file) => file.endsWith('.png'));
  if (!files.length) return false;

  for (const name of files) {
    const trimmed = await sharp(path.join(sourceDir, name))
      .ensureAlpha()
      .trim({ threshold: 1 })
      .png()
      .toBuffer();

    const { data: alpha, info } = await sharp(trimmed)
      .extractChannel('alpha')
      .raw()
      .toBuffer({ resolveWithObject: true });

    const inked = await sharp({
      create: {
        width: info.width,
        height: info.height,
        channels: 3,
        background: INK,
      },
    })
      .joinChannel(alpha, {
        raw: { width: info.width, height: info.height, channels: 1 },
      })
      .png()
      .toBuffer();

    await writeFile(path.join(brandDir, name), inked);
  }

  log(`brand: normalised ${files.length} supplied mark(s) from source/`);
  return true;
}

async function generateBrand() {
  await mkdir(brandDir, { recursive: true });

  const placeholders = [
    ['sonora-icon.png', () => renderPng(iconSvg(), 512)],
    ['sonora-arch.png', () => renderPng(archSvg(), 400)],
    ['sonora-wordmark.png', () => renderPng(wordmarkSvg(), 480)],
    ['sonora-full.png', () => renderPng(fullSvg(), 800)],
  ];

  let written = 0;
  for (const [name, render] of placeholders) {
    if (await writeIfMissing(path.join(brandDir, name), render())) written += 1;
  }

  // A marker so `npm run verify` keeps flagging that these are stand-ins. It is
  // committed alongside the generated artwork, because a fresh checkout finds
  // every file present and generates nothing — the artwork is still a stand-in
  // either way. Deleting this file is the documented step when the real PNGs
  // land; nothing here recreates it unless artwork had to be generated again.
  const marker = path.join(brandDir, '.placeholder-artwork');
  if (written) {
    await writeFile(
      marker,
      'Generated stand-in artwork. Delete this file once the real PNGs are in place.\n'
    );
    log(`brand: wrote ${written} generated file(s) — replace with the real PNGs`);
  } else if (await exists(marker)) {
    log('brand: all files present — still the generated stand-ins');
  } else {
    log('brand: all files present, none overwritten');
  }
}

/**
 * The knockout wordmark is derived from sonora-wordmark.png when Taylor
 * supplies a real one, so she does not have to produce a second file.
 */
async function generateKnockout() {
  const source = path.join(brandDir, 'sonora-wordmark.png');
  const target = path.join(brandDir, 'sonora-wordmark-knockout.png');

  if (!(await exists(source))) return;

  const stats = await sharp(source).metadata();
  if (!stats.width || !stats.height) return;

  // A knockout is the same artwork in paper: keep the alpha channel, replace
  // every colour. Derived every build so Taylor never has to supply a second
  // file when she sends the real wordmark.
  const recoloured = await sharp(source)
    .ensureAlpha()
    .composite([
      {
        input: {
          create: {
            width: stats.width,
            height: stats.height,
            channels: 4,
            background: PAPER,
          },
        },
        blend: 'in',
      },
    ])
    .png()
    .toBuffer();

  await writeFile(target, recoloured);
  log('brand: derived sonora-wordmark-knockout.png from sonora-wordmark.png');
}

/**
 * WebP copies of the brand artwork. Taylor supplies PNGs — those filenames are
 * the contract in the README — and the pages reference the WebP the build
 * produces from them. Every browser in use supports WebP, and it is roughly a
 * quarter the weight.
 */
async function generateBrandWebp() {
  const sources = [
    'sonora-full.png',
    'sonora-wordmark.png',
    'sonora-wordmark-knockout.png',
    'sonora-icon.png',
    'sonora-icon-compact.png',
    'sonora-arch.png',
  ];

  let count = 0;
  for (const name of sources) {
    const source = path.join(brandDir, name);
    if (!(await exists(source))) continue;
    await sharp(source)
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(brandDir, name.replace(/\.png$/, '.webp')));
    count += 1;
  }

  log(`brand: ${count} WebP copies for the pages to use`);
}

/**
 * Records the intrinsic size of every brand image the pages render.
 *
 * The components need width and height attributes to reserve space and keep
 * CLS at zero, and those numbers have to match the files exactly. Hard-coding
 * them meant the artwork and the markup could disagree — which is precisely
 * what happened when the real marks replaced the stand-ins and came back with
 * different proportions. Now the numbers are read from the files.
 */
async function writeBrandManifest() {
  const files = [
    'sonora-full.webp',
    'sonora-wordmark.webp',
    'sonora-wordmark-knockout.webp',
    'sonora-icon.webp',
    'sonora-icon-compact.webp',
    'sonora-arch.webp',
  ];

  const manifest = {};
  for (const name of files) {
    const file = path.join(brandDir, name);
    if (!(await exists(file))) continue;
    const { width, height } = await sharp(file).metadata();
    manifest[name.replace(/\.webp$/, '')] = { width, height };
  }

  const headshot = path.join(imagesDir, 'taylor-corbett.webp');
  if (await exists(headshot)) {
    const { width, height } = await sharp(headshot).metadata();
    manifest['taylor-corbett'] = { width, height };
  }

  await writeFile(
    path.join(root, 'src', 'lib', 'brand-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  log('brand: wrote src/lib/brand-manifest.json');
}

async function generateFavicons() {
  // The compact crop, so the arch is still legible at 16px.
  const compact = path.join(brandDir, 'sonora-icon-compact.png');
  const iconPath = (await exists(compact))
    ? compact
    : path.join(brandDir, 'sonora-icon.png');
  if (!(await exists(iconPath))) {
    log('favicons: skipped, no icon artwork found');
    return;
  }

  const source = await readFile(iconPath);

  /*
   * The ink arch on a plain paper field, opaque, at every size.
   *
   * Opaque rather than transparent, because a see-through mark has to survive
   * both tab strips and measured against Chrome's own colours no single colour
   * does: the ink mark is 14:1 on the light strip but 1.5:1 on the dark one,
   * and gold is the reverse at 1.2:1 and 7.6:1. Handing the browser a light
   * and a dark file with `media` only helps where `media` on
   * <link rel="icon"> is honoured, and /favicon.ico — which browsers fetch on
   * their own — carries no media at all. That is why the icon went missing.
   *
   * A paper tile settles it from the other direction: ink on paper is 17.4:1,
   * and a light tile reads as a light tile whatever the browser paints behind
   * it. Paper and ink rather than white and black, which the palette bars.
   *
   * The small sizes are DRAWN, not resized.
   *
   * Downscaling the brand mark was the second thing that went wrong here. The
   * mark is an arch plus a crescent above and below, and it is portrait — 0.69
   * wide for its height. Fitting that into a square fits it by height, so at
   * 16px the result was 7 pixels wide, bleeding top edge to bottom edge, with
   * the two crescents reduced to grey smudges. It measured perfectly: paper in
   * the corners, ink in the middle. It just did not look like anything.
   *
   * So the tab sizes get the arch alone, drawn as vector at each size: the
   * silhouette that survives 16 pixels, with real margin around it. The
   * crescents stay on the 180px home-screen icon, where there is room to read
   * them.
   */
  const archTile = (size) => {
    const height = size * 0.84;
    const width = height * 0.7; // the brand arch's own proportion
    const x = (size - width) / 2;
    const y = (size - height) / 2;
    const r = width / 2;
    const arch = [
      `M ${x} ${y + height}`,
      `L ${x} ${y + r}`,
      `A ${r} ${r} 0 0 1 ${x + width} ${y + r}`,
      `L ${x + width} ${y + height}`,
      'Z',
    ].join(' ');
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"`,
      ` viewBox="0 0 ${size} ${size}">`,
      `<rect width="${size}" height="${size}" fill="${PAPER}"/>`,
      `<path d="${arch}" fill="${INK}"/>`,
      '</svg>',
    ].join('');
  };

  // Flattened to RGB: resvg emits an alpha channel, and an icon that carries
  // one — even fully opaque — is the thing that went wrong the first time.
  const drawn = (size) =>
    sharp(Buffer.from(new Resvg(archTile(size), { fitTo: { mode: 'original' } }).render().asPng()))
      .flatten({ background: PAPER })
      .png()
      .toBuffer();

  // The full mark, with its crescents, on the same paper tile. 180px is a home
  // screen icon, so the detail is legible there.
  const touchIcon = await sharp({
    create: { width: 180, height: 180, channels: 3, background: PAPER },
  })
    .composite([{ input: await sharp(source).resize({ height: 152, fit: 'inside' }).toBuffer() }])
    .flatten({ background: PAPER })
    .removeAlpha()
    .png()
    .toBuffer();

  const [png16, png32, png48] = await Promise.all([drawn(16), drawn(32), drawn(48)]);

  await Promise.all([
    writeFile(path.join(publicDir, 'favicon-16.png'), png16),
    writeFile(path.join(publicDir, 'favicon-32.png'), png32),
    writeFile(path.join(publicDir, 'apple-touch-icon.png'), touchIcon),
    writeFile(
      path.join(publicDir, 'favicon.ico'),
      buildIco([
        { size: 16, data: png16 },
        { size: 32, data: png32 },
        { size: 48, data: png48 },
      ])
    ),
  ]);

  log('favicons: 16/32/48 arch drawn at size, apple-touch full mark — ink on paper, opaque');
}

/**
 * Finds the arch inside a ringed mark.
 *
 * The arch is the only solid mass in the artwork; the sonar rings are thin
 * arcs. So a column that contains a long unbroken vertical run of ink belongs
 * to the arch, and one that does not belongs to a ring. That distinction holds
 * regardless of how many rings the mark has or how large it is drawn, which is
 * what lets the compact crop below survive an artwork change.
 *
 * Returns null if no solid mass is found, in which case callers fall back to
 * the uncropped mark rather than guessing.
 */
async function findArch(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const alphaAt = (x, y) => data[(y * width + x) * channels + 3];

  const solidColumns = [];
  let tallestRun = 0;

  for (let x = 0; x < width; x += 1) {
    let run = 0;
    let longest = 0;
    for (let y = 0; y < height; y += 1) {
      if (alphaAt(x, y) > 128) {
        run += 1;
        if (run > longest) longest = run;
      } else {
        run = 0;
      }
    }
    if (longest > height * 0.15) solidColumns.push(x);
    if (longest > tallestRun) tallestRun = longest;
  }

  if (!solidColumns.length) return null;

  const left = solidColumns[0];
  const right = solidColumns[solidColumns.length - 1];

  // Vertical extent of the arch alone: walk the centre column and take the
  // longest unbroken run, which is the arch body rather than a ring crossing it.
  const centre = Math.round((left + right) / 2);
  let bestStart = 0;
  let bestLength = 0;
  let start = null;

  for (let y = 0; y <= height; y += 1) {
    const on = y < height && alphaAt(centre, y) > 128;
    if (on && start === null) start = y;
    if (!on && start !== null) {
      if (y - start > bestLength) {
        bestLength = y - start;
        bestStart = start;
      }
      start = null;
    }
  }

  if (!bestLength) return null;

  return {
    left,
    right,
    top: bestStart,
    bottom: bestStart + bestLength - 1,
    imageWidth: width,
    imageHeight: height,
  };
}

/**
 * A tighter icon for the places the mark has to read small.
 *
 * The supplied icon is five rings deep either side of the arch, so at nav or
 * favicon size the arch renders about eleven pixels tall and the rings collapse
 * into grey mush. This crop keeps the arch and the innermost ring pair and
 * drops the rest — the multipliers below are what includes exactly one ring on
 * each axis.
 */
async function generateCompactIcon() {
  const source = path.join(brandDir, 'sonora-icon.png');
  if (!(await exists(source))) return;

  const arch = await findArch(source);
  if (!arch) {
    log('brand: compact icon skipped, no arch found in sonora-icon.png');
    return;
  }

  const centreX = (arch.left + arch.right) / 2;
  const centreY = (arch.top + arch.bottom) / 2;
  // Tuned so the crop lands in the gap between the innermost ring pair and the
  // next one out. Any wider and the second ring's descending tips clip into the
  // corners as loose shards.
  const halfWidth = ((arch.right - arch.left + 1) / 2) * 1.6;
  const halfHeight = ((arch.bottom - arch.top + 1) / 2) * 1.48;

  const left = Math.max(0, Math.round(centreX - halfWidth));
  const top = Math.max(0, Math.round(centreY - halfHeight));
  const width = Math.min(arch.imageWidth - left, Math.round(halfWidth * 2));
  const height = Math.min(arch.imageHeight - top, Math.round(halfHeight * 2));

  await sharp(source)
    .extract({ left, top, width, height })
    .png()
    .toFile(path.join(brandDir, 'sonora-icon-compact.png'));

  log(`brand: compact icon cropped to ${width}x${height} from ${arch.imageWidth}x${arch.imageHeight}`);
}

/** Recolours a brand PNG, keeping its alpha. Used for marks on ink. */
async function recolourMark(file, colour) {
  const { data: alpha, info } = await sharp(file)
    .ensureAlpha()
    .extractChannel('alpha')
    .raw()
    .toBuffer({ resolveWithObject: true });

  return sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 3,
      background: colour,
    },
  })
    .joinChannel(alpha, {
      raw: { width: info.width, height: info.height, channels: 1 },
    })
    .png()
    .toBuffer();
}

/**
 * Open Graph cards: the ink background and title come from an SVG, the mark
 * itself is the supplied artwork composited on top in paper.
 */
/**
 * Blog artwork: the supplied SVGs in assets/blog/, rasterised to PNG.
 *
 * They exist as PNGs because that is what a social card has to be — no major
 * platform renders an SVG in og:image. The SVG stays the source of truth.
 */
async function generateBlogArt() {
  const sourceDir = path.join(root, 'assets', 'blog');
  if (!(await exists(sourceDir))) {
    log('blog art: no assets/blog directory, skipped');
    return;
  }

  const outDir = path.join(imagesDir, 'blog');
  await mkdir(outDir, { recursive: true });

  const files = (await readdir(sourceDir)).filter((file) => file.endsWith('.svg'));
  for (const file of files) {
    const svg = await readFile(path.join(sourceDir, file), 'utf8');
    await writeFile(path.join(outDir, file.replace(/\.svg$/, '.png')), renderPng(svg, 1200));
  }
  log(`blog art: ${files.length} card(s) rendered to images/blog/`);
}

async function generateOgImages() {
  await mkdir(imagesDir, { recursive: true });

  const fullMark = path.join(brandDir, 'sonora-full.png');
  const wordmark = path.join(brandDir, 'sonora-wordmark.png');

  // Default card: the full mark, centred.
  let base = renderPng(ogTextSvg(), 1200);
  if (await exists(fullMark)) {
    const mark = await sharp(await recolourMark(fullMark, PAPER))
      .resize({ width: 620 })
      .toBuffer();
    const { width, height } = await sharp(mark).metadata();
    base = await sharp(base)
      .composite([
        {
          input: mark,
          left: Math.round((1200 - width) / 2),
          top: Math.round((630 - height) / 2),
        },
      ])
      .png()
      .toBuffer();
  }
  await writeFile(path.join(imagesDir, 'og-default.png'), base);

  const blogDir = path.join(root, 'src', 'content', 'blog');
  if (!(await exists(blogDir))) {
    log('og: default card only, no blog directory');
    return;
  }

  const files = (await readdir(blogDir)).filter((file) => file.endsWith('.md'));
  const ogDir = path.join(imagesDir, 'og');
  await mkdir(ogDir, { recursive: true });

  // Post cards: title on the left, wordmark sitting under the accent rule.
  const postMark = (await exists(wordmark))
    ? await sharp(await recolourMark(wordmark, PAPER)).resize({ width: 210 }).toBuffer()
    : null;

  let count = 0;
  for (const file of files) {
    const source = await readFile(path.join(blogDir, file), 'utf8');
    const data = readFrontmatter(source);
    if (data.draft === 'true' || !data.title) continue;

    let card = renderPng(ogTextSvg({ title: data.title }), 1200);
    if (postMark) {
      card = await sharp(card)
        .composite([{ input: postMark, left: 80, top: 520 }])
        .png()
        .toBuffer();
    }

    await writeFile(
      path.join(ogDir, `${file.replace(/\.md$/, '')}.png`),
      card
    );
    count += 1;
  }

  log(`og: default card + ${count} post card(s)`);
}

async function generateHeadshot() {
  await mkdir(imagesDir, { recursive: true });
  const target = path.join(imagesDir, 'taylor-corbett.webp');

  const candidates = [
    'taylor-corbett-source.jpg',
    'taylor-corbett-source.jpeg',
    'taylor-corbett-source.png',
    'taylor-corbett-source.webp',
  ];

  for (const candidate of candidates) {
    const source = path.join(imagesDir, candidate);
    if (await exists(source)) {
      await sharp(source)
        .resize(800, 800, { fit: 'cover', position: 'top' })
        .webp({ quality: 82 })
        .toFile(target);
      await rm(path.join(imagesDir, '.placeholder-headshot'), { force: true });
      log(`headshot: converted ${candidate} to taylor-corbett.webp`);
      return;
    }
  }

  if (await exists(target)) {
    log('headshot: existing taylor-corbett.webp kept');
    return;
  }

  const png = renderPng(headshotPlaceholderSvg(), 800);
  await sharp(png).webp({ quality: 82 }).toFile(target);
  await writeFile(
    path.join(imagesDir, '.placeholder-headshot'),
    'Generated stand-in. Removed automatically once a real source image is supplied.\n'
  );
  log('headshot: placeholder written — drop taylor-corbett-source.jpg in public/images/');
}

console.log('Generating brand assets…');
const hasSuppliedArtwork = await normalizeBrandSource();
if (!hasSuppliedArtwork) await generateBrand();
await generateCompactIcon();
await generateKnockout();
await generateBrandWebp();
await generateFavicons();
await generateBlogArt();
await generateOgImages();
await generateHeadshot();
await writeBrandManifest();
console.log('Done.');
