# sonoramethod.com

This is the Sonora website. It is a set of files that get turned into a website
automatically. You do not need to understand how that works to change what the
site says.

This README is written for Taylor. It assumes no programming experience. Where
something genuinely needs a developer, it says so.

---

## The short version

- **To change words on a page:** edit a file in `src/pages/`, save, done.
- **To publish a blog post:** add a file to `src/content/blog/`, save, done.
- **To publish anything:** save the change on GitHub. The site rebuilds and goes
  live on its own in about a minute.
- **If something looks broken:** nothing you do here can break the live site
  permanently. The previous version stays up until the new one builds cleanly.

---

## What is still outstanding

Three things, none of them code.

**1. Point the form notifications at your inbox.** The three forms — `question`
on the booking page, `contact`, and `newsletter` — are live and Netlify is
collecting submissions. It will not email you about them until you say where to
send them, and that switch only exists in the dashboard:

> Netlify → **sonoramethod** → Forms → pick a form → **Settings & usage** →
> Form notifications → **Add notification** → *Email notification* → put
> `hello@sonoramethod.com` in "Email to notify" → Save.

Do it once per form. Until then, submissions are still safely stored — Forms
→ the form name lists them, and you can export as a spreadsheet.

**2. Set the analytics data retention to 14 months.** Google Analytics throws
history away after two months by default, so the year-over-year comparison you
will want next spring has to be switched on now — it cannot be backfilled.

> Google Analytics → **Admin** → Data collection and modification → **Data
> retention** → set *Event data retention* to **14 months** → Save.

That is the whole of it. The consent question that used to sit here is settled;
see "Analytics" further down for the decision and the one thing that would
reopen it.

**3. Create the `hello@sonoramethod.com` mailbox** in Google Workspace. That is
an inbox, not a code change; the site already links to it. The notifications
above need it to exist before they are any use.

After launch there are three more items, listed at the bottom of this file.

---

## Changing words on a page

Every page is one file. Open it, find the sentence, change it, save.

| Page on the site | File to edit |
|---|---|
| Homepage | `src/pages/index.astro` |
| The Sonora Method | `src/pages/method.astro` |
| Services | `src/pages/services.astro` |
| About | `src/pages/about.astro` |
| Book a call | `src/pages/book.astro` |
| Contact | `src/pages/contact.astro` |
| Blog (the index) | `src/pages/blog/index.astro` |
| Privacy | `src/pages/privacy.astro` |
| The "page not found" page | `src/pages/404.astro` |

Inside those files, your words sit between angle-bracket tags like `<p>` and
`</p>`. Change what is between the tags. Leave the tags alone.

```
<p>
  This sentence you can change.
</p>
```

Three things live in one place because they appear on several pages:

- **Contact details, location, tagline, the nav and footer links** —
  `src/lib/site.ts`
- **The four method stages** — `src/lib/method.ts` (short version, homepage) and
  `src/lib/method-page.ts` (long version, Method page)
- **The four services** — `src/lib/site.ts` (one-liners) and
  `src/lib/services-detail.ts` (full descriptions)
- **The four FAQ answers** — `src/lib/faq.ts`

Change them there and every page that uses them updates at once. The FAQ file is
worth knowing about: the same words feed the visible page *and* the hidden
markup that answer engines read, so the two can never disagree.

### Two characters to be careful with

Apostrophes and quotes inside a page file should be written as `&rsquo;` for a
curly apostrophe. If you type a plain `'` it still works — it just looks
slightly less polished. Both are fine.

---

## Publishing a blog post

1. Go to `src/content/blog/` on GitHub.
2. Click **Add file → Create new file**.
3. Name it with the words you want in the URL, all lowercase, hyphens instead of
   spaces, ending in `.md`. `seo-isnt-dead.md` becomes
   `sonoramethod.com/blog/seo-isnt-dead`.
4. Paste this at the top, filling in your own values:

