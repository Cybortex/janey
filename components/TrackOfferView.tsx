"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TrackOfferView({ slug }: { slug: string }) {
  const trackEvent = useMutation(api.events?.trackEvent);

  useEffect(() => {
    if (trackEvent) {
      trackEvent({
        type: "view_offer",
        target: slug,
        source: typeof window !== "undefined" ? window.location.search : undefined,
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
      }).catch(() => {});
    }
  }, [slug, trackEvent]);

  return null;
}
