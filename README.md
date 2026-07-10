# Corset Atelier — Website

Static site (plain HTML/CSS/JS, no build step, no backend). Deploys as-is to Vercel or GitHub Pages.

## Structure so far (Phase 0, 1, 3 + 4)

```
corset-atelier/
├── index.html               Home page
├── collections.html         Collections hub — filterable product grid
├── product.html             Product detail — gallery zoom, variants, Buy/Query modals
├── wishlist.html             Saved products page
├── custom-builder.html       Six-step made-to-measure order wizard
├── our-story.html            Brand story + values
├── custom-order-policy.html  Deposit / production / cancellation terms
├── size-guide.html           Size chart + how-to-measure
├── faqs.html                  Accordion FAQ, grouped by topic
├── shipping.html              Shipping, payment, returns policy
├── contact.html                Contact info + WhatsApp-connected form
├── privacy-policy.html         Privacy policy (general template — see Phase 11a notes)
├── terms.html                  Terms of service (general template — see Phase 11a notes)
├── 404.html                    Custom not-found page
├── sitemap.xml                 Search engine sitemap (update URLs if domain changes)
├── robots.txt                  Crawler access + sitemap pointer
├── site.webmanifest            Add-to-home-screen app config
├── api/
│   └── chat.js                Vercel serverless function — proxies to Gemini, holds the API key
├── data/
│   └── products.json        Single source of truth for all products
├── css/
│   ├── tokens.css           Colors, type, spacing — the design system
│   ├── base.css             Reset, typography, buttons, "lace line" signature element
│   ├── header-footer.css    Sticky header + footer
│   ├── home.css              Hero slider, collections grid, story, insta strip
│   ├── collections.css       Filter bar, product grid, product cards
│   ├── product.css           Gallery zoom, variant selectors, buy/query modals
│   ├── custom-builder.css    Step wizard, option cards, measurement form
│   ├── info-pages.css        Value grids, process steps, size table, FAQ accordion, contact layout
│   └── ai-widget.css          Floating chat button + panel
├── js/
│   ├── main.js               Header scroll, mobile drawer, wishlist, shared product-card renderer, color map
│   ├── slider.js              Hero autoplay slider (3s interval)
│   ├── collections.js         Category filtering + sorting
│   ├── product.js             Gallery, variants, Buy/Query → WhatsApp
│   ├── wishlist.js            Renders saved products, live-updates on removal
│   ├── custom-builder.js      Six-step wizard state, validation, WhatsApp submission
│   ├── faq.js                  FAQ accordion toggle
│   ├── contact.js              Contact form → WhatsApp
│   ├── ai-widget.js            Injects the chat widget on every page, talks to /api/chat
│   └── reveal.js                Scroll-reveal micro-interaction (respects reduced-motion)
├── .env.example                Template for your Gemini API key (local dev only)
└── assets/images/
    └── favicon.svg              Brand eyelet-mark favicon
```

Every page includes `js/ai-widget.js`, which injects its own markup and
stylesheet — you never need to touch the HTML to add the widget elsewhere.

## How the Custom Builder works

- Six steps, all on one page (`custom-builder.html`), shown/hidden by JS —
  no reloads. State (type, fabric, color, sizing, contact details) lives in
  memory until the final step.
- **Sizing** offers a toggle between standard sizes (XS–XXL) and custom
  measurements (bust/waist/hip/torso in inches) for a true made-to-measure order.
- Each step validates before allowing "Continue" — you can't reach Review
  with missing selections.
- **Review step** shows every selection back, restates the deposit/production/
  cancellation policy, and requires an explicit checkbox agreement before the
  WhatsApp message can be sent.
- Arriving from a product page via "Start Custom Build" carries the product
  name into the Notes field automatically (`custom-builder.html?base=...`).

## How the product pages work

- **`data/products.json`** is the only place product info lives — id, name,
  category, price, comparePrice, fabric, colors, sizes, weight, description,
  and a `swatch` + `gallery` (3 placeholder images) per product. Add a new
  product by adding an object here; it shows up in Collections and gets a
  working detail page automatically at `product.html?id=your-id`.