```markdown
---
title: "SEO isn't dead, it's evolved"
description: "One or two sentences. This is what shows up in Google and in link previews. Keep it under 155 characters."
date: 2026-09-01
topic: "Search"
pullQuote: "One line lifted from the post. Shown on the blog page if this is the newest post."
draft: false
---

Your first paragraph goes here. Just write normally.

**`topic` is required.** It has to be one of exactly four: `Search`,
`Positioning`, `AI answers`, `Measurement`. It sets which filter the post
appears under on `/blog` and which of the four icons it gets. A typo fails the
build rather than inventing a fifth filter nobody can clear.

**`pullQuote` is optional.** The newest post is featured on `/blog` with this
line set in gold beside it. Without one the panel is simply empty.

**Do not start the post with a `#` heading.** The title above is already the
page's h1; a second one makes the page fail its accessibility check. Start
sections at `##`.

### Artwork for a post

Optional. Drop an SVG into `assets/blog/` named after the post's file, then run
`npm run assets` — it renders a 1200x630 PNG into `public/images/blog/`. Point
the post at the **PNG**, not the SVG:

```markdown
image: "/images/blog/seo-isnt-dead.png"
imageAlt: "Sonora arch mark on a deep navy field"
```

It appears at the top of the post and is the image used in link previews on
LinkedIn, Slack and X. It has to be a PNG: none of those platforms render an
SVG in a social card. Without an `image`, the post falls back to a generated
card, so this is never required.

## A section heading uses two hash marks

More writing.

- A bullet list
- Looks like this

> A pull quote looks like this.
```

5. Write the post below that block.
6. Click **Commit changes**.

The post appears on `/blog`, on the homepage, in the RSS feed, in the sitemap, in
`llms.txt`, and gets its own social share image — all automatically. Nothing
else to update.

**Everything above the second `---` is required except `draft`.** A post without
a `description` will stop the build on purpose, because a post without one gets
a blank preview everywhere it is shared.

### Working on a post before it's ready

Set `draft: true` in that block. The post stays in the repo and never appears on
the site. Change it to `false` when you want it live.

### Dates

Write dates as `2026-09-01` — year, month, day. Posts sort newest first.

---

## Publishing changes

If you are editing on github.com, clicking **Commit changes** is the whole
process. Netlify notices, rebuilds the site, and the change is live in about a
minute.

If a build fails, Netlify emails you and **the old version of the site stays
up**. Forward the email to whoever is helping you; the message says which file
and which line.

---

## The logo files

Your artwork lives in `public/brand/source/`. Those four PNGs are the originals,
exactly as you supplied them, and nothing ever modifies them:

| File in `source/` | What it is |
|---|---|
| `sonora-full.png` | Wordmark with the sonar rings |
| `sonora-wordmark.png` | Wordmark only |
| `sonora-icon.png` | Arch with rings |
| `sonora-arch.png` | Solid arch |

Everything the site actually serves is derived from them on each build: the
marks recoloured from black to the brand navy and trimmed of their padding, the
cream version for the dark footer, a tighter crop of the icon for small sizes,
the WebP copies the pages load, the favicons, the apple touch icon, and both
social share images.

The tab icons have transparent backgrounds and ship in two colours — the navy
mark for light browser chrome and a cream one for dark, picked automatically.
The apple touch icon is the one exception and keeps a solid background, because
iOS puts a transparent home-screen icon on black.

**To change a logo:** replace the file in `public/brand/source/`, keeping the
same name. That is the whole process. Do not edit the files that sit directly in
`public/brand/` — they are regenerated and your changes would be overwritten.

Two things worth knowing about what the build does to your artwork:

- **Black becomes navy.** Your files are pure black; the brand system rules out
  pure black anywhere on the site, so the marks are recoloured to `#0C0A3E`. The
  originals in `source/` stay black.
- **The padding is trimmed.** Your files are a mark centred in a large empty
  square. The build crops to the mark itself so that sizing in the page controls
  how big the logo looks, rather than the empty space around it.
