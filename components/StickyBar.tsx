"use client";

import Link from "next/link";
import { SITE } from "@/lib/site";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Mobile-only action bar: the fastest route to a call or booking.
export default function StickyBar() {
  const trackEvent = useMutation(api.events?.trackEvent);

  const handleTrack = (type: string, target?: string) => {
    if (trackEvent) {
      trackEvent({ type, target, source: "sticky_bar" }).catch(() => {});
    }
  };

  const c = "inline-flex min-h-[44px] items-center justify-center py-3 text-center font-medium";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 divide-x divide-blush/20 border-t border-gold bg-plum pb-[env(safe-area-inset-bottom)] text-blush md:hidden">
      <a
        href={`tel:${SITE.phones[0].tel}`}
        onClick={() => handleTrack("click_call", SITE.phones[0].tel)}
        className={c}
      >
        Call
      </a>
      <a
        href={SITE.wa}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleTrack("click_whatsapp", "salon_whatsapp")}
        className={c}
      >
        WhatsApp
      </a>
      <Link
        href="/book"
        onClick={() => handleTrack("click_book", "sticky_bar")}
        className={`${c} bg-gold text-plum`}
      >
        Book
      </Link>
    </div>
  );
}
