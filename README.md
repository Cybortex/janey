# Janey Radiance Salon & Spa

Official website and booking platform for **Janey Radiance Salon & Spa** located at 164 Herbert Macaulay Way, Adekunle Sabo, Yaba, Lagos.

Built with **Next.js 15 (App Router, TypeScript)**, **Tailwind CSS v4** (`@theme` in `app/globals.css`), **Convex** for real-time transactional booking and availability management, and **Paystack** for deposit processing.

---

## Features

- **Brand UI**: Blush background (`#FFF1F6`), hot pink (`#FF4FA0`), plum text (`#3A1026`), and soft gold (`#D4AF6A`). Cormorant Garamond & Jost typography.
- **Audience Balance**: 80% female, 20% male targeting with dedicated "For men" landing page and service tabs.
- **Mobile First**: Minimum 44px tap targets, sticky bottom action bar (Call, WhatsApp, Book) with zero layout shift.
- **Transactional Booking (Convex)**: Slot generator blocking appropriate duration (e.g. 180 min braiding slots), preventing double bookings across stylists and general chairs.
- **Sunday Rule**: Advance bookings only, flagged for manual salon manager review and approval.
- **Paystack Deposit Flow**: Server-side deposit initialization and HMAC SHA512 signature-verified webhook. Fallback to WhatsApp confirmation with booking reference.
- **Owner Dashboard (`/admin`)**: Mobile-optimized dashboard protected by secure authentication to review, approve/decline Sunday requests, reschedule, block dates, manage services and stylists, and view click attribution analytics.
- **Conversion Tracking & SEO**: First-party privacy-respecting Convex events tracker, `sitemap.ts`, `robots.ts`, and JSON-LD `HealthAndBeautyBusiness` schema with real operating hours.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
- `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL.
- `NEXT_PUBLIC_SITE_URL`: Domain URL (e.g. `https://janeyradiance.com`).
- `PAYSTACK_SECRET_KEY`: Paystack secret key from your Paystack dashboard.
- `ADMIN_SECRET`: Owner passphrase for accessing `/admin`.

### 3. Run Locally
```bash
# Terminal 1: Run Next.js
npm run dev

# Terminal 2: Run Convex (when deploying/syncing schema)
npx convex dev
```

### 4. Build and Lint Check
```bash
npm run lint
npm run build
```

---

## Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `PAYSTACK_SECRET_KEY`
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - `ADMIN_SECRET`
4. Deploy. In your Paystack Dashboard, set the Webhook URL to:
   `https://<your-vercel-domain>/api/paystack/webhook`

---

## Items Still Needed from the Owner

1. **Social URLs**:
   - Instagram profile link (`ig` in `lib/site.ts`).
   - Facebook page link (`fb` in `lib/site.ts`).
2. **Photography**:
   - High-resolution photos matching filenames specified in `JANEY-UI-GUIDE.md` dropped into `public/images/`.
3. **Services & Pricing Confirmation**:
   - Confirm official prices and durations for all 9 services.
   - Confirm whether "Dreadlocks Care" is offered.
   - Confirm deposit amount for long braiding sessions (currently defaulted to ₦5,000).
4. **Hours & Sunday Booking Confirmation**:
   - Confirm opening hours (Mon–Thu 9am–7pm, Fri 10am–7pm, Sat 9am–7pm, Sunday bookings only).
5. **Real Customer Reviews**:
   - Provide client testimonials for `REVIEWS` in `lib/site.ts`.