- **Collections page** filters by `?cat=` in the URL and re-renders client-side.
- **Product page** reads `?id=` from the URL, finds the matching product, and
  renders everything — including "You May Also Like" (same category, excluding
  itself).
- **Wishlist** is one `localStorage` key (`ca_wishlist`) read/written from
  `main.js`, shared by the header badge, product cards, and the product page's
  heart button — toggle it anywhere and it's consistent everywhere.
- **Buy button** opens a modal (name/phone/email/address/city), then builds a
  formatted WhatsApp message with the product, chosen color/size, and those
  details, and opens `wa.me` with it prefilled — no backend involved.
- **Ask a Question button** opens a lighter modal (just a message + name/phone)
  and does the same — a prefilled WhatsApp query about that specific product.
- **Custom Build note** on the product page links to `custom-builder.html`
  (not built yet) with the product name passed along, so a customer can start
  a made-to-measure version of a piece they liked.

## Placeholder visuals

There's no product photography yet, so hero slides, collection tiles, and
product galleries use gradient placeholders in the brand colors instead of
images. Swap them out by:
1. Dropping real photos into `assets/images/`
2. In `data/products.json`, replacing a product's `swatch` and `gallery`
   entries with `url('assets/images/your-photo.jpg')` instead of a
   `linear-gradient(...)` value — the CSS already treats both the same way
   (`background: ...`), so no other code changes needed.
3. Doing the same for the hero slides in `index.html` (`.hero-bg` inline styles).

## Run locally

This site now fetches `data/products.json`, which browsers block over the
`file://` protocol (CORS). You need to serve it locally:
```bash
npx serve .
# or
python3 -m http.server 5500
```
Opening `index.html` directly by double-clicking will work, but
`collections.html` and `product.html` won't load products until served.

Note: `npx serve` and `python3 -m http.server` are plain static servers —
they won't run `api/chat.js`, so the AI widget will show its WhatsApp
fallback locally. To test the AI assistant itself before deploying, use
`vercel dev` instead (after `npm i -g vercel` and setting up `.env` per
the AI Assistant section below).

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New Project → Import** the repo.
3. Framework preset: **Other** (it's static — no build command, no output
   directory override needed; Vercel serves the root as-is).
4. Deploy. Done — every push to `main` auto-deploys.

Or via CLI from this folder: `npx vercel`.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repo.
2. Repo **Settings → Pages → Source**: select the branch (e.g. `main`) and
   root folder (`/`).
3. Save — GitHub gives you a `https://<username>.github.io/<repo>/` URL in
   a minute or two.

Both hosts work from the exact same files — no config differences needed
for a plain static site like this.

## What's next (per the phase plan)

- ✅ Phase 0: Foundation (design system, header, footer)
- ✅ Phase 1: Home page
- ✅ Phase 3: Collections hub + category filtering
- ✅ Phase 4: Product detail (gallery zoom, variants, Buy/Query → WhatsApp)
- ✅ Phase 5: Wishlist page
- ✅ Phase 6: Custom Builder
- ✅ Phase 7: Our Story, Custom Order Policy, Size Guide, FAQs, Shipping, Contact
- ✅ Phase 8: AI assistant widget (Gemini)
- ✅ Phase 9: Polish pass
- ✅ Phase 10a: Tactility & motion foundation
- ✅ Phase 10b: Typography & spacing pass
- ✅ Phase 10c: Image treatment system
- ✅ Phase 10d: Product interactions
- ✅ Phase 10e: Editorial storytelling section
- ✅ Phase 11a: Critical fixes

## What the polish pass (Phase 9) covered

**Accessibility**
- Fixed a real contrast issue: brass/gold text (category labels, table
  headers, step numbers) on light backgrounds was around 3.3:1 — below the
  4.5:1 WCAG AA minimum for text. Added `--metal-text`, a darker brass, used
  anywhere gold sits on a light background. The brighter brass stays for
  icons/borders and anywhere it's already on a dark background, where it
  was already well above contrast requirements.
