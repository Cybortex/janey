import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Photo from "@/components/Photo";
import { OFFERS, SITE } from "@/lib/site";
import { btn, btnLine } from "@/lib/ui";
import TrackOfferView from "@/components/TrackOfferView";

export function generateStaticParams() { return Object.keys(OFFERS).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const o = OFFERS[(await params).slug];
  return o ? { title: o.title, description: o.p } : {};
}

// One offer, one action. Use these URLs as ad and Instagram bio links.
export default async function Offer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const o = OFFERS[slug];
  if (!o) notFound();
  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <TrackOfferView slug={slug} />
      <Photo src={`offer-${slug}.jpg`} alt={o.title} priority sizes="(min-width:768px) 768px, 100vw" className="aspect-[4/3] rounded-3xl border-2 border-gold" />
      <h1 className="rule mt-8 font-display text-4xl leading-tight font-semibold md:text-6xl">{o.h}</h1>
      <p className="mt-4 text-lg text-plum/80">{o.p}</p>
      <ul className="mt-6 grid gap-2">
        {o.points.map((p) => <li key={p} className="flex gap-3 border-b border-line pb-2"><span className="text-gold-deep">✦</span>{p}</li>)}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/book?service=${encodeURIComponent(o.service)}`} className={btn}>Book this now</Link>
        <a href={SITE.wa} target="_blank" rel="noopener noreferrer" className={btnLine}>Ask on WhatsApp</a>
      </div>
    </article>
  );
}
