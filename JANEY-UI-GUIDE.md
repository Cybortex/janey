# Janey Radiance Salon & Spa: Next.js + Tailwind v4 UI

UI only. No backend yet. The booking form opens WhatsApp with the request filled in.

## Setup

```bash
npx create-next-app@latest janey --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*"
cd janey
```

Copy `app/`, `components/`, `lib/` and `public/images/` over the generated project (replace existing files). Tailwind v4 is configured in `app/globals.css` (`@import "tailwindcss"` + `@theme` tokens), and create-next-app sets up `@tailwindcss/postcss`. Run `npm run dev`, then `npm run build` before you deploy.

Optional: set `NEXT_PUBLIC_SITE_URL` in `.env.local` to the live domain.

## Colours (estimated from the logo; confirm with the owner)

| Token | Hex | Use |
|---|---|---|
| `pink` | #FF4FA0 | Hero and closing band |
| `blush` | #FFF1F6 | Page background |
| `plum` | #3A1026 | Text, footer, mobile bar |
| `rose` | #D6246E | Small pink text, hover |
| `gold` | #D4AF6A | Main CTA buttons, borders, lines |
| `gold-deep` | #A67C2E | Gold text on light backgrounds |
| `line` | #F3D2E1 | Dividers, image placeholders |

## Images: exact filenames

Drop into `public/images/`. Until a file exists, its slot shows a pale pink block; it appears live as soon as you add it. Names are case-sensitive.

| Filename | Size | Where |
|---|---|---|
| `logo.png` | 512x512, transparent | Header |
| `hero-salon.jpg` | 1600x2000 (4:5) | Home hero, in a gold arch |
| `men-feature.jpg` | 1200x800 (3:2) | Home "For men" strip |
| `gallery-1.jpg` to `gallery-6.jpg` | 1000x1000 (1:1) | Home "Recent work". Mix women's and men's work. |
| `team-photo.jpg` | 1920x1080 (16:9) | Team page |
| `location-front.jpg` | 1200x800 (3:2) | Contact page entrance photo |
| `offer-braids.jpg` | 1200x900 (4:3) | Offer page and Home card |
| `offer-men.jpg` | 1200x900 | Offer page and Home card |
| `offer-facials.jpg` | 1200x900 | Offer page and Home card |
| `offer-body-smoothing.jpg` | 1200x900 | Offer page and Home card |
| `service-braids.jpg` | 800x800 | Services row |
| `service-mens-plaiting.jpg` | 800x800 | Services row |
| `service-haircut.jpg` | 800x800 | Services row |
| `service-dreadlocks.jpg` | 800x800 | Services row |
| `service-nails.jpg` | 800x800 | Services row |
| `service-facials.jpg` | 800x800 | Services row |
| `service-body-smoothing.jpg` | 800x800 | Services row |
| `service-waxing.jpg` | 800x800 | Services row |
| `service-massage.jpg` | 800x800 | Services row |

Also add `app/icon.png` (512x512 favicon) and `app/opengraph-image.jpg` (1200x630 for WhatsApp link previews).

Use only photos the owner has permission to share.

## Pages

- `/` Home: pink hero with gold-arch image, proof strip, offer cards, "For men" strip, gallery, reviews (hidden until added), hours and location, closing call to action.
- `/services`: tabs All, Women, Men, Skin & Body. Deep link with `/services?cat=men`.
- `/team`, `/contact`, `/book` (supports `?service=Haircuts`).
- `/offers/braids`, `/offers/men`, `/offers/facials`, `/offers/body-smoothing`: landing pages for Instagram bio and ads.

## Edit content in `lib/site.ts`

Contact details, hours, services, offers, reviews. Anything not confirmed is a TODO there.

## Motion (all in `app/globals.css`, off for reduced-motion users)

Gold line drawing under headings (`.rule`), slow shine on gold buttons (`.shine`), fade-up on scroll (`.reveal`, scroll-driven where supported), line-art lotus divider (`components/Divider.tsx`).

## Design and conversion decisions

- 80/20 audience: neutral, female-led headline; a dedicated "For men" strip and landing page; Women / Men / Skin & Body tabs; men's work in the gallery.
- Gold is for the main call to action and borders, so the action stands out against pink.
- Mobile first: sticky Call / WhatsApp / Book bar, no-JS hamburger menu, safe-area padding.
- One action per page: book, call or WhatsApp.
- No discount is shown. Add an offer only after the owner approves it.

## TODO from the owner

- Instagram and Facebook URLs (set `ig` and `fb` in `SITE`; the links hide while empty).
- Full services list, prices and durations (confirm "Dreadlocks Care", which came from the Google listing).
- Confirm opening hours and the Sunday booking rule.
- Photos, reviews, stylist names and an approved first-visit offer.

## Next phase

Real booking (Convex): service durations, stylist choice, double-booking prevention, Paystack deposit for long braiding slots, reminders, owner dashboard and click tracking.
