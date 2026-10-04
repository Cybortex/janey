export const SITE = {
  name: "Janey Radiance Salon & Spa",
  short: "Janey Radiance",
  tagline: "Your one-stop beauty haven",
  slogan: "Get to glow differently with us",
  address: "164 Herbert Macaulay Way, Adekunle Sabo, Yaba, Lagos",
  phones: [{ label: "0810 554 9826", tel: "+2348105549826" }],
  wa: "https://api.whatsapp.com/send?phone=2348105549826",
  ig: "", // TODO: add the Instagram profile URL
  fb: "", // TODO: add the Facebook page URL (leave "" to hide)
  map: "https://www.google.com/maps/search/?api=1&query=164+Herbert+Macaulay+Way+Adekunle+Yaba+Lagos",
  embed: "https://www.google.com/maps?q=164+Herbert+Macaulay+Way+Adekunle+Yaba+Lagos&output=embed",
};

// TODO: confirm hours with the owner (taken from the Google listing)
export const HOURS: [string, string][] = [
  ["Monday to Thursday", "9:00 AM – 7:00 PM"],
  ["Friday", "10:00 AM – 7:00 PM"],
  ["Saturday", "9:00 AM – 7:00 PM"],
  ["Sunday", "Bookings only"],
];

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Contact Us" },
];

export type Cat = "women" | "men" | "skin";
export const CATS: { id: Cat | "all"; label: string }[] = [
  { id: "all", label: "All" }, { id: "women", label: "Women" }, { id: "men", label: "Men" }, { id: "skin", label: "Skin & Body" },
];

export type Service = { slug: string; name: string; blurb: string; cats: Cat[]; price?: string };
// TODO: owner to confirm the full list, prices and durations. image: /public/images/service-<slug>.jpg
export const SERVICES: Service[] = [
  { slug: "braids", name: "Braids & Styling", blurb: "Neat, long-lasting braids and styles.", cats: ["women"] },
  { slug: "mens-plaiting", name: "Men's Plaiting", blurb: "Clean cornrows and plaits, done neatly.", cats: ["men"] },
  { slug: "haircut", name: "Haircuts", blurb: "Sharp, clean cuts for men and women.", cats: ["women", "men"] },
  { slug: "dreadlocks", name: "Dreadlocks Care", blurb: "Maintenance and care for your locs.", cats: ["women", "men"] },
  { slug: "nails", name: "Nail Care", blurb: "Polished, tidy nails.", cats: ["women"] },
  { slug: "facials", name: "Facials", blurb: "Cleansing, glow-boosting skin care.", cats: ["skin"] },
  { slug: "body-smoothing", name: "Body Smoothing", blurb: "Smoother, softer-looking skin.", cats: ["skin"] },
  { slug: "waxing", name: "Waxing", blurb: "Clean, smooth results.", cats: ["skin"] },
  { slug: "massage", name: "Massage & Spa", blurb: "Body massage to unwind.", cats: ["skin"] },
];

// landing pages at /offers/<slug>; image: /public/images/offer-<slug>.jpg
// No discounts here until the owner approves one.
export const OFFERS: Record<string, { title: string; h: string; p: string; points: string[]; service: string }> = {
  braids: {
    title: "Braids & styling", h: "Neat braids, booked in a minute",
    p: "Pick your style, your time and book. Send us a photo of the look you want.",
    points: ["Choose your style and time online", "Send a reference photo on WhatsApp", "Experienced stylists in Yaba", "Your slot is held for you"],
    service: "Braids & Styling",
  },
  men: {
    title: "For men", h: "Fresh cuts and neat plaits for men",
    p: "Haircuts, plaiting and dreadlocks care in a clean, relaxed space in Yaba.",
    points: ["Haircuts and men's plaiting", "Dreadlocks care", "Book a slot, skip the wait", "Skin and massage services too"],
    service: "Haircuts",
  },
  facials: {
    title: "Facials", h: "Get to glow with a facial",
    p: "Cleansing, skin-focused care to leave your face fresh and bright.",
    points: ["Skin care for women and men", "Calm, clean treatment room", "Pair with massage or waxing", "Book your time online"],
    service: "Facials",
  },
  "body-smoothing": {
    title: "Body smoothing", h: "Smoother, softer-looking skin",
    p: "A body smoothing treatment to leave your skin feeling its best.",
    points: ["Treatment tailored to your skin", "Pair with a facial or massage", "Private, comfortable room", "Book your time online"],
    service: "Body Smoothing",
  },
};

// Add real reviews here. The reviews section only renders when this has items.
export const REVIEWS: { name: string; text: string }[] = [];