- Mobile drawer, both product modals, and the AI chat panel now: trap
  focus sensibly (focus moves in on open, returns to the trigger on
  close), close on **Escape**, and carry proper `role="dialog"` /
  `aria-modal` / `aria-expanded` / `aria-controls` attributes.
- FAQ accordion buttons now expose `aria-expanded` and `aria-controls` per
  item, so screen readers announce open/closed state correctly.
- AI chat messages live in an `aria-live="polite"` region, so replies are
  announced automatically without the visitor needing to re-focus the chat.
- Added a proper favicon (`assets/images/favicon.svg`, the brand's eyelet
  mark) — a small thing, but it also removes a wasted request browsers
  otherwise make for a missing `/favicon.ico`.

**Responsive**
- Added extra breakpoints for very narrow phones (≤400px) on the Custom
  Builder's option cards and color swatches, so they don't feel cramped on
  older/smaller devices.
- Re-checked every grid/flex layout added across Phases 3–8 for stacking
  behavior at mobile widths — all already had breakpoints from when they
  were built, this pass confirmed nothing was missed.

**Micro-interactions**
- Added a lightweight scroll-reveal (`js/reveal.js`) — collection tiles,
  story sections, value cards, process steps, and measurement steps now
  fade up gently as they enter the viewport, rather than all being static.
  It's skipped entirely for visitors with `prefers-reduced-motion` set, and
  intentionally left off dynamically-rendered content (product cards)
  since those already have hover/interaction cues and async render timing
  would fight with it.

**Performance**
- Confirmed Google Fonts are already loaded with `&display=swap` (was set
  up correctly back in Phase 1) — text renders immediately in a fallback
  font rather than staying invisible while fonts load.
- The favicon fix above also removes one unnecessary failed network
  request per page load.

## Setting up the AI Assistant (Phase 8)

The assistant is a small chat widget (bottom-right, every page) that talks
to Gemini through a Vercel serverless function — this keeps your API key
off the browser entirely.

**1. Get a free Gemini API key**
Go to https://aistudio.google.com/apikey and create one (no cost on the
free tier for this use case).

**2. Add it to Vercel**
In your Vercel project: **Settings → Environment Variables** → add
`GEMINI_API_KEY` with your key as the value → redeploy.
(For local testing with `vercel dev`, copy `.env.example` to `.env` and
fill it in instead.)

**3. That's it**
`api/chat.js` reads the key server-side, feeds Gemini your live product
catalog plus your sizing/shipping/custom-order policies, and returns
answers to the widget. Nothing else to configure.

### Important: this only works on Vercel

`api/chat.js` is a **Vercel serverless function** — GitHub Pages can't run
server code, so the endpoint won't exist there. The widget is built to
handle this gracefully: if the API call fails, it shows a "message us on
WhatsApp instead" prompt rather than breaking. So the rest of the site
still works fine on GitHub Pages — you'd just lose the live AI chat there.
If you want AI chat on GitHub Pages too, the only way is switching to a
client-side API key (visible in the browser, restrictable by domain in
Google AI Studio) — ask if you'd like that version instead.

### What the assistant knows

It's given your full product catalog (`data/products.json`) plus your
sizing chart, materials/care info, custom order deposit policy, pricing
range, delivery times, and payment method — all defined in the system
prompt inside `api/chat.js`. Update that file's `SYSTEM_PROMPT` whenever
your policies change; the catalog itself stays in sync automatically since
it's read from `products.json` on every request.

## Phase 10a — Tactility & motion foundation

A curated subset of a much larger "maximalist luxury" request — see the
conversation history for the full reasoning on what was kept vs. skipped
(the short version: real luxury fashion sites are quiet, so glass/particles/
glow were deliberately left out in favor of restraint).

**Button depth & press** (`css/base.css`) — primary buttons (`.btn-primary`)
now have a real bottom-edge shadow that compresses on click and grows on
hover, like a physical button. Outline buttons get a lift + shadow on hover
and a clean scale-down press. Every other button/icon on the site (modal
close, FAQ toggle, size/color selectors, send button, etc.) gets a light
universal press-scale via `button:not(.btn):active`.

