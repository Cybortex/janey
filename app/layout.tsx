import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyBar from "@/components/StickyBar";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { SITE } from "@/lib/site";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-cormorant" });
const sans = Jost({ subsets: ["latin"], variable: "--font-jost" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Janey Radiance Salon & Spa | Hair, Nails, Facials & Massage in Yaba, Lagos", template: "%s | Janey Radiance" },
  description: "Braids, haircuts, nails, facials, waxing, body smoothing and massage for women and men in Yaba, Lagos. Get to glow differently.",
  openGraph: {
    title: "Janey Radiance Salon & Spa | Yaba, Lagos",
    description: "Braids, haircuts, nails, facials, waxing, body smoothing and massage for women and men in Yaba, Lagos.",
    url: "https://janeyradiance.com",
    siteName: "Janey Radiance Salon & Spa",
    locale: "en_NG",
    type: "website",
  },
};
export const viewport: Viewport = { viewportFit: "cover", themeColor: "#3a1026" };

const ld = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  name: SITE.name,
  image: "https://janeyradiance.com/images/hero-salon.jpg",
  telephone: SITE.phones[0].tel,
  url: "https://janeyradiance.com",
  priceRange: "₦₦",
  address: {
    "@type": "PostalAddress",
    streetAddress: "164 Herbert Macaulay Way, Adekunle Sabo, Yaba",
    addressLocality: "Lagos",
    addressRegion: "Lagos State",
    postalCode: "101212",
    addressCountry: "NG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 6.4969,
    longitude: 3.3784,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "10:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "10:00",
      closes: "18:00",
      description: "By advance booking only",
    },
  ],
  sameAs: [SITE.ig, SITE.fb].filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <ConvexClientProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <div className="h-14 md:hidden" aria-hidden />
          <StickyBar />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