- **A tighter icon is cut for small sizes.** The full icon is five rings deep
  either side of the arch. In the phone header and in a browser tab, all five
  collapse into a grey smudge and the arch ends up about eleven pixels tall. So
  the build also cuts `sonora-icon-compact.png` — the arch plus the innermost
  ring on each side — and uses that for the mobile logo and the favicons. The
  full icon is untouched and still used everywhere there is room for it.

## Your headshot

The source image is `public/images/taylor-corbett-source.png`. The build crops
it square, compresses it, and produces the version the site uses.

To change it, replace that file (`.jpg`, `.png` or `.webp` all work — keep the
name `taylor-corbett-source`). It is displayed as a square with a rounded top —
the arch shape — so a photo with some headroom crops best.

## The booking page

`/book` is pointed at your Google Calendar appointment schedule, set by
`BOOKING_URL` in `src/lib/site.ts`. Change that one line if you ever make a new
schedule.

### Two kinds of Google booking link, and only one can be embedded

Google gives out two URLs for the same appointment schedule:

| | Frameable? |
|---|---|
| `https://calendar.app.google/XXXX` — the short "Copy link" one | **No** |
| `https://calendar.google.com/calendar/appointments/schedules/…` | Yes |

The short link is a redirect, and Google sends `X-Frame-Options` on it. Put it
in a frame and the visitor gets Chrome's grey "calendar.app.google refused to
connect" box where the calendar should be. Both links work perfectly when
opened directly — it is only framing that the short one refuses.

So the page checks which kind it has:

- **Long URL** → the calendar is embedded in the card, and a "calendar not
  loading?" link sits underneath it, because some privacy extensions block
  third-party frames. Do not remove that line.
- **Short URL** → no frame at all. The card becomes a booking panel with a
  "See open times" button that opens the schedule in a new tab. Booking still
  works; it is just one click further away.

The link is currently the long form, so the calendar is embedded. If you ever
swap in a short one, `npm run verify` says so as a warning rather than a
failure.

### If you make a new appointment schedule

1. Google Calendar → open the schedule → **Open booking page**.
2. Copy the URL out of the browser's address bar.
3. Paste it over `BOOKING_URL_AS_GIVEN` in `src/lib/site.ts`, exactly as Google
   gave it to you.

Nothing else changes. The page adds `?gv=true` itself, and it strips the
`/u/0/` out of the URL for you — that segment means "the first Google account
signed in to this browser", which is right for you and wrong for a visitor
signed in to a second account. `npm run verify` fails if it ever survives to
the built page.

**Also worth checking once it is live:** an embedded Google calendar sometimes
needs the schedule's sharing setting to be public before it will render for
strangers.

## Analytics

Google Analytics is installed on every page, using your measurement ID
`G-1Y3VHRLY9Q`. Nothing to configure. Traffic shows up in your Google Analytics
dashboard within a day of the site going live.

To change the property later, edit `GA_MEASUREMENT_ID` in `src/lib/site.ts`.

### If Analytics says "No data received from your website yet"

That banner is about hits arriving, not about the tag being installed, and it
clears on its own once one real visit lands. Three things to check, cheapest
first:

1. **Look at Realtime, not Home.** Reports → Realtime shows a visit within
   seconds. Home lags by up to a day and keeps the banner up long after the
   first hit.
2. **Turn off your ad blocker, or use a private window.** uBlock, Brave's
   shields, Safari's tracking prevention and most privacy extensions all block
   Google Analytics outright. If you are the only visitor so far and you browse
   with any of those, Analytics correctly reports nothing.
3. **Confirm a visit happened after the tag deployed.** The measurement ID went
   live at 21:45 UTC on 25 August. Visits before that went to the old property.

What does *not* need checking is whether the tag is on the page: `npm run
verify` fails the build if it is missing from any page, if it stops making
`gtag` global, or if the CSP would block a hit.

### One trap worth knowing about

The snippet uses `set:html`, not Astro's `define:vars`. `define:vars` wraps the
script in an IIFE, and the failure that causes is genuinely nasty: page views
keep working, because `gtag.js` reads `window.dataLayer` directly, so Analytics
looks perfectly healthy — but `window.gtag` is never defined, so every event
fired from elsewhere on the site (the fit quiz) silently does nothing. No
console error, no missing traffic, no signal at all. The site shipped that way
briefly. `npm run verify` now fails on it, so it cannot come back quietly.