**Magnetic hover** (`js/magnetic.js`) — primary CTA buttons and the AI chat
FAB subtly pull toward the cursor on hover (max 10px, restrained). It
deliberately clears its own inline transform on `mousedown` so the CSS
press animation above can take over cleanly — the two systems don't fight.
Skipped for touch devices and `prefers-reduced-motion`.

**Staggered reveals** — two mechanisms depending on content type:
- `js/reveal.js` handles *static* grids (collection tiles, value cards,
  process steps, FAQ items, etc.) — the whole container is observed, and
  once it scrolls into view, children cascade in with an increasing delay.
- `window.CorsetAtelier.staggerReveal()` (in `main.js`) handles
  *dynamically-rendered* grids — product cards from `collections.js`,
  `product.js`'s related products, and `wishlist.js` all call this right
  after building their grid, since that content usually renders already
  in view rather than being scrolled to.

**Smooth scroll** (`js/smooth-scroll.js`) — uses [Lenis](https://github.com/darkroomengineering/lenis)
loaded from a CDN, tuned conservatively (no bounce/overshoot) so it's felt
rather than noticed. Only runs on non-touch devices with `hover: hover`
support, and does nothing at all if `prefers-reduced-motion` is set or if
the CDN fails to load — native scroll is the fallback in both cases, so
there's no hard dependency on it working.

## Phase 10b — Typography & spacing pass

**Bigger, more editorial type scale** (`css/tokens.css`) — hero headline
size increased (`--fs-hero`: up to 7.5rem at wide viewports, was 6.5rem),
page-title headings increased (`--fs-h2`: 4.25rem, was 3.75rem), and
letter-spacing on large display type tightened (`--ls-tight`: -0.02em, was
-0.01em) — the standard editorial move for big headlines, where a little
negative tracking makes large serif type feel more considered rather than
loose.

**Accent color used sparingly** — one word per major heading now uses
`.italic-accent` (italic + accent color), across the homepage hero slides,
every page-title heading, and two homepage section headings. Deliberately
*not* applied to every heading — the "sparingly" was the point. One real
bug caught and fixed here: the accent color (oxblood, a dark red) has poor
contrast against the dark hero backgrounds, so hero/page-title accents use
`--c-rose-dust` instead (same fix pattern already used for eyebrow labels
on dark backgrounds) — regular prose-section accents keep oxblood, which
has good contrast against the light page background.

**Spacing scale increased, not just patched** — rather than bumping
padding on individual sections one by one, the large-end tokens themselves
were increased (`--sp-7` through `--sp-10`), so every section gap, hero
padding, and card padding built on those tokens got measurably more
breathing room automatically, across all 11 pages, in one change. Values
stayed on 8px multiples throughout. A few specific cards (review summary,
policy highlights, modals) that were using the now-unchanged `--sp-6` got
bumped to `--sp-7` explicitly for more premium padding.

**Font loading** — added true italic weight 500 to the Google Fonts import
(`ital,wght@...;1,500`) so accent words at heading weight render as real
italic rather than the browser's synthetic slant.

## Phase 10c — Image treatment system

Built the *system* for luxury image treatment — since every image on the
site is still a CSS gradient placeholder, the actual payoff of this phase
will be much bigger once real product photography is in `assets/images/`
(see the note in the earlier "Placeholder visuals" section for how to
swap them in).

**Vignette** (`.img-vignette` pattern, `css/base.css`) — a soft inset
shadow that darkens the edges of a photo, drawing the eye to center. Uses
`box-shadow: inset` rather than an extra pseudo-element or wrapper div, so
it respects `border-radius` automatically and needed zero markup changes.
Applied to: collection tiles, product card thumbnails, the product detail
gallery, the Instagram strip, Our Story's images, and the Size Guide's
measurement illustrations.

**Grain texture** (`.has-grain`, `css/base.css`) — a very low-opacity
(3.5%) noise overlay for dark sections, generated from an inline SVG
turbulence filter (no image file needed). `pointer-events: none` so it
never blocks clicks, and the opacity is low enough that it doesn't need
z-index management relative to text — even overlapping slightly, it's
imperceptible. Applied to the homepage hero, every page-title hero
(`.collections-hero` / `.builder-hero`), the contact/newsletter bands, and
the footer, across all 11 pages.

**Gallery crossfade** (`product.html` / `css/product.css` / `js/product.js`)
— the product image gallery previously swapped its background instantly
on thumbnail click. Rebuilt as two stacked layers that crossfade opacity
(550ms) when you pick a different thumbnail — including a nice side
effect: the very first image on page load now fades in from nothing
rather than just appearing. The click-to-zoom magnifier was rewired to
target whichever layer is currently active, so it keeps working exactly
as before, now layered on top of the crossfade system.

**Hero cursor spotlight** — a warm, restrained radial glow that follows
the cursor within the homepage hero only (not applied anywhere else, per
the "sparingly" guidance from Phase 10b). Fades in on hover, sits above
the slide image but below the headline text so it reads as light on the
surface rather than a glow over the words. Skipped entirely on touch
devices and under `prefers-reduced-motion`.

**Floating hero accent** — one small decorative element (a double-ring
echo of the brand's eyelet motif) positioned near the CTA area of the
homepage hero, gently bobbing on a slow 7s loop. Deliberately singular —
not a particle field. Hidden on mobile and disabled under
`prefers-reduced-motion`.

## Phase 10d — Product interactions

**Quick View** (`js/quick-view.js`, `css/quick-view.css`) — clicking "Quick
View" on any product card (Collections, Wishlist, or Product page's
related grid) opens a modal with the image, price, description, color/size
selection, and a Buy Now / wishlist toggle — without leaving the grid.
This replaces what used to be a plain "View Details" link on card hover.
Built as a self-contained component with its own `qv-` prefixed class
names rather than reusing `.pd-*` / `.modal-*` from `product.css`, since
it's injected on three pages that don't all load the same stylesheets —
zero risk of relying on a class that isn't defined somewhere. It listens
via event delegation on `document`, so it works correctly for product
cards that don't exist yet at page load (all three grids render after a
fetch).

