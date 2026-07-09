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