### Why there is no cookie banner

Google Analytics sets cookies, and in the EU and UK that normally needs consent
first. It does not apply here, and the reason is worth writing down so nobody
re-opens it by accident.

European law reaches a US business when that business *targets* people in
Europe — markets to them, sells to them, or tracks their behaviour on purpose.
A website merely being reachable from Berlin is explicitly not enough. Sonora
sells in the US and does no outbound to companies abroad; a European reader who
finds a post and gets counted in the page views is incidental traffic, not an
audience being courted. So: no banner, and the privacy page describes the
cookies plainly instead, which is what US law actually asks for.

Two things back that up on the US side. The state privacy laws — California,
Colorado, Texas and the rest — carry size thresholds a one-person consultancy
sits well under, so their machinery does not switch on. And Google Signals and
ad personalisation are both switched off in the tag, which is the difference
between "counts visits" and "feeds an advertising profile" — the thing that
would otherwise count as *sharing* data under the California law.

**What would reopen this:** deliberately marketing into the EU or UK. Running
ads there, buying a list of European companies, publishing in another European
language, quoting in euros or pounds, or hiring someone to do outbound into
those markets. Any of those turns incidental traffic into a targeted audience,
and then the honest fix is cookieless analytics (Plausible or Fathom — one line
in `src/layouts/Base.astro`) rather than a banner. Inbound enquiries from
abroad that you simply answer do not count.

*(Not legal advice — but it is the reasoning, so a lawyer can check the
reasoning rather than starting cold.)*

## The tab icon

`favicon.ico`, `favicon-16.png`, `favicon-32.png` and `apple-touch-icon.png`
are generated by `npm run assets` from the arch artwork: an ink arch on a plain
paper tile.

They are opaque on purpose. A see-through icon has to stay legible against both
a light and a dark browser tab strip, and no single colour manages it —
measured against Chrome's own tab colours the ink mark is 14:1 on the light
strip and 1.5:1 on the dark one, and gold is the reverse at 1.2:1 and 7.6:1.
That is why the icon looked missing: against a dark tab strip there was nothing
to see. An opaque tile sidesteps the question — ink on paper is 17.4:1 whatever
the browser paints around it.

Browsers cache favicons hard. After a deploy a tab that has already seen the
old one may keep showing it, so check in a private window to see what a new
visitor gets.

---

## The newsletter

Both signup forms — footer and blog page — currently collect addresses through
Netlify. To read them: Netlify dashboard → your site → **Forms** → `newsletter`.
You can export the list as a spreadsheet from there.

When you pick a proper email provider (ConvertKit, Buttondown, or Beehiiv), the
change is one line in `src/components/NewsletterForm.astro`: swap the `action`
to that provider's form endpoint and remove `data-netlify="true"`. Nothing else
about the form changes. Export your existing list from Netlify first and import
it into the new provider.

Two things the first send has to carry, because US email law asks for them and
the privacy page already promises the second: a real postal address in the
footer of the email, and an unsubscribe link that works and is honoured within
ten business days. Every provider named above does both for you — this is a
reason to move off Netlify before you send rather than after.

The contact form works the same way and lands in the same place, under
`contact`, as does the "have a question first" form on the booking page, under
`question`.

Netlify stores submissions whether or not it emails you about them. To get the
email, add a notification per form — the steps are under "What is still
outstanding" at the top of this file.

---

## Things this site will not let you do by accident

Some rules from the brief are enforced by the code, not by memory:

- **A page without a title or description stops the build.** It cannot ship
  half-configured.
- **A blog post without a description stops the build.**
- **Draft posts never reach the live site**, even by a stray link.
- `npm run verify` **fails** if a price or a rate appears anywhere in the built
  site.
- `npm run verify` **fails** if the booking embed loses its fallback link, or if
  the privacy page stops describing the analytics that are actually installed.