One deliberate scope decision: Quick View's "Buy Now" opens WhatsApp
directly with the product/variant details and asks to finalize delivery
info there, rather than duplicating the full name/address/city form inside
a modal-on-top-of-a-modal. The full guided form still lives on the product
page — "View Full Details & Photos" links straight there.

**Wishlist confirmation pulse** (`css/base.css`) — a quick, satisfying
bounce animation on the heart icon when something is added to the
wishlist, instead of the color just snapping to filled. One shared
keyframe (`wishlistPulse`), wired into all three places wishlist toggling
happens: product cards (`bindWishlistButtons` in `main.js`, so it covers
Collections/Wishlist/related-products automatically), the product detail
page's dedicated heart button, and Quick View.

**Buy confirmation state** (`product.html` / `css/product.css` /
`js/product.js`) — submitting the order form used to open WhatsApp and
close the modal in the same instant, which could feel like nothing
happened. Now the form is replaced with a brief checkmark + "Order ready —
opening WhatsApp..." confirmation for 700ms before WhatsApp opens and the
modal closes — enough to register as a clear success moment without
feeling like a delay.

**Thin accent border on card hover** (`css/collections.css`) — one honest
simplification here: the original ask was a "gradient border," but a true
multi-stop gradient border on a rounded-corner element is unreliable
across browsers (border-image doesn't respect border-radius consistently).
Used a thin (1px) brass-toned outline instead — visually equivalent at
that weight, and fully reliable. Applied on `.product-card:hover`.

## Phase 10e — Editorial storytelling section

Added a full-width "philosophy" band to the homepage, between the
Collections grid and the Story teaser — the site previously went straight
from products to products with no moment for brand storytelling in
between.

**Structure**: an eyebrow ("The Philosophy"), a large editorial statement
headline with a sparing accent word, the lace-line divider motif, and
three short pillars — Handmade with Precision, Luxury Tailoring, Our
Atelier — laid out with hairline dividers between them rather than as
cards, so it reads as an editorial spread rather than another feature
grid (the site already has a card-grid treatment on Our Story; this
deliberately looks different). Closes with a link into Our Story for
anyone who wants the full narrative. The three pillars cascade in via the
same staggered-reveal system from Phase 10a.

**A bug caught mid-build**: I initially added an `on-dark` class directly
to the lace-divider inside this section, but the existing CSS rule
(`.on-dark .lace-divider`) expects `on-dark` on an *ancestor* element, not
the same one — so it silently wouldn't have applied anything. Fixed with a
correctly-scoped `.editorial-band .lace-divider` rule instead. Worth
knowing since it's the kind of thing that's easy to miss without visually
checking the result.

## Phase 11a — Critical fixes

**Account icon removed** — it linked to a non-existent `account.html`.
Since there's no login/cart system in this architecture (orders go
through WhatsApp/COD, no backend), a real account page didn't fit — and
repointing it to Wishlist would've just made two icons go to the same
place. Removed rather than faked.

