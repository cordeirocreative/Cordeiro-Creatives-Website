# Cordeiro Creatives — Website

Static site. No build step, no dependencies. Three files plus assets.

```
site/
  index.html      page structure and copy
  styles.css      branding, layout, responsive rules
  script.js       mobile nav, scroll reveals, contact form
  serve.js        local dev server (node only, no npm install)
  assets/
    wordmark-light.png   serif wordmark for dark backgrounds  (header, footer)
    wordmark-dark.png    serif wordmark for light backgrounds
    logo-light.png       circle badge for dark backgrounds    (about card)
    logo-dark.png        circle badge for light backgrounds
    favicon-32.png       browser tab icon
    apple-touch-icon.png iOS home screen icon
    social-card.png      Open Graph / link preview image
    video/hero.mp4       hero + flight-log clip
```

## Preview locally

```bash
node serve.js
```

Then open <http://localhost:5173>.

Opening `index.html` directly by double-clicking mostly works, but the video
and Google Fonts behave better over HTTP. Use the server.

---

## Before launch — the real checklist

### 1. Connect the contact form (required)

Right now the form opens the visitor's email client with everything
pre-filled. That works with zero setup, but you lose anyone who does not have
a mail client configured, and nothing gets logged.

To fix, open `script.js` and change **one line at the top**:

```js
const FORM_ENDPOINT = 'https://formspree.io/f/YOURFORMID';
```

Options, easiest first:

| Service | Free tier | Notes |
|---|---|---|
| **Formspree** | 50 submissions/mo | Works on any host. Sign up, create a form, paste the URL. |
| **Netlify Forms** | 100/mo | Only if you host on Netlify. Also add `netlify` to the `<form>` tag. |
| **Basin** | 100/mo | Similar to Formspree. |

Once set, the form POSTs directly and shows a success message without leaving
the page. No other code changes needed.

### 2. Replace the flight-log placeholders

Four of the five tiles in the **Work** section are placeholders reading
"In the cut". They are styled to look deliberate rather than broken, but they
should become real clips.

To turn a placeholder into a live tile, add `is-live`, drop in a video, and add
the scrim:

```html
<article class="log-card is-live reveal">
  <video class="log-video" autoplay muted loop playsinline preload="metadata">
    <source src="assets/video/glades.mp4" type="video/mp4" />
  </video>
  <div class="log-scrim" aria-hidden="true"></div>
  <div class="log-body">
    <span class="log-coord">42.2001&deg;N 70.7156&deg;W</span>
    <h3>The Glades</h3>
    <p>Coastline flyover</p>
  </div>
</article>
```

Then delete that tile's `<span class="log-status">In the cut</span>`.

**Export settings for web clips** — this matters, see the note below:

- 1080×1920 (vertical) or 1920×1080 (horizontal)
- H.264, 8–12 seconds, **no audio**
- Target 3–6 MB per clip
- Loop-friendly: start and end on similar framing

### 3. Confirm the hero footage

`assets/video/hero.mp4` came from the old site as `boston-skyline-hero.mp4`,
but the footage is a **coastal village, not the Boston skyline**. It is
currently labelled "South Shore Coastline" in the flight log. Confirm the
actual location and rename the label.

It is also **1280×2276 (vertical)**, which is why the hero frame and the first
flight-log tile are both portrait. If you swap in horizontal footage, change
`.frame`'s `aspect-ratio` in `styles.css` and drop the `grid-row: span 2` on
`.log-card:first-child`.

### 4. Verify before you publish

- [ ] Every claim on the page is true and approved for public use
- [ ] The Instagram link works: <https://www.instagram.com/cordeirocreatives/>
- [ ] `chase@cordeirocreatives.com` is live and monitored
- [ ] Add Google Analytics / Search Console
- [ ] Add Meta Pixel if you plan to run ads
- [ ] Submit a sitemap once the domain is live

---

## Hosting

Deploys as-is to Netlify, Vercel, Cloudflare Pages, or GitHub Pages — drag the
`site/` folder in. No build command, no framework.

Note: `serve.js` is for local preview only. Hosts ignore it.

---

## Design notes

**Colours** are derived from the logo. The brand blue `#0057D9` was sampled
directly from the badge PNG. On dark backgrounds it is too low-contrast for
text, so `--blue-bright #5B8CFF` is used for headings, links, and eyebrows,
while the true brand blue stays on buttons where it sits against white text.

**Type** is Space Grotesk (headings), Inter (body), IBM Plex Mono (telemetry,
eyebrows, coordinates). The mono is what carries the aviation feel — the
lat/long strip, the flight-log coordinates, the `REC` tag.

**The telemetry motif** is deliberate: it signals drone work before a visitor
reads a single word of copy.

**Accessibility**: `prefers-reduced-motion` disables all animation and reveals,
focus states are visible on every interactive element, and the mobile nav
closes on Escape and outside-click.
