import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";
import { wrap } from "@/lib/ui";

export const metadata: Metadata = { title: "Book Now" };

export default async function Book({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const q = await searchParams;
  return (
    <section className={`${wrap} py-12`}>
      <h1 className="rule font-display text-5xl font-semibold">Book your session</h1>
      <p className="mt-3 mb-8 text-plum/75">Pick a time and we confirm on WhatsApp.</p>
      <Suspense fallback={<div className="text-plum/70">Loading booking form...</div>}>
        <BookingForm initialService={q.service} />
      </Suspense>
    </section>
  );
}