**Newsletter form rewired, not just reskinned** — this was the more
important fix. The form previously showed a plain `alert()` claiming
you're "subscribed," with no actual mailing list behind it — a real
honesty problem, not just an ugly popup. Rather than give a fake feature
a nicer confirmation animation, it now does what every other form on this
site does: collects the email and sends it to you on WhatsApp to add
manually, with a proper confirmation state (checkmark + message) matching
the Buy modal pattern from Phase 10d.

**Custom 404 page** (`404.html`) — on-brand, with links back to Home and
Collections. Both Vercel and GitHub Pages automatically serve a file
named exactly `404.html` at the root for any unmatched route — no config
needed on either host.

**Privacy Policy & Terms of Service** (`privacy-policy.html`,
`terms.html`) — cover what data is collected (name/phone/address via
WhatsApp orders), how the wishlist's `localStorage` works, third-party
services in use (Google Fonts, WhatsApp, the Gemini AI assistant), COD
payment terms, and the custom-order deposit/cancellation policy. Both are
linked from every page's footer now. **Important**: these are general
templates, not legal advice — I'm not a lawyer, and there's a visible
disclaimer on both pages saying so. Have them reviewed by a qualified
professional before relying on them, especially if you ever sell outside
Pakistan or run ads (Meta/Instagram business verification often requires
a real privacy policy).

**Open Graph & social preview tags** — every page now has proper
`og:title`, `og:description`, `og:image`, and Twitter Card tags, computed
from each page's existing `<title>`/description so nothing had to be
hand-typed 14 times. Generated a branded 1200×630 preview image
(`assets/images/og-image.jpg`) so links shared on WhatsApp/Instagram/
Facebook now show a real image and description instead of a bare link.
**One real limitation**: `product.html`'s OG tags are generic ("Product —
Corset Atelier") since the actual product name is set client-side by
JavaScript after the page loads — most link-preview crawlers (including
WhatsApp's) don't execute JavaScript, so they'll see the static fallback.
Fixing this properly would need server-side rendering per product, which
is a real architecture change, not a quick patch — flagging honestly
rather than pretending it's solved.

**`sitemap.xml` + `robots.txt`** — lists all content pages for search
engines, using the GitHub Pages URL you shared. **If you deploy on a
different domain (e.g. a custom domain on Vercel), update the URLs in
both files** — they're currently hardcoded to
`https://abd-abdullah83.github.io/Corset-Atelier/`. Wishlist and the bare
`product.html` (no `?id=`) are deliberately excluded — one's personal/
empty by default, the other isn't a meaningful page without a product ID.

**App icons & manifest** — generated `apple-touch-icon.png` (180×180) and
Android icons (192×192, 512×512) matching the existing favicon design, plus
`site.webmanifest` so "Add to Home Screen" on mobile shows a proper icon
and name instead of a generic screenshot.
