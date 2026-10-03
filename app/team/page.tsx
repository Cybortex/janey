import type { Metadata } from "next";
import Link from "next/link";
import Photo from "@/components/Photo";
import { btn, wrap } from "@/lib/ui";

export const metadata: Metadata = { title: "Meet the Team" };

export default function Team() {
  return (
    <section className={`${wrap} py-12`}>
      <h1 className="rule font-display text-5xl font-semibold md:text-6xl">Meet the Janey Radiance team</h1>
      <p className="mt-3 max-w-xl text-lg text-plum/75">The people behind your glow.</p>
      <Photo src="team-photo.jpg" alt="The Janey Radiance team" priority sizes="(min-width:1152px) 1112px, 100vw" className="mt-8 aspect-[16/9] rounded-3xl border-2 border-gold" />
      <div className="mt-8"><Link href="/book" className={btn}>Book with our team</Link></div>
    </section>
  );
}
