import Link from "next/link";
import { HOURS, NAV, SITE } from "@/lib/site";

export default function Footer() {
  const a = "underline-offset-4 hover:underline";
  return (
    <footer className="border-t-2 border-gold bg-plum text-blush">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-4">
        <div>
          <p className="font-display text-3xl font-semibold">{SITE.short}</p>
          <p className="mt-1 text-gold">{SITE.tagline}</p>
          <p className="mt-4 text-blush/85">{SITE.address}</p>
        </div>
        <nav aria-label="Footer" className="grid content-start gap-2">
          {NAV.map((n) => <Link key={n.href} href={n.href} className={a}>{n.label}</Link>)}
          <Link href="/book" className={a}>Book Now</Link>
        </nav>
        <div className="grid content-start gap-2">
          {SITE.phones.map((p) => <a key={p.tel} href={`tel:${p.tel}`} className={a}>{p.label}</a>)}
          <a href={SITE.wa} target="_blank" rel="noopener noreferrer" className={a}>WhatsApp</a>
          {SITE.ig && <a href={SITE.ig} target="_blank" rel="noopener noreferrer" className={a}>Instagram</a>}
          {SITE.fb && <a href={SITE.fb} target="_blank" rel="noopener noreferrer" className={a}>Facebook</a>}
        </div>
        <dl className="grid content-start gap-1 text-sm">
          {HOURS.map(([d, h]) => <div key={d} className="flex justify-between gap-3"><dt>{d}</dt><dd className="text-blush/80">{h}</dd></div>)}
        </dl>
      </div>
      <p className="border-t border-blush/15 px-5 py-4 text-center text-sm text-blush/60">© {new Date().getFullYear()} {SITE.name}</p>
    </footer>
  );
}