- The testimonial component has **no field for a company name**. That is
  deliberate. Do not add one.
- Logo dimensions in the page markup are read from the files themselves, so
  replacing artwork with different proportions can never leave the layout
  jumping as images load.

---

## For a developer

Astro, static output, no framework JavaScript. Plain CSS with custom properties
in `src/styles/global.css`; everything else is component-scoped.

```bash
npm install       # once
npm run dev       # local preview at http://localhost:4321
npm run build     # production build into dist/
npm run verify    # run the pre-launch checklist against dist/
```

`npm run build` runs `scripts/generate-assets.mjs` first. It normalises the
supplied marks in `public/brand/source/` (trim the transparent padding, recolour
black to `--ink` while keeping the artwork's own alpha), then derives the
favicons, the knockout wordmark and the WebP copies, renders the Open Graph
cards with the real mark composited on, converts the headshot, and writes
`src/lib/brand-manifest.json` so components get intrinsic image dimensions
rather than hard-coded ones. It never modifies anything in `source/`.

If `source/` is ever empty it falls back to drawing stand-in artwork
(`scripts/brand-svg.mjs`, set in Poppins SemiBold via opentype.js) so the site
still builds.

`npm run verify` checks, against `dist/`: body copy present with JS disabled,
unique titles and descriptions within length, canonical and Open Graph tags,
JSON-LD types per route, prohibited content, heading order and landmarks, alt
text, the machine-readable files, form wiring, and that the client-supplied
values reached the built pages. It exits non-zero on failure, so it can gate a
deploy.

Structured data is assembled in `src/lib/schema.ts` as a single `@graph` per
page with stable `@id`s. Deliberate omissions, which should stay omitted: no
`alumniOf` on the Person node, no `offers` or price fields on the Service nodes.

Content lives in a content collection defined in `src/content.config.ts`.
`/llms.txt` and `/rss.xml` are generated routes, not static files, so both pick
up new posts with no manual step.

### Deploying

Netlify, building from this repo. Build command `npm run build`, publish
directory `dist`. Headers and caching are in `netlify.toml`.

The Netlify project is `sonoramethod`. Leave the **base directory** blank —
this repo is the whole site. Live at `https://sonoramethod.netlify.app` until
the domain is pointed at it.

The project currently requires **team SSO login** to view, so you can see it
while signed in to Netlify but nobody else can, and no search engine can crawl
it. That is the right setting while pages are still being rebuilt. Turn it off
when the site is ready to be public: Netlify → **sonoramethod** → Site
configuration → **Visitor access** → Access control.

DNS: use Netlify DNS for the apex domain and point `www` at it as a redirect.

**If a Netlify logo ever shows up instead of the site**, that is Netlify
answering for a hostname it does not have attached to this project — its own
"site not found" page, with its own favicon, none of it yours. The usual cause
is `www`. Check Netlify → **sonoramethod** → Domain management and make sure
both `sonoramethod.com` and `www.sonoramethod.com` are listed. `netlify.toml`
already redirects www to the apex, but that only runs once Netlify answers for
www at all.
HTTPS provisions itself through Let's Encrypt once DNS resolves.

---

## After launch

1. **Verify the site in Google Search Console and Bing Webmaster Tools**, and
   submit `https://sonoramethod.com/sitemap-index.xml` to both.
2. **Update your LinkedIn** — the profile still lists a role as "Present".
3. **Form the business entity before signing a client contract.** A DBA under an
   existing LLC is possible, but it does not separate liability between the two
   businesses and it puts the other entity's name on your contracts and W-9.
   Worth thirty minutes with a small-business attorney. *(This is not legal
   advice.)*
4. **Have a lawyer review one master services agreement template.** Once, not per
   client.

---

## Who to ask

For anything in this file that does not behave as described, or anything that
needs a developer, start with whoever handed this repository over. The three
places worth checking first:

- **Netlify dashboard** — build failures, form submissions, DNS, HTTPS.
- **`npm run verify` output** — it names the page and the problem.
- **The Netlify build log** — it names the file and the line.
