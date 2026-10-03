import type { Metadata } from "next";
import ServiceTabs from "@/components/ServiceTabs";
import { wrap } from "@/lib/ui";

export const metadata: Metadata = { title: "Services", description: "Braids, haircuts, nails, facials, waxing, body smoothing and massage for women and men in Yaba, Lagos." };

export default async function Services({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  return (
    <section className={`${wrap} py-12`}>
      <h1 className="rule font-display text-5xl font-semibold">Services</h1>
      <p className="mt-3 max-w-xl text-plum/75">For women and men. Pick a category, then book in a minute.</p>
      <ServiceTabs initial={cat} />
    </section>
  );
}
